import { NextRequest, NextResponse } from 'next/server';
import {
  lookupWeekenderCheckInByEmail,
  upsertWeekenderCheckIn,
} from '@/lib/weekenderCheckIn';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const registrationId = Number(body?.registrationId);

    if (!email || !Number.isInteger(registrationId) || registrationId <= 0) {
      return NextResponse.json(
        { error: 'Email and registration ID are required.' },
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

    if (lookup.registration.registrationId !== registrationId) {
      return NextResponse.json(
        { error: 'Registration details are out of date. Please reload registration details.' },
        { status: 409 }
      );
    }

    if (lookup.checkIn?.checkedIn) {
      return NextResponse.json({
        success: true,
        message: 'You are already checked in.',
      });
    }


    await upsertWeekenderCheckIn({
      lookup,
      checkedIn: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Checked in successfully.',
    });
  } catch (error) {
    console.error('Weekender self check-in error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to check in.' },
      { status: 500 }
    );
  }
}
