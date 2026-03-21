import { NextRequest, NextResponse } from 'next/server';
import {
  lookupWeekenderCheckInByRegistrationId,
  upsertWeekenderCheckIn,
} from '@/lib/weekenderCheckIn';

function normalizeLookupText(value: string): string {
  return String(value ?? '').trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const name = String(body?.name ?? '').trim();
    const surname = String(body?.surname ?? '').trim();
    const registrationId = Number(body?.registrationId);

    if (!Number.isInteger(registrationId) || registrationId <= 0) {
      return NextResponse.json(
        { error: 'Registration ID is required.' },
        { status: 400 }
      );
    }

    if (!email && !(name && surname)) {
      return NextResponse.json(
        { error: 'Email or name and surname are required.' },
        { status: 400 }
      );
    }

    if ((name && !surname) || (!name && surname)) {
      return NextResponse.json(
        { error: 'Both name and surname are required when using name lookup.' },
        { status: 400 }
      );
    }

    const lookup = await lookupWeekenderCheckInByRegistrationId(registrationId);
    if (!lookup) {
      return NextResponse.json(
        { error: 'No weekender registration found for this registration ID.' },
        { status: 404 }
      );
    }

    if (email && normalizeLookupText(lookup.member.email) !== normalizeLookupText(email)) {
      return NextResponse.json(
        { error: 'Registration details are out of date. Please reload registration details.' },
        { status: 409 }
      );
    }

    if (
      name &&
      surname &&
      (
        normalizeLookupText(lookup.member.name) !== normalizeLookupText(name) ||
        normalizeLookupText(lookup.member.surname) !== normalizeLookupText(surname)
      )
    ) {
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
