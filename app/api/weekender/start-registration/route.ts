import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent, getSessionStatus } from '@/lib/redis';
import { hasCompletedRegistration } from '@/lib/db';
import { logInfo, logError } from '@/lib/blobLogger';

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

    // Check both in parallel
    const [alreadyRegistered, currentStatus] = await Promise.all([
      hasCompletedRegistration(sessionId),
      getSessionStatus(sessionId),
    ]);

    if (alreadyRegistered || currentStatus === 'payment_complete') {
      return NextResponse.json(
        { 
          error: 'already_registered',
          message: 'This session has already completed registration. If this is incorrect, please check with your name and surname.'
        },
        { status: 409 }
      );
    }

    // Log events (non-blocking - don't wait)
    logWeekenderEvent(sessionId, 'registration_started', {
      userAgent: request.headers.get('user-agent'),
    }).catch(console.error);

    logInfo('weekender_start', 'Registration started', { sessionId }).catch(console.error);

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Registration started'
    });

  } catch (error) {
    logError('weekender_start', 'Error starting registration', {}, error instanceof Error ? error : new Error(String(error))).catch(console.error);
    return NextResponse.json(
      { error: 'Failed to start registration. Please try again.' },
      { status: 500 }
    );
  }
}
