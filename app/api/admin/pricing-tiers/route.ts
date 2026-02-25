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
    
    // Query pricing tier status
    const result = await sql`
      SELECT 
        pass_type,
        price_tier,
        registration_status,
        count
      FROM price_tier_status
      ORDER BY 
        CASE pass_type 
          WHEN 'weekend' THEN 1 
          WHEN 'day' THEN 2 
          WHEN 'party' THEN 3 
          WHEN 'bootcamp' THEN 4 
          ELSE 5 
        END,
        CASE price_tier
          WHEN 'now' THEN 1
          WHEN 'now-now' THEN 2
          WHEN 'just-now' THEN 3
          WHEN 'ai-tog' THEN 4
          ELSE 5
        END,
        registration_status
    `;

    return NextResponse.json({ tiers: result });
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing tiers' },
      { status: 500 }
    );
  }
}
