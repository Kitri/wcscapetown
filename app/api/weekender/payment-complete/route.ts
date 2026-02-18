import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent, getOrderMemberIds } from '@/lib/redis';
import { completeRegistration } from '@/lib/db';
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
