import { NextRequest, NextResponse } from 'next/server';
import { isCheckinAuthed } from '@/lib/server/checkinAuth';
import { updateWeekenderCheckInColour } from '@/lib/weekenderCheckIn';

export async function PATCH(request: NextRequest) {
  if (!(await isCheckinAuthed())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const entryId = Number(body?.entryId);
    const colour =
      typeof body?.colour === 'string'
        ? body.colour
        : null;

    if (!Number.isInteger(entryId) || entryId <= 0) {
      return NextResponse.json(
        { error: 'A valid check-in entry ID is required.' },
        { status: 400 }
      );
    }

    const updated = await updateWeekenderCheckInColour(entryId, colour);
    if (!updated) {
      return NextResponse.json(
        { error: 'Check-in entry not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Colour updated.',
    });
  } catch (error) {
    console.error('Weekender admin update colour error:', error);
    return NextResponse.json(
      { error: 'Failed to update colour.' },
      { status: 500 }
    );
  }
}
