import { neon } from '@neondatabase/serverless';

// Get a database connection
export function getDb() {
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL environment variable is not set');
  }
  return neon(process.env.NEON_DATABASE_URL);
}

// Types for database tables
export interface Member {
  member_id?: number;
  name: string;
  surname: string;
  role: 'L' | 'F';
  level: 0 | 1 | 2;
  created_at?: string;
}

export interface Registration {
  id?: number;
  email: string;
  member_id: number;
  role: 'L' | 'F';
  level: 0 | 1 | 2;
  booking_session_id: string;
  order_id: string;
  pass_type: 'weekend' | 'day' | 'day_saturday' | 'day_sunday' | 'party' | 'bootcamp';
  pricing_tier: 'now' | 'now-now' | 'just-now' | 'ai-tog' | 'promo' | 'full' | 'half';
  amount_cents: number;
  payment_status: 'pending' | 'complete' | 'failed' | 'expired' | 'waitlist';
  registration_status: 'pending' | 'complete' | 'expired' | 'waitlist';
  registration_type: 'single' | 'couple';
  created_at?: string;
}

// Registration timeout in minutes (set to 1 for testing, change back to 5 for production)
const REGISTRATION_TIMEOUT_MINUTES = 1;

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  const sql = getDb();
  
  // Create members table
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      member_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      surname VARCHAR(255) NOT NULL,
      role VARCHAR(10) NOT NULL CHECK (role IN ('Lead', 'Follow')),
      level INTEGER NOT NULL CHECK (level IN (1, 2)),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Create registrations table
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      member_id INTEGER REFERENCES members(member_id),
      role VARCHAR(10) NOT NULL CHECK (role IN ('Lead', 'Follow')),
      level INTEGER NOT NULL CHECK (level IN (1, 2)),
      booking_session_id VARCHAR(255) NOT NULL,
      pass_type VARCHAR(20) NOT NULL CHECK (pass_type IN ('weekend', 'day', 'day_saturday', 'day_sunday', 'party')),
      pricing_tier VARCHAR(20) NOT NULL CHECK (pricing_tier IN ('now', 'now-now', 'just-now', 'ai-tog')),
      amount_cents INTEGER NOT NULL,
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'complete', 'failed', 'expired')),
      registration_type VARCHAR(10) NOT NULL CHECK (registration_type IN ('single', 'couple')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

// Insert a new member
export async function createMember(member: Omit<Member, 'member_id' | 'created_at'>): Promise<number> {
  const sql = getDb();
  
  const result = await sql`
    INSERT INTO members (name, surname, role, level, created_at)
    VALUES (${member.name}, ${member.surname}, ${member.role}, ${member.level}, now() AT TIME ZONE 'Africa/Johannesburg')
    RETURNING member_id
  `;
  
  return result[0].member_id;
}

// Insert or update a registration (upsert by member_id AND pass_type)
export async function createRegistration(registration: Omit<Registration, 'id' | 'created_at'>): Promise<number> {
  const sql = getDb();
  
  // Check if a registration already exists for this member_id AND pass_type
  const existing = await sql`
    SELECT id FROM registrations 
    WHERE member_id = ${registration.member_id} 
    AND pass_type = ${registration.pass_type}
    LIMIT 1
  `;
  
  if (existing.length > 0) {
    // Update existing registration for this pass type
    await sql`
      UPDATE registrations SET
        email = ${registration.email},
        role = ${registration.role},
        level = ${registration.level},
        booking_session_id = ${registration.booking_session_id},
        order_id = ${registration.order_id},
        price_tier = ${registration.pricing_tier},
        amount_cents = ${registration.amount_cents},
        payment_status = ${registration.payment_status},
        registration_status = ${registration.registration_status},
        registration_type = ${registration.registration_type}
      WHERE member_id = ${registration.member_id}
      AND pass_type = ${registration.pass_type}
    `;
    return existing[0].id;
  }
  
  // Insert new registration
  const result = await sql`
    INSERT INTO registrations (
      email, member_id, role, level, booking_session_id, order_id,
      pass_type, price_tier, amount_cents, payment_status, registration_status, registration_type, created_at
    )
    VALUES (
      ${registration.email}, ${registration.member_id}, ${registration.role}, 
      ${registration.level}, ${registration.booking_session_id}, ${registration.order_id},
      ${registration.pass_type}, ${registration.pricing_tier}, ${registration.amount_cents}, ${registration.payment_status},
      ${registration.registration_status}, ${registration.registration_type}, now() AT TIME ZONE 'Africa/Johannesburg'
    )
    RETURNING id
  `;
  
  return result[0].id;
}

// Update registration payment status by member_id
export async function updateRegistrationPaymentStatus(
  memberId: number,
  status: Registration['payment_status']
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET payment_status = ${status}
    WHERE member_id = ${memberId}
  `;
}

// Update registration status by member_id (pending/complete/expired)
export async function updateRegistrationStatus(
  memberId: number,
  status: Registration['registration_status']
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET registration_status = ${status}
    WHERE member_id = ${memberId}
  `;
}

// Get member_ids for a session
export async function getMemberIdsBySession(sessionId: string): Promise<number[]> {
  const sql = getDb();
  
  const result = await sql`
    SELECT member_id FROM registrations
    WHERE booking_session_id = ${sessionId}
  `;
  
  return result.map(r => r.member_id);
}

// Complete a registration by member_id (both payment and registration status)
export async function completeRegistration(memberId: number): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET payment_status = 'complete', registration_status = 'complete'
    WHERE member_id = ${memberId}
  `;
}

// Check if a session already has a completed registration
export async function hasCompletedRegistration(sessionId: string): Promise<boolean> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count FROM registrations 
    WHERE booking_session_id = ${sessionId} 
    AND registration_status = 'complete'
  `;
  
  return Number(result[0].count) > 0;
}

// Find a member by name (from existing members table)
export async function findMemberByName(name: string, surname: string): Promise<Member | null> {
  const sql = getDb();
  
  const result = await sql`
    SELECT * FROM members
    WHERE LOWER(name) = LOWER(${name}) 
    AND LOWER(surname) = LOWER(${surname})
    LIMIT 1
  `;
  
  if (result.length === 0) return null;
  return result[0] as Member;
}

// Check if a person already has a COMPLETED weekender registration
export async function hasWeekenderRegistration(name: string, surname: string): Promise<boolean> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count
    FROM registrations r
    JOIN members m ON r.member_id = m.member_id
    WHERE LOWER(m.name) = LOWER(${name}) 
    AND LOWER(m.surname) = LOWER(${surname})
    AND r.pass_type = 'weekend'
    AND r.registration_status = 'complete'
  `;
  
  return Number(result[0].count) > 0;
}

// Get existing weekender registration for a member (any status)
export async function getExistingRegistration(memberId: number): Promise<{
  id: number;
  registrationStatus: string;
  createdAt: Date;
  isExpired: boolean;
  minutesRemaining: number;
} | null> {
  const sql = getDb();
  
  // Use database to calculate minutes elapsed (avoids timezone issues)
  const result = await sql`
    SELECT 
      id, 
      registration_status, 
      created_at,
      EXTRACT(EPOCH FROM (now() AT TIME ZONE 'Africa/Johannesburg' - created_at)) / 60 as minutes_elapsed
    FROM registrations
    WHERE member_id = ${memberId}
    AND pass_type = 'weekend'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  if (result.length === 0) return null;
  
  const reg = result[0];
  const minutesElapsed = Number(reg.minutes_elapsed);
  const isExpired = reg.registration_status === 'pending' && minutesElapsed >= REGISTRATION_TIMEOUT_MINUTES;
  const minutesRemaining = Math.max(0, REGISTRATION_TIMEOUT_MINUTES - minutesElapsed);
  
  return {
    id: reg.id,
    registrationStatus: reg.registration_status,
    createdAt: new Date(reg.created_at),
    isExpired,
    minutesRemaining: Math.ceil(minutesRemaining),
  };
}

// Update existing registration for retry (by member_id)
export async function updateRegistrationForRetry(
  memberId: number,
  newSessionId: string,
  orderId: string,
  email: string,
  passType: string,
  amountCents: number
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET booking_session_id = ${newSessionId},
        order_id = ${orderId},
        email = ${email},
        pass_type = ${passType},
        price_tier = 'now-now',
        amount_cents = ${amountCents},
        payment_status = 'pending',
        registration_status = 'pending',
        created_at = now() AT TIME ZONE 'Africa/Johannesburg'
    WHERE member_id = ${memberId}
    AND registration_status != 'complete'
  `;
}

// Expire a registration by member_id
export async function expireRegistration(memberId: number): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET registration_status = 'expired'
    WHERE member_id = ${memberId}
  `;
}

// Find or create a member - returns member_id
export async function findOrCreateMember(member: Omit<Member, 'member_id' | 'created_at'>): Promise<number> {
  const sql = getDb();
  
  // First try to find existing member
  const existing = await sql`
    SELECT member_id FROM members
    WHERE LOWER(name) = LOWER(${member.name}) 
    AND LOWER(surname) = LOWER(${member.surname})
    LIMIT 1
  `;
  
  if (existing.length > 0) {
    return existing[0].member_id;
  }
  
  // Create new member
  const result = await sql`
    INSERT INTO members (name, surname, role, level, created_at)
    VALUES (${member.name}, ${member.surname}, ${member.role}, ${member.level}, now() AT TIME ZONE 'Africa/Johannesburg')
    RETURNING member_id
  `;
  
  return result[0].member_id;
}

// Check if registrations for an order are expired (past 5 min timeout)
export async function isOrderExpired(orderId: string): Promise<boolean> {
  const sql = getDb();
  
  // Use database to calculate minutes elapsed (avoids timezone issues)
  const result = await sql`
    SELECT 
      EXTRACT(EPOCH FROM (now() AT TIME ZONE 'Africa/Johannesburg' - created_at)) / 60 as minutes_elapsed
    FROM registrations
    WHERE order_id = ${orderId}
    LIMIT 1
  `;
  
  if (result.length === 0) return true; // No registration found = treat as expired
  
  const minutesElapsed = Number(result[0].minutes_elapsed);
  
  return minutesElapsed >= REGISTRATION_TIMEOUT_MINUTES;
}

// Expire registrations by order_id
export async function expireRegistrationsByOrder(orderId: string): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET registration_status = 'expired', payment_status = 'expired'
    WHERE order_id = ${orderId}
    AND registration_status = 'pending'
  `;
}

// Update payment status by order_id (for webhook callbacks)
export async function updateRegistrationPaymentStatusByOrder(
  orderId: string,
  status: Registration['payment_status']
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET payment_status = ${status}
    WHERE order_id = ${orderId}
  `;
}

// Save Yoco API result to database
export async function saveYocoApiResult(params: {
  requestTimestamp: Date;
  requestAmount: number;
  registrationId: number;
  responseStatus: number;
  paymentId?: string | null;
  responseId: string; // checkoutId
  processingMode?: string | null;
}): Promise<number> {
  const sql = getDb();
  
  const result = await sql`
    INSERT INTO yoco_api_results (
      request_timestamp,
      request_amount,
      registration_id,
      response_status,
      payment_id,
      response_id,
      processing_mode
    )
    VALUES (
      ${params.requestTimestamp},
      ${params.requestAmount},
      ${params.registrationId},
      ${params.responseStatus},
      ${params.paymentId || null},
      ${params.responseId},
      ${params.processingMode || null}
    )
    RETURNING id
  `;
  
  return result[0].id;
}

// Update Yoco payment_id when webhook arrives (correlate by checkoutId which is stored as response_id)
export async function updateYocoPaymentId(
  checkoutId: string,
  paymentId: string,
  amount?: number | null,
  apiCreatedDate?: string | null
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE yoco_api_results
    SET 
      payment_id = ${paymentId},
      amount = COALESCE(${amount ?? null}, amount),
      api_created_date = COALESCE(${apiCreatedDate ?? null}, api_created_date)
    WHERE response_id = ${checkoutId}
    AND payment_id IS NULL
  `;
}

// Get orderId from checkoutId (response_id) via yoco_api_results -> registrations
export async function getOrderIdByCheckoutId(checkoutId: string): Promise<string | null> {
  const sql = getDb();
  
  const result = await sql`
    SELECT r.order_id
    FROM yoco_api_results y
    INNER JOIN registrations r ON y.registration_id = r.id
    WHERE y.response_id = ${checkoutId}
    LIMIT 1
  `;
  
  return result.length > 0 ? result[0].order_id : null;
}

// Get registration ID by order_id
export async function getRegistrationIdByOrderId(orderId: string): Promise<number | null> {
  const sql = getDb();
  
  const result = await sql`
    SELECT id FROM registrations
    WHERE order_id = ${orderId}
    LIMIT 1
  `;
  
  return result.length > 0 ? result[0].id : null;
}

// Count total completed registrations
export async function countCompletedRegistrations(): Promise<number> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count FROM registrations 
    WHERE payment_status = 'complete'
  `;
  
  return Number(result[0].count);
}

// Get all member IDs with completed "now" tier registrations
export async function getCompletedNowTierMemberIds(): Promise<number[]> {
  const sql = getDb();
  
  const result = await sql`
    SELECT member_id FROM registrations 
    WHERE registration_status = 'complete'
    AND price_tier = 'now'
    AND pass_type = 'weekend'
  `;
  
  return result.map(r => r.member_id);
}

// Check if "Now" tier is sold out (10+ completed registrations)
export async function isNowTierSoldOut(): Promise<{ soldOut: boolean; completedCount: number }> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count FROM registrations 
    WHERE registration_status = 'complete'
    AND price_tier = 'now'
    AND pass_type = 'weekend'
  `;
  
  const completedCount = Number(result[0].count);
  return {
    soldOut: completedCount >= 10,
    completedCount,
  };
}

// Party pass limit
const PARTY_PASS_LIMIT = 10;

// Check if party passes are sold out
export async function isPartyPassSoldOut(): Promise<{ soldOut: boolean; completedCount: number; limit: number }> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count FROM registrations 
    WHERE registration_status = 'complete'
    AND pass_type = 'party'
  `;
  
  const completedCount = Number(result[0].count);
  return {
    soldOut: completedCount >= PARTY_PASS_LIMIT,
    completedCount,
    limit: PARTY_PASS_LIMIT,
  };
}

// Create or update day pass details entry (upsert by registration_id)
export async function createDayPassDetails(
  registrationId: number,
  workshopDay: 'Saturday' | 'Sunday',
  partyAddOn: boolean
): Promise<number> {
  const sql = getDb();
  
  // Check if day pass details already exist for this registration_id
  const existing = await sql`
    SELECT id FROM day_pass_details WHERE registration_id = ${registrationId} LIMIT 1
  `;
  
  if (existing.length > 0) {
    // Update existing record
    await sql`
      UPDATE day_pass_details SET
        workshop_day = ${workshopDay},
        party_add_on = ${partyAddOn}
      WHERE registration_id = ${registrationId}
    `;
    return existing[0].id;
  }
  
  // Insert new record
  const result = await sql`
    INSERT INTO day_pass_details (registration_id, workshop_day, party_add_on)
    VALUES (${registrationId}, ${workshopDay}, ${partyAddOn})
    RETURNING id
  `;
  
  return result[0].id;
}

// Create or update couple registration entry (upsert by lead_id)
export async function createCoupleRegistration(
  leadId: number,
  followId: number
): Promise<number> {
  const sql = getDb();
  
  // Check if couple registration already exists for this lead_id
  const existing = await sql`
    SELECT id FROM couple_registrations WHERE lead_id = ${leadId} LIMIT 1
  `;
  
  if (existing.length > 0) {
    // Update existing record
    await sql`
      UPDATE couple_registrations SET
        follow_id = ${followId}
      WHERE lead_id = ${leadId}
    `;
    return existing[0].id;
  }
  
  // Insert new record
  const result = await sql`
    INSERT INTO couple_registrations (lead_id, follow_id)
    VALUES (${leadId}, ${followId})
    RETURNING id
  `;
  
  return result[0].id;
}

// Get registration ID by member_id (for day pass details)
export async function getRegistrationIdByMemberId(memberId: number): Promise<number | null> {
  const sql = getDb();
  
  const result = await sql`
    SELECT id FROM registrations
    WHERE member_id = ${memberId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  if (result.length === 0) return null;
  return result[0].id;
}

// Get weekend pass role counts for a specific level (for role balancing)
// Only counts completed registrations
export async function getWeekendRoleCounts(level: number): Promise<{ leads: number; followers: number }> {
  const sql = getDb();
  
  const result = await sql`
    SELECT 
      role,
      COUNT(*) as count
    FROM registrations
    WHERE level = ${level}
    AND pass_type = 'weekend'
    AND registration_status = 'complete'
    GROUP BY role
  `;
  
  let leads = 0;
  let followers = 0;
  
  for (const row of result) {
    if (row.role === 'L') leads = Number(row.count);
    if (row.role === 'F') followers = Number(row.count);
  }
  
  return { leads, followers };
}

// Count waitlisted registrations for a specific role and level
export async function getWaitlistCount(role: 'L' | 'F', level: number): Promise<number> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count
    FROM registrations
    WHERE role = ${role}
    AND level = ${level}
    AND pass_type = 'weekend'
    AND registration_status = 'waitlist'
  `;
  
  return Number(result[0].count);
}

// Check if a role needs to go on waitlist for weekend pass
// Rules:
// Level 1 & 2 Followers: Controlled by admin settings (manual release)
// Level 1 Leads: Two conditions:
//   - Before 10 total: cap at 7 to prevent extreme imbalance
//   - From 10 total: 80/20 ratio applies
// Level 2 Leads: 80/20 ratio (active immediately)
// Both levels: If there are people on the waitlist for this role, new registrations also go to waitlist
export async function shouldWaitlistRole(
  role: 'L' | 'F',
  level: number
): Promise<{ shouldWaitlist: boolean; leads: number; followers: number; waitlistCount: number; message: string }> {
  const { leads, followers } = await getWeekendRoleCounts(level);
  const waitlistCount = await getWaitlistCount(role, level);
  const total = leads + followers;
  const levelLabel = `Level ${level}`;
  
  // Check admin settings for follower waitlist control
  if (role === 'F') {
    const settings = await getWaitlistSettings();
    const isOpen = level === 1 ? settings.level1FollowersOpen : settings.level2FollowersOpen;
    
    // If waitlist is closed (not open), all followers go to waitlist
    if (!isOpen) {
      return {
        shouldWaitlist: true,
        leads,
        followers,
        waitlistCount,
        message: `For role balancing purposes, ${levelLabel} followers are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
      };
    }
  }
  
  // First check: if there are people on the waitlist for this role, new registrations also go to waitlist
  if (waitlistCount > 0) {
    return {
      shouldWaitlist: true,
      leads,
      followers,
      waitlistCount,
      message: `For role balancing purposes, ${levelLabel} ${role === 'F' ? 'followers' : 'leads'} are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
    };
  }
  
  // Level 1: Leads use two-tier waitlist logic
  if (level === 1) {
    // Followers handled by settings check above
    
    // Leads: Condition 1 - Before 10 total, cap at 7 to prevent extreme imbalance
    if (total < 10) {
      if (role === 'L' && leads >= 7) {
        return {
          shouldWaitlist: true,
          leads,
          followers,
          waitlistCount,
          message: `For role balancing purposes, ${levelLabel} leads are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
        };
      }
      // Followers can proceed if settings allow (checked above)
      return { shouldWaitlist: false, leads, followers, waitlistCount, message: '' };
    }
    
    // Leads: Condition 2 - From 10 total, apply 80/20 ratio
    if (role === 'L') {
      const newLeads = leads + 1;
      const ratio = followers / newLeads;
      if (ratio < 0.8) {
        return {
          shouldWaitlist: true,
          leads,
          followers,
          waitlistCount,
          message: `For role balancing purposes, ${levelLabel} leads are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
        };
      }
    }
    
    // Followers: Apply 80/20 ratio if settings allow registration
    if (role === 'F') {
      const newFollowers = followers + 1;
      const ratio = leads / newFollowers;
      if (ratio < 0.8) {
        return {
          shouldWaitlist: true,
          leads,
          followers,
          waitlistCount,
          message: `For role balancing purposes, ${levelLabel} followers are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
        };
      }
    }
    
    return { shouldWaitlist: false, leads, followers, waitlistCount, message: '' };
  }
  
  // Level 2: 80/20 ratio for leads, followers controlled by settings
  if (level === 2) {
    // Followers handled by settings check above
    
    if (role === 'L') {
      const newLeads = leads + 1;
      const ratio = followers / newLeads;
      if (ratio < 0.8) {
        return {
          shouldWaitlist: true,
          leads,
          followers,
          waitlistCount,
          message: `For role balancing purposes, ${levelLabel} leads are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
        };
      }
    }
    
    // Followers: Apply 80/20 ratio if settings allow registration
    if (role === 'F') {
      const newFollowers = followers + 1;
      const ratio = leads / newFollowers;
      if (ratio < 0.8) {
        return {
          shouldWaitlist: true,
          leads,
          followers,
          waitlistCount,
          message: `For role balancing purposes, ${levelLabel} followers are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
        };
      }
    }
  }
  
  return { shouldWaitlist: false, leads, followers, waitlistCount, message: '' };
}

// Get day pass role counts for a specific level (for role balancing)
// Only counts completed registrations
export async function getDayPassRoleCounts(level: number): Promise<{ leads: number; followers: number }> {
  const sql = getDb();
  
  const result = await sql`
    SELECT 
      role,
      COUNT(*) as count
    FROM registrations
    WHERE level = ${level}
    AND pass_type = 'day'
    AND registration_status = 'complete'
    GROUP BY role
  `;
  
  let leads = 0;
  let followers = 0;
  
  for (const row of result) {
    if (row.role === 'L') leads = Number(row.count);
    if (row.role === 'F') followers = Number(row.count);
  }
  
  return { leads, followers };
}

// Count waitlisted day pass registrations for a specific role and level
export async function getDayPassWaitlistCount(role: 'L' | 'F', level: number): Promise<number> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count
    FROM registrations
    WHERE role = ${role}
    AND level = ${level}
    AND pass_type = 'day'
    AND registration_status = 'waitlist'
  `;
  
  return Number(result[0].count);
}

// Check if a role needs to go on waitlist for day pass
// Rules: Level 2 followers always go to waitlist (until weekend L2 is balanced)
export async function shouldWaitlistDayPassRole(
  role: 'L' | 'F',
  level: number
): Promise<{ shouldWaitlist: boolean; leads: number; followers: number; waitlistCount: number; message: string }> {
  // Only apply waitlist to level 2 followers
  if (level !== 2 || role !== 'F') {
    return { shouldWaitlist: false, leads: 0, followers: 0, waitlistCount: 0, message: '' };
  }
  
  // All L2 followers go to waitlist for now
  return {
    shouldWaitlist: true,
    leads: 0,
    followers: 0,
    waitlistCount: 0,
    message: `For role balancing purposes, Level 2 day pass followers are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
  };
}

// Create or update bootcamp details entry (upsert by registration_id)
export async function createBootcampDetails(
  registrationId: number,
  bootcampType: 'beginner' | 'fasttrack',
  wcsExperience: string,
  howDidYouFindUs: string | null,
  yearsExperience: number | null = null,
  danceStyle: string | null = null,
  danceRole: string | null = null
): Promise<number> {
  const sql = getDb();
  
  // Check if bootcamp details already exist for this registration_id
  const existing = await sql`
    SELECT id FROM bootcamp_details WHERE registration_id = ${registrationId} LIMIT 1
  `;
  
  if (existing.length > 0) {
    // Update existing record
    await sql`
      UPDATE bootcamp_details SET
        bootcamp_type = ${bootcampType},
        years_experience = ${yearsExperience},
        dance_style = ${danceStyle},
        dance_role = ${danceRole},
        "WCS_experience" = ${wcsExperience},
        how_did_you_find_us = ${howDidYouFindUs}
      WHERE registration_id = ${registrationId}
    `;
    return existing[0].id;
  }
  
  // Insert new record
  const result = await sql`
    INSERT INTO bootcamp_details (registration_id, bootcamp_type, years_experience, dance_style, dance_role, "WCS_experience", how_did_you_find_us)
    VALUES (${registrationId}, ${bootcampType}, ${yearsExperience}, ${danceStyle}, ${danceRole}, ${wcsExperience}, ${howDidYouFindUs})
    RETURNING id
  `;
  
  return result[0].id;
}

// Validate weekender registration by name and surname
export async function validateWeekenderByName(name: string, surname: string): Promise<{ valid: boolean; registrationId: number | null }> {
  const sql = getDb();
  
  const result = await sql`
    SELECT r.id
    FROM registrations r
    INNER JOIN members m ON r.member_id = m.member_id
    WHERE LOWER(m.name) = LOWER(${name.trim()})
    AND LOWER(m.surname) = LOWER(${surname.trim()})
    AND r.pass_type = 'weekend'
    AND r.registration_status = 'complete'
    LIMIT 1
  `;
  
  if (result.length > 0) {
    return { valid: true, registrationId: result[0].id };
  }
  return { valid: false, registrationId: null };
}

// Validate weekender registration by order ID
export async function validateWeekenderByOrderId(orderId: string): Promise<{ valid: boolean; registrationId: number | null }> {
  const sql = getDb();
  
  const result = await sql`
    SELECT r.id
    FROM registrations r
    WHERE r.order_id = ${orderId.trim()}
    AND r.pass_type = 'weekend'
    AND r.registration_status = 'complete'
    LIMIT 1
  `;
  
  if (result.length > 0) {
    return { valid: true, registrationId: result[0].id };
  }
  return { valid: false, registrationId: null };
}

// Get registration details by order ID (uses registration_details view for masked email)
export async function getRegistrationByOrderId(orderId: string): Promise<{
  name: string;
  surname: string;
  emailMasked: string;
  role: string;
  level: number;
  passType: string;
  priceTier: string;
  amountCents: number;
  paymentStatus: string;
  registrationStatus: string;
  orderId: string;
  workshopDay: string | null;
  partyAddOn: boolean | null;
  bootcampType: string | null;
} | null> {
  const sql = getDb();
  
  const result = await sql`
    SELECT 
      name,
      surname,
      email_masked,
      role,
      level,
      pass_type,
      price_tier,
      amount_cents,
      payment_status,
      registration_status,
      order_id,
      workshop_day,
      party_add_on,
      bootcamp_type
    FROM registration_details
    WHERE order_id = ${orderId.trim()}
    LIMIT 1
  `;
  
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    name: row.name,
    surname: row.surname,
    emailMasked: row.email_masked,
    role: row.role,
    level: row.level,
    passType: row.pass_type,
    priceTier: row.price_tier,
    amountCents: row.amount_cents,
    paymentStatus: row.payment_status,
    registrationStatus: row.registration_status,
    orderId: row.order_id,
    workshopDay: row.workshop_day,
    partyAddOn: row.party_add_on,
    bootcampType: row.bootcamp_type,
  };
}

// ========== WAITLIST SETTINGS ==========

// Get waitlist settings for a specific level and role
export async function getWaitlistSettings(): Promise<{
  level1FollowersOpen: boolean;
  level2FollowersOpen: boolean;
}> {
  const sql = getDb();
  
  // Ensure settings table exists
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist_settings (
      id SERIAL PRIMARY KEY,
      level1_followers_open BOOLEAN DEFAULT false,
      level2_followers_open BOOLEAN DEFAULT false,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Get or create default settings
  const result = await sql`
    SELECT level1_followers_open, level2_followers_open
    FROM waitlist_settings
    ORDER BY id DESC
    LIMIT 1
  `;
  
  if (result.length === 0) {
    // Initialize with default settings (closed)
    await sql`
      INSERT INTO waitlist_settings (level1_followers_open, level2_followers_open)
      VALUES (false, false)
    `;
    return { level1FollowersOpen: false, level2FollowersOpen: false };
  }
  
  return {
    level1FollowersOpen: result[0].level1_followers_open,
    level2FollowersOpen: result[0].level2_followers_open,
  };
}

// Update waitlist settings
export async function updateWaitlistSettings(settings: {
  level1FollowersOpen?: boolean;
  level2FollowersOpen?: boolean;
}): Promise<void> {
  const sql = getDb();
  
  // Ensure settings table exists
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist_settings (
      id SERIAL PRIMARY KEY,
      level1_followers_open BOOLEAN DEFAULT false,
      level2_followers_open BOOLEAN DEFAULT false,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Get current settings
  const current = await sql`
    SELECT id, level1_followers_open, level2_followers_open
    FROM waitlist_settings
    ORDER BY id DESC
    LIMIT 1
  `;
  
  if (current.length === 0) {
    // Insert new settings
    await sql`
      INSERT INTO waitlist_settings (
        level1_followers_open,
        level2_followers_open,
        updated_at
      )
      VALUES (
        ${settings.level1FollowersOpen ?? false},
        ${settings.level2FollowersOpen ?? false},
        now() AT TIME ZONE 'Africa/Johannesburg'
      )
    `;
  } else {
    // Update existing settings
    const id = current[0].id;
    const updates: string[] = [];
    const values: any[] = [];
    
    if (settings.level1FollowersOpen !== undefined) {
      await sql`
        UPDATE waitlist_settings
        SET level1_followers_open = ${settings.level1FollowersOpen},
            updated_at = now() AT TIME ZONE 'Africa/Johannesburg'
        WHERE id = ${id}
      `;
    }
    if (settings.level2FollowersOpen !== undefined) {
      await sql`
        UPDATE waitlist_settings
        SET level2_followers_open = ${settings.level2FollowersOpen},
            updated_at = now() AT TIME ZONE 'Africa/Johannesburg'
        WHERE id = ${id}
      `;
    }
  }
}
