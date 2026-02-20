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
      SELECT day, level, role, count
      FROM aggregate_by_day
    `;

    return NextResponse.json({ aggregateByDay: result });
  } catch (error) {
    console.error('Error fetching aggregate by day:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aggregate by day' },
      { status: 500 }
    );
  }
}
