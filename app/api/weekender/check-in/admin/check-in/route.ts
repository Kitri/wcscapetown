import { NextRequest, NextResponse } from 'next/server';
import { isCheckinAuthed } from '@/lib/server/checkinAuth';
import {
  lookupWeekenderCheckInByRegistrationId,
  lookupWeekenderCheckInByEmail,
  upsertWeekenderCheckIn,
} from '@/lib/weekenderCheckIn';

export async function POST(request: NextRequest) {
  if (!(await isCheckinAuthed())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const registrationId = Number(body?.registrationId);
    const colour = typeof body?.colour === 'string' ? body.colour : undefined;

    if (!Number.isInteger(registrationId) || registrationId <= 0) {
      return NextResponse.json(
        { error: 'Registration ID is required.' },
        { status: 400 }
      );
    }

    const lookupByRegistrationId = await lookupWeekenderCheckInByRegistrationId(registrationId);
    const lookup = lookupByRegistrationId || (email ? await lookupWeekenderCheckInByEmail(email) : null);
    if (!lookup) {
      return NextResponse.json(
        { error: 'No weekender registration found for this row.' },
        { status: 404 }
      );
    }

    if (lookup.registration.registrationId !== registrationId) {
      return NextResponse.json(
        { error: 'Registration details are out of date. Please refresh the list and try again.' },
        { status: 409 }
      );
    }

    await upsertWeekenderCheckIn({
      lookup,
      checkedIn: true,
      ...(typeof colour === 'string' ? { colour } : {}),
    });

    return NextResponse.json({
      success: true,
      message: lookup.checkIn?.checkedIn
        ? 'Member was already checked in.'
        : 'Member checked in successfully.',
    });
  } catch (error) {
    console.error('Weekender admin check-in error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to check in member.' },
      { status: 500 }
    );
  }
}
