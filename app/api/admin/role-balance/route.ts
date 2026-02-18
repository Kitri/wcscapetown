import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CHECKIN_AUTH_COOKIE_NAME } from '@/lib/server/checkinConfig';
import { getDb } from '@/lib/db';

export async function GET() {
  // Check auth
  const jar = await cookies();
  if (jar.get(CHECKIN_AUTH_COOKIE_NAME)?.value !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    
    const result = await sql`
      SELECT 
        level, 
        CASE WHEN role = 'F' THEN 'Follow' ELSE 'Lead' END as role, 
        count(*) as count
      FROM registrations
      WHERE registration_status = 'complete'
      GROUP BY level, role
      ORDER BY level, role
    `;

    return NextResponse.json({ roleBalance: result });
  } catch (error) {
    console.error('Error fetching role balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role balance' },
      { status: 500 }
    );
  }
}
