import { createClient } from 'redis';

// Get current time in SAST (South African Standard Time, UTC+2)
function getSASTTimestamp(): string {
  const now = new Date();
  // Format in SAST timezone
  return now.toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(',', '') + ' SAST';
}

// Create Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    
    await redisClient.connect();
  }
  
  return redisClient;
}

// Event types for weekender registration
export type WeekenderEventType = 
  | 'registration_started'
  | 'payment_in_progress'
  | 'payment_complete'
  | 'payment_cancelled'
  | 'payment_failed'
  | 'payment_expired'
  | 'session_expired'
  | 'waitlist_registration'
  | 'bootcamp_payment_in_progress';

export interface WeekenderEvent {
  sessionId: string;
  eventType: WeekenderEventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Log a weekender registration event
export async function logWeekenderEvent(
  sessionId: string,
  eventType: WeekenderEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  const client = await getRedisClient();
  
  const event: WeekenderEvent = {
    sessionId,
    eventType,
    timestamp: getSASTTimestamp(),
    metadata,
  };
  
  // Store event in a list keyed by session ID
  await client.rPush(`weekender:events:${sessionId}`, JSON.stringify(event));
  
  // Also store in a time-sorted set for ordering
  await client.zAdd('weekender:events:all', {
    score: Date.now(),
    value: JSON.stringify(event),
  });
  
  // Set session status
  await client.set(`weekender:status:${sessionId}`, eventType);
}

// Get the current status for a session
export async function getSessionStatus(sessionId: string): Promise<WeekenderEventType | null> {
  const client = await getRedisClient();
  const status = await client.get(`weekender:status:${sessionId}`);
  return status as WeekenderEventType | null;
}

// Get all events for a session
export async function getSessionEvents(sessionId: string): Promise<WeekenderEvent[]> {
  const client = await getRedisClient();
  const events = await client.lRange(`weekender:events:${sessionId}`, 0, -1);
  return events.map((e) => JSON.parse(e) as WeekenderEvent);
}

// Store member_ids for an order
export async function setOrderMemberIds(orderId: string, memberIds: number[]): Promise<void> {
  const client = await getRedisClient();
  await client.set(`weekender:order:${orderId}:members`, JSON.stringify(memberIds));
}

// Get member_ids for an order
export async function getOrderMemberIds(orderId: string): Promise<number[]> {
  const client = await getRedisClient();
  const data = await client.get(`weekender:order:${orderId}:members`);
  if (!data) return [];
  return JSON.parse(data) as number[];
}

// === TICKET QUEUE MANAGEMENT ===
const NOW_TICKET_LIMIT = 10;

// Add registration to the queue
export async function addToTicketQueue(orderId: string, spotCount: number): Promise<void> {
  const client = await getRedisClient();
  const timestamp = Date.now();
  
  // Add to sorted set (queue order)
  await client.zAdd('weekender:ticket:queue', { score: timestamp, value: orderId });
  
  // Store spot count for this order
  await client.set(`weekender:order:${orderId}:spots`, spotCount.toString());
}

// Get all orders in queue with their spot counts
export async function getTicketQueue(): Promise<Array<{ orderId: string; spots: number; timestamp: number }>> {
  const client = await getRedisClient();
  
  // Get all orders with scores (timestamps)
  const orders = await client.zRangeWithScores('weekender:ticket:queue', 0, -1);
  
  const result: Array<{ orderId: string; spots: number; timestamp: number }> = [];
  
  for (const order of orders) {
    const spots = await client.get(`weekender:order:${order.value}:spots`);
    result.push({
      orderId: order.value,
      spots: spots ? parseInt(spots) : 1,
      timestamp: order.score,
    });
  }
  
  return result;
}

// Check ticket availability and return pricing info
export interface TicketAvailability {
  tier: 'now' | 'now-now' | 'waitlist';
  spotsRemaining: number;
  message: string;
  canProceed: boolean;
  waitlistPosition?: number;
}

export async function checkTicketAvailability(
  spotCount: number,
  completedMemberIds: number[] // Pass in from DB check
): Promise<TicketAvailability> {
  const queue = await getTicketQueue();
  
  // Count total spots from completed registrations
  let completedSpots = completedMemberIds.length;
  
  // If all 10 "now" spots are complete
  if (completedSpots >= NOW_TICKET_LIMIT) {
    return {
      tier: 'now-now',
      spotsRemaining: 0,
      message: 'All "Now" tickets are sold out. Would you like to register at the "Now-Now" price of R1,800?',
      canProceed: true,
    };
  }
  
  // Count pending spots (in queue but not yet complete)
  let pendingSpots = 0;
  for (const order of queue) {
    // Check if this order's members are in completed list
    const memberIds = await getOrderMemberIds(order.orderId);
    const isComplete = memberIds.every(id => completedMemberIds.includes(id));
    if (!isComplete) {
      pendingSpots += order.spots;
    }
  }
  
  const totalReservedSpots = completedSpots + pendingSpots;
  const spotsRemaining = NOW_TICKET_LIMIT - completedSpots;
  
  // If there's room in the first 10
  if (totalReservedSpots < NOW_TICKET_LIMIT) {
    // Check if adding this registration would exceed 10
    // Exception: if we're at exactly 9 and it's a couple, allow it (makes 11)
    if (totalReservedSpots + spotCount <= NOW_TICKET_LIMIT || 
        (totalReservedSpots === NOW_TICKET_LIMIT - 1 && spotCount === 2)) {
      return {
        tier: 'now',
        spotsRemaining,
        message: '',
        canProceed: true,
      };
    }
  }
  
  // All spots reserved but some still pending
  if (totalReservedSpots >= NOW_TICKET_LIMIT && completedSpots < NOW_TICKET_LIMIT) {
    return {
      tier: 'waitlist',
      spotsRemaining: 0,
      message: 'All "Now" tickets are currently reserved. You can join the waitlist (we\'ll contact you if spots open up) or register at the "Now-Now" price of R1,800.',
      canProceed: false,
      waitlistPosition: totalReservedSpots - NOW_TICKET_LIMIT + 1,
    };
  }
  
  // Default: offer now-now
  return {
    tier: 'now-now',
    spotsRemaining: 0,
    message: 'All "Now" tickets are sold out. Would you like to register at the "Now-Now" price of R1,800?',
    canProceed: true,
  };
}

// Count registrations that started in the "Now" period (first 24 hours)
export async function countNowPeriodRegistrations(): Promise<number> {
  const client = await getRedisClient();
  
  // Get all sessions with payment_complete status
  const keys = await client.keys('weekender:status:*');
  let count = 0;
  
  for (const key of keys) {
    const status = await client.get(key);
    if (status === 'payment_complete') {
      count++;
    }
  }
  
  return count;
}
