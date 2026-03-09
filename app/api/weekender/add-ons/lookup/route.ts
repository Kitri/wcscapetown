import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

type LookupResult = {
  email: string;
  role: 'L' | 'F';
  level: number;
  pass_type: 'weekend' | 'day';
  registration_status: string;
};

async function findWeekenderRegistrant(name: string, surname: string): Promise<LookupResult | null> {
  const sql = getDb();

  const result = await sql`
    SELECT
      r.email,
      r.role,
      r.level,
      r.pass_type,
      r.registration_status
    FROM members m
    INNER JOIN registrations r ON r.member_id = m.member_id
    WHERE LOWER(m.name) = LOWER(${name})
      AND LOWER(m.surname) = LOWER(${surname})
      AND r.pass_type IN ('weekend', 'day')
      AND r.registration_status != 'expired'
    ORDER BY
      CASE r.registration_status
        WHEN 'complete' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'waitlist' THEN 3
        ELSE 4
      END,
      CASE r.pass_type
        WHEN 'weekend' THEN 1
        WHEN 'day' THEN 2
        ELSE 3
      END,
      r.created_at DESC
    LIMIT 1
  `;

  if (result.length === 0) return null;
  return result[0] as LookupResult;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? '').trim();
    const surname = String(body?.surname ?? '').trim();

    if (!name || !surname) {
      return NextResponse.json(
        { error: 'Name and surname are required.' },
        { status: 400 }
      );
    }

    const found = await findWeekenderRegistrant(name, surname);
    if (!found) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      email: found.email,
      role: found.role,
      level: Number(found.level),
      passType: found.pass_type,
      registrationStatus: found.registration_status,
    });
  } catch (error) {
    console.error('Weekender add-ons lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup registration.' },
      { status: 500 }
    );
  }
}
