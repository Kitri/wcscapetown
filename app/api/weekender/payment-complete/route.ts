import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent } from '@/lib/redis';
import { updateRegistrationPaymentStatus } from '@/lib/db';
import { logInfo, logError } from '@/lib/blobLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, reference } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Log payment complete event in Redis
    await logWeekenderEvent(sessionId, 'payment_complete', {
      reference,
      completedAt: new Date().toISOString(),
    });

    // Update registration status in Postgres
    await updateRegistrationPaymentStatus(sessionId, 'complete');

    await logInfo('weekender_payment', 'Payment complete', { sessionId, reference });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully'
    });

  } catch (error) {
    await logError('weekender_payment', 'Error recording payment', {}, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to record payment. Please contact support.' },
      { status: 500 }
    );
  }
}
