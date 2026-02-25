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
    
    // Query non-complete registrations grouped by status, level, role, and pass_type
    const result = await sql`
      SELECT 
        registration_status,
        level,
        role,
        pass_type,
        COUNT(*) as count
      FROM registrations
      WHERE registration_status != 'complete'
      GROUP BY registration_status, level, role, pass_type
      ORDER BY 
        registration_status,
        level,
        CASE WHEN role = 'L' THEN 0 ELSE 1 END,
        pass_type
    `;

    return NextResponse.json({ breakdown: result });
  } catch (error) {
    console.error('Error fetching non-complete breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch non-complete breakdown' },
      { status: 500 }
    );
  }
}
