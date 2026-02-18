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
  pass_type: 'weekend' | 'day_saturday' | 'day_sunday' | 'party';
  price_tier: 'now' | 'now_now' | 'just_now' | 'ai_tog';
  amount_cents: number;
  payment_status: 'pending' | 'complete' | 'failed' | 'expired';
  registration_status: 'pending' | 'complete' | 'expired';
  registration_type: 'single' | 'couple';
  created_at?: string;
}

// Registration timeout in minutes
const REGISTRATION_TIMEOUT_MINUTES = 5;

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
      pass_type VARCHAR(20) NOT NULL CHECK (pass_type IN ('weekend', 'day_saturday', 'day_sunday', 'party')),
      price_tier VARCHAR(20) NOT NULL CHECK (price_tier IN ('now', 'now_now', 'just_now', 'ai_tog')),
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

// Insert a new registration
export async function createRegistration(registration: Omit<Registration, 'id' | 'created_at'>): Promise<number> {
  const sql = getDb();
  
  const result = await sql`
    INSERT INTO registrations (
      email, member_id, role, level, booking_session_id, order_id,
      pass_type, price_tier, amount_cents, payment_status, registration_status, registration_type, created_at
    )
    VALUES (
      ${registration.email}, ${registration.member_id}, ${registration.role}, 
      ${registration.level}, ${registration.booking_session_id}, ${registration.order_id},
      ${registration.pass_type}, ${registration.price_tier}, ${registration.amount_cents}, ${registration.payment_status},
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
  priceTier: string,
  amountCents: number
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET booking_session_id = ${newSessionId},
        order_id = ${orderId},
        email = ${email},
        price_tier = ${priceTier},
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
