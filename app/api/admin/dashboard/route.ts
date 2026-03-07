import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CHECKIN_AUTH_COOKIE_NAME } from '@/lib/server/checkinConfig';
import { getDb } from '@/lib/db';

export async function GET() {
  const jar = await cookies();
  if (jar.get(CHECKIN_AUTH_COOKIE_NAME)?.value !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();

    const registrations = await sql`
      SELECT
        name,
        surname,
        level,
        role,
        registration_type,
        registration_status,
        price_tier,
        pass_type,
        created_at,
        workshop_day,
        party_add_on
      FROM registration_admin_view
    `;

    const roleBalance = await sql`
      SELECT
        level,
        CASE WHEN role = 'F' THEN 'Follow' ELSE 'Lead' END as role,
        count(*) as count
      FROM registrations
      WHERE registration_status = 'complete'
      AND pass_type = 'weekend'
      GROUP BY level, role
      ORDER BY level, role
    `;

    const aggregateByDay = await sql`
      SELECT day, level, role, count
      FROM aggregate_by_day
    `;

    const bootcampRegistrations = await sql`
      SELECT
        created_at,
        name,
        surname,
        bootcamp_type,
        role,
        registration_type,
        registration_status
      FROM bootcamp_registration_admin_view
    `;

    const nonComplete = await sql`
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

    const pricingTiers = await sql`
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

    return NextResponse.json({
      registrations,
      roleBalance,
      aggregateByDay,
      bootcampRegistrations,
      nonComplete,
      pricingTiers,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin dashboard data' },
      { status: 500 }
    );
  }
}
