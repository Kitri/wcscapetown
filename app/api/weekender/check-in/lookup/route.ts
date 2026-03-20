import { NextRequest, NextResponse } from 'next/server';
import { lookupWeekenderCheckInByEmail } from '@/lib/weekenderCheckIn';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const lookup = await lookupWeekenderCheckInByEmail(email);
    if (!lookup) {
      return NextResponse.json(
        { error: 'No weekender registration found for this email address.' },
        { status: 404 }
      );
    }

    const message = lookup.checkIn?.checkedIn
      ? 'Member is already checked in.'
      : 'Registration found. Ready to check in.';

    return NextResponse.json({
      found: true,
      message,
      member: lookup.member,
      registration: lookup.registration,
      checkIn: {
        exists: Boolean(lookup.checkIn),
        id: lookup.checkIn?.id ?? null,
        checkedIn: Boolean(lookup.checkIn?.checkedIn),
        colour: lookup.checkIn?.colour ?? null,
        updatedAt: lookup.checkIn?.updatedAt ?? null,
      },
    });
  } catch (error) {
    console.error('Weekender check-in lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to load check-in details.' },
      { status: 500 }
    );
  }
}
