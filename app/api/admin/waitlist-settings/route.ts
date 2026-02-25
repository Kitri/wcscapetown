import { NextRequest, NextResponse } from 'next/server';
import { getWaitlistSettings, updateWaitlistSettings } from '@/lib/db';
import { isCheckinAuthed } from '@/lib/server/checkinAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthed = await isCheckinAuthed();
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getWaitlistSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching waitlist settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthed = await isCheckinAuthed();
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      level1WeekendFollowersOpen,
      level2WeekendFollowersOpen,
      level1DayFollowersOpen,
      level2DayFollowersOpen,
    } = body;

    // Validate input - at least one setting must be provided
    if (
      typeof level1WeekendFollowersOpen !== 'boolean' && 
      typeof level2WeekendFollowersOpen !== 'boolean' &&
      typeof level1DayFollowersOpen !== 'boolean' &&
      typeof level2DayFollowersOpen !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'At least one setting must be provided' },
        { status: 400 }
      );
    }

    await updateWaitlistSettings({
      level1WeekendFollowersOpen,
      level2WeekendFollowersOpen,
      level1DayFollowersOpen,
      level2DayFollowersOpen,
    });

    const updatedSettings = await getWaitlistSettings();
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating waitlist settings:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist settings' },
      { status: 500 }
    );
  }
}
