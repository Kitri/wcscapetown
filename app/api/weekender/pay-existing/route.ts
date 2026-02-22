import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveYocoApiResult, getRegistrationIdByOrderId } from '@/lib/db';
import { setOrderMemberIds } from '@/lib/redis';
import { logApiResponse, logError, logInfo } from '@/lib/blobLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, sessionId } = body as {
      orderId: string;
      sessionId: string;
    };

    if (!orderId || !sessionId) {
      return NextResponse.json(
        { error: 'Order ID and session ID are required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.YOCO_CO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('Missing required environment variables');
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    // Get registration details (need email and member_id for payment, so query directly)
    const sql = getDb();
    const result = await sql`
      SELECT 
        r.member_id,
        r.email,
        r.pass_type,
        r.amount_cents,
        r.payment_status,
        r.registration_status
      FROM registrations r
      WHERE r.order_id = ${orderId.trim()}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const registration = result[0];

    // Check if already paid
    if (registration.payment_status === 'complete' && registration.registration_status === 'complete') {
      return NextResponse.json(
        { error: 'This registration has already been paid' },
        { status: 400 }
      );
    }

    // Store member_ids in Redis for payment callback
    await setOrderMemberIds(orderId, [registration.member_id]);

    // Build pass display name
    let passDisplayName = 'Weekend Pass';
    if (registration.pass_type === 'day') {
      passDisplayName = 'Day Pass';
    } else if (registration.pass_type === 'party') {
      passDisplayName = 'Party Pass';
    } else if (registration.pass_type === 'bootcamp') {
      passDisplayName = 'Bootcamp';
    }

    // Determine success/cancel/failure URLs based on pass type
    const baseSuccessUrl = registration.pass_type === 'bootcamp' 
      ? '/bookbootcamp/success' 
      : '/bookweekender/success';
    const baseCancelUrl = registration.pass_type === 'bootcamp'
      ? '/bookbootcamp'
      : '/bookweekender';

    // Log payment initiation
    logInfo('existing_payment', 'Initiating payment for existing registration', {
      orderId,
      memberId: registration.member_id,
      passType: registration.pass_type,
      amountCents: registration.amount_cents,
    }).catch(console.error);

    // Build Yoco request
    const yocoRequestBody = {
      amount: registration.amount_cents,
      currency: 'ZAR',
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}${baseSuccessUrl}?ref=${orderId}&session=${sessionId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}${baseCancelUrl}?order-id=${orderId}&cancelled=true`,
      failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}${baseCancelUrl}?order-id=${orderId}&failed=true`,
      metadata: {
        orderId,
        customerId: `MEMBER-${registration.member_id}`,
        customerEmail: registration.email,
        source: 'existing_registration_payment',
      },
      lineItems: [
        {
          displayName: passDisplayName,
          quantity: 1,
          pricingDetails: {
            price: registration.amount_cents,
          },
          description: `${passDisplayName} - WCS Cape Town`,
        },
      ],
    };

    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOCO_CO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yocoRequestBody),
    });

    const yocoData = await yocoResponse.json();
    const requestTimestamp = new Date();

    // Log the API response to blob
    logApiResponse(
      'yoco',
      'https://payments.yoco.com/api/checkouts',
      yocoRequestBody,
      yocoResponse.status,
      yocoData
    ).catch(console.error);

    // Save Yoco API result to database (non-blocking)
    if (yocoData.id) {
      getRegistrationIdByOrderId(orderId).then(registrationId => {
        if (registrationId) {
          saveYocoApiResult({
            requestTimestamp,
            requestAmount: registration.amount_cents,
            registrationId,
            responseStatus: yocoResponse.status,
            paymentId: null, // Will be updated via webhook
            responseId: yocoData.id, // checkoutId
            processingMode: yocoData.processingMode || null,
          }).catch(console.error);
        }
      }).catch(console.error);
    }

    if (!yocoResponse.ok) {
      logError('existing_payment', 'Yoco API error', {
        orderId,
        status: yocoResponse.status,
        error: yocoData,
      }).catch(console.error);

      return NextResponse.json(
        { error: 'Payment system error. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: yocoData.redirectUrl,
    });

  } catch (error) {
    console.error('Error initiating payment:', error);
    logError('existing_payment', 'Payment initiation error', {}, error as Error).catch(console.error);
    
    return NextResponse.json(
      { error: 'Failed to initiate payment. Please try again.' },
      { status: 500 }
    );
  }
}
