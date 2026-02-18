import { NextRequest, NextResponse } from 'next/server';
import { shouldWaitlistRole, shouldWaitlistDayPassRole } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, level, passType } = body as {
      role: 'L' | 'F';
      level: 1 | 2;
      passType: 'weekend' | 'day' | 'party';
    };

    // Party passes don't have waitlist logic
    if (passType === 'party') {
      return NextResponse.json({
        shouldWaitlist: false,
        message: ''
      });
    }

    // Use appropriate function based on pass type
    const result = passType === 'day' 
      ? await shouldWaitlistDayPassRole(role, level)
      : await shouldWaitlistRole(role, level);

    return NextResponse.json({
      shouldWaitlist: result.shouldWaitlist,
      leads: result.leads,
      followers: result.followers,
      waitlistCount: result.waitlistCount,
      message: result.message
    });

  } catch (error) {
    console.error('Error checking role balance:', error);
    return NextResponse.json(
      { error: 'Failed to check role balance' },
      { status: 500 }
    );
  }
}
