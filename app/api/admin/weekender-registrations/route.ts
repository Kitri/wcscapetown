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
        m.name, 
        m.surname, 
        r.level, 
        r.role,  
        r.registration_type, 
        r.registration_status, 
        r.price_tier, 
        r.pass_type
      FROM registrations r
      INNER JOIN members m ON r.member_id = m.member_id
      ORDER BY r.id
    `;

    return NextResponse.json({ registrations: result });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
