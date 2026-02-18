import { NextRequest, NextResponse } from 'next/server';
import { shouldWaitlistRole } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, level, passType } = body as {
      role: 'L' | 'F';
      level: 1 | 2;
      passType: 'weekend' | 'day' | 'party';
    };

    // Only apply waitlist logic to weekend passes
    if (passType !== 'weekend') {
      return NextResponse.json({
        shouldWaitlist: false,
        message: ''
      });
    }

    const result = await shouldWaitlistRole(role, level);

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
