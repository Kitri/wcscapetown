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
  level: 1 | 2;
  created_at?: string;
}

export interface Registration {
  id?: number;
  email: string;
  member_id: number;
  role: 'L' | 'F';
  level: 1 | 2;
  booking_session_id: string;
  order_id: string;
  pass_type: 'weekend' | 'day' | 'day_saturday' | 'day_sunday' | 'party';
  pricing_tier: 'now' | 'now-now' | 'just-now' | 'ai-tog' | 'promo';
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

// Insert or update a registration (upsert by member_id)
export async function createRegistration(registration: Omit<Registration, 'id' | 'created_at'>): Promise<number> {
  const sql = getDb();
  
  // Check if a registration already exists for this member_id
  const existing = await sql`
    SELECT id FROM registrations WHERE member_id = ${registration.member_id} LIMIT 1
  `;
  
  if (existing.length > 0) {
    // Update existing registration
    await sql`
      UPDATE registrations SET
        email = ${registration.email},
        role = ${registration.role},
        level = ${registration.level},
        booking_session_id = ${registration.booking_session_id},
        order_id = ${registration.order_id},
        pass_type = ${registration.pass_type},
        price_tier = ${registration.pricing_tier},
        amount_cents = ${registration.amount_cents},
        payment_status = ${registration.payment_status},
        registration_status = ${registration.registration_status},
        registration_type = ${registration.registration_type}
      WHERE member_id = ${registration.member_id}
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
// Level 1: Two conditions:
//   - Before 10 total: cap at 7 for either role (to prevent 90%+ imbalance)
//   - From 10 total: 80/20 ratio applies
// Level 2: 80/20 ratio (active immediately)
// Both levels: If there are people on the waitlist for this role, new registrations also go to waitlist
export async function shouldWaitlistRole(
  role: 'L' | 'F',
  level: number
): Promise<{ shouldWaitlist: boolean; leads: number; followers: number; waitlistCount: number; message: string }> {
  const { leads, followers } = await getWeekendRoleCounts(level);
  const waitlistCount = await getWaitlistCount(role, level);
  const total = leads + followers;
  const levelLabel = `Level ${level}`;
  
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
  
  // Level 1: Two conditions for waitlist
  if (level === 1) {
    // Condition 1: Before 10 total, cap either role at 7 to prevent extreme imbalance
    if (total < 10) {
      if (role === 'F' && followers >= 7) {
        return {
          shouldWaitlist: true,
          leads,
          followers,
          waitlistCount,
          message: `For role balancing purposes, ${levelLabel} followers are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
        };
      }
      if (role === 'L' && leads >= 7) {
        return {
          shouldWaitlist: true,
          leads,
          followers,
          waitlistCount,
          message: `For role balancing purposes, ${levelLabel} leads are currently on a waitlist. As soon as a spot opens up, we'll let you know.`
        };
      }
      return { shouldWaitlist: false, leads, followers, waitlistCount, message: '' };
    }
    
    // Condition 2: From 10 total, apply 80/20 ratio
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
    
    return { shouldWaitlist: false, leads, followers, waitlistCount, message: '' };
  }
  
  // Level 2: Ratio 80/20 (leads/followers >= 0.8 in either direction)
  if (level === 2) {
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
  }
  
  return { shouldWaitlist: false, leads, followers, waitlistCount, message: '' };
}
