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
  role: 'Lead' | 'Follow';
  level: 1 | 2;
  created_at?: string;
}

export interface Registration {
  id?: number;
  email: string;
  member_id: number;
  role: 'Lead' | 'Follow';
  level: 1 | 2;
  booking_session_id: string;
  pass_type: 'weekend' | 'day_saturday' | 'day_sunday' | 'party';
  price_tier: 'now' | 'now_now' | 'just_now' | 'ai_tog';
  amount_cents: number;
  payment_status: 'pending' | 'complete' | 'failed' | 'expired';
  registration_type: 'single' | 'couple';
  created_at?: string;
}

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
    INSERT INTO members (name, surname, role, level)
    VALUES (${member.name}, ${member.surname}, ${member.role}, ${member.level})
    RETURNING member_id
  `;
  
  return result[0].member_id;
}

// Insert a new registration
export async function createRegistration(registration: Omit<Registration, 'id' | 'created_at'>): Promise<number> {
  const sql = getDb();
  
  const result = await sql`
    INSERT INTO registrations (
      email, member_id, role, level, booking_session_id, 
      pass_type, price_tier, amount_cents, payment_status, registration_type
    )
    VALUES (
      ${registration.email}, ${registration.member_id}, ${registration.role}, 
      ${registration.level}, ${registration.booking_session_id}, ${registration.pass_type},
      ${registration.price_tier}, ${registration.amount_cents}, ${registration.payment_status},
      ${registration.registration_type}
    )
    RETURNING id
  `;
  
  return result[0].id;
}

// Update registration payment status
export async function updateRegistrationPaymentStatus(
  sessionId: string,
  status: Registration['payment_status']
): Promise<void> {
  const sql = getDb();
  
  await sql`
    UPDATE registrations 
    SET payment_status = ${status}
    WHERE booking_session_id = ${sessionId}
  `;
}

// Check if a session already has a completed registration
export async function hasCompletedRegistration(sessionId: string): Promise<boolean> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count FROM registrations 
    WHERE booking_session_id = ${sessionId} 
    AND payment_status = 'complete'
  `;
  
  return result[0].count > 0;
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

// Check if a person already has a weekender registration
export async function hasWeekenderRegistration(name: string, surname: string): Promise<boolean> {
  const sql = getDb();
  
  const result = await sql`
    SELECT COUNT(*) as count
    FROM registrations r
    JOIN members m ON r.member_id = m.member_id
    WHERE LOWER(m.name) = LOWER(${name}) 
    AND LOWER(m.surname) = LOWER(${surname})
    AND r.pass_type = 'weekend'
  `;
  
  return Number(result[0].count) > 0;
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
    INSERT INTO members (name, surname, role, level)
    VALUES (${member.name}, ${member.surname}, ${member.role}, ${member.level})
    RETURNING member_id
  `;
  
  return result[0].member_id;
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
