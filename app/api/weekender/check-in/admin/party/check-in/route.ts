import { NextRequest, NextResponse } from 'next/server';
import { isCheckinAuthed } from '@/lib/server/checkinAuth';
import {
  lookupWeekenderPartyCheckInByRegistrationId,
  upsertWeekenderPartyCheckIn,
} from '@/lib/weekenderCheckIn';

export async function POST(request: NextRequest) {
  if (!(await isCheckinAuthed())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const registrationId = Number(body?.registrationId);

    if (!Number.isInteger(registrationId) || registrationId <= 0) {
      return NextResponse.json(
        { error: 'Registration ID is required.' },
        { status: 400 }
      );
    }

    const lookup = await lookupWeekenderPartyCheckInByRegistrationId(registrationId);
    if (!lookup) {
      return NextResponse.json(
        { error: 'No Friday party registration found for this row.' },
        { status: 404 }
      );
    }

    if (lookup.checkIn?.checkedIn) {
      return NextResponse.json({
        success: true,
        message: 'Member was already checked in for Friday party.',
      });
    }

    await upsertWeekenderPartyCheckIn({
      memberId: lookup.memberId,
      registrationId: lookup.registrationId,
      checkedIn: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Member checked in for Friday party.',
    });
  } catch (error) {
    console.error('Weekender admin party check-in error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to check in member for Friday party.' },
      { status: 500 }
    );
  }
}
