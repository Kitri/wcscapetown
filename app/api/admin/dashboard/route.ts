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
      WHERE COALESCE(registration_status, '') != 'cancelled'
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
      WITH completed_registrations AS (
        SELECT
          r.member_id,
          r.role,
          r.level,
          r.pass_type,
          dp.workshop_day
        FROM registrations r
        LEFT JOIN day_pass_details dp ON dp.registration_id = r.id
        WHERE r.registration_status = 'complete'
          AND COALESCE(r.registration_status, '') != 'cancelled'
          AND r.pass_type IN ('weekend', 'day')
      ),
      expanded_days AS (
        SELECT
          CASE
            WHEN pass_type = 'weekend' THEN 'Saturday'
            ELSE workshop_day
          END AS day,
          level,
          role
        FROM completed_registrations
        WHERE pass_type = 'weekend'
        UNION ALL
        SELECT
          CASE
            WHEN pass_type = 'weekend' THEN 'Sunday'
            ELSE workshop_day
          END AS day,
          level,
          role
        FROM completed_registrations
        WHERE pass_type = 'weekend'
        UNION ALL
        SELECT
          workshop_day AS day,
          level,
          role
        FROM completed_registrations
        WHERE pass_type = 'day'
      )
      SELECT
        day,
        level,
        role,
        COUNT(*)::int AS count
      FROM expanded_days
      WHERE day IN ('Saturday', 'Sunday')
      GROUP BY day, level, role
      ORDER BY day, level, role
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
      AND COALESCE(registration_status, '') != 'cancelled'
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
        price_tier as price_tier,
        registration_status,
        COUNT(*)::int as count
      FROM registrations
      WHERE COALESCE(registration_status, '') != 'cancelled'
      GROUP BY pass_type, price_tier, registration_status
      ORDER BY
        CASE pass_type
          WHEN 'weekend' THEN 1
          WHEN 'day' THEN 2
          WHEN 'party' THEN 3
          ELSE 4
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
