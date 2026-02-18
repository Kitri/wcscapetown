import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent } from '@/lib/redis';
import { updateRegistrationPaymentStatus } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Log payment cancelled event in Redis
    logWeekenderEvent(sessionId, 'payment_cancelled', {
      cancelledAt: new Date().toISOString(),
    }).catch(console.error);

    // Update registration status in Postgres (mark as failed/cancelled)
    updateRegistrationPaymentStatus(sessionId, 'failed').catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Payment cancellation recorded'
    });

  } catch (error) {
    console.error('Error recording payment cancellation:', error);
    return NextResponse.json(
      { error: 'Failed to record cancellation' },
      { status: 500 }
    );
  }
}
