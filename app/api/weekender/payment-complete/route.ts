import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent, getOrderMemberIds } from '@/lib/redis';
import { completeRegistration, isOrderExpired, expireRegistrationsByOrder } from '@/lib/db';
import { logInfo, logError } from '@/lib/blobLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, reference } = body;

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json(
        { error: 'Order reference is required' },
        { status: 400 }
      );
    }

    // Check if the registration has expired (past 5 min timeout)
    const expired = await isOrderExpired(reference);
    if (expired) {
      // Mark registrations as expired
      await expireRegistrationsByOrder(reference);
      
      logWeekenderEvent(sessionId || reference, 'payment_expired', {
        reference,
        reason: 'Registration timeout exceeded',
      }).catch(console.error);
      
      logError('weekender_payment', 'Payment received but registration expired', { sessionId, reference }).catch(console.error);
      
      return NextResponse.json({
        success: false,
        error: 'registration_expired',
        message: 'Your registration has expired. The 5-minute payment window has passed. Please start a new registration.'
      }, { status: 410 }); // 410 Gone
    }

    // Get member_ids from Redis using orderId (reference)
    const memberIds = await getOrderMemberIds(reference);
    
    // Log payment complete event in Redis (non-blocking)
    logWeekenderEvent(sessionId || reference, 'payment_complete', {
      reference,
      memberIds,
      completedAt: new Date().toISOString(),
    }).catch(console.error);

    // Complete each member's registration
    await Promise.all(memberIds.map(memberId => completeRegistration(memberId)));

    logInfo('weekender_payment', 'Payment complete', { sessionId, reference }).catch(console.error);

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
