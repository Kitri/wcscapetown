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
  | 'session_expired';

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
