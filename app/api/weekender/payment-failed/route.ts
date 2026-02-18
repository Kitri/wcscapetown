import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent, getOrderMemberIds } from '@/lib/redis';
import { updateRegistrationPaymentStatus } from '@/lib/db';

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

    // Get member_ids from Redis using orderId (reference) and update payment status (non-blocking)
    getOrderMemberIds(reference)
      .then(memberIds => {
        // Log payment failed event in Redis
        logWeekenderEvent(sessionId || reference, 'payment_failed', {
          reference,
          memberIds,
          failedAt: new Date().toISOString(),
        }).catch(console.error);
        
        return Promise.all(memberIds.map(id => updateRegistrationPaymentStatus(id, 'failed')));
      })
      .catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Payment failure recorded'
    });

  } catch (error) {
    console.error('Error recording payment failure:', error);
    return NextResponse.json(
      { error: 'Failed to record payment failure' },
      { status: 500 }
    );
  }
}
