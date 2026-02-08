import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request
    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.YOCO_SECRET_KEY) {
      console.error('YOCO_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('NEXT_PUBLIC_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // 2. Create unique reference
    const timestamp = Date.now();
    const reference = `test_${timestamp}`;

    // 3. Call Yoco API to create checkout
    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 2000, // R20.00 in cents (Yoco expects cents)
        currency: 'ZAR',
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/test-payment/success?ref=${reference}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/test-payment/cancelled`,
        failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/test-payment/failed`,
        metadata: {
          reference,
          name: trimmedName,
          testPayment: 'true',
          createdAt: new Date().toISOString()
        }
      })
    });

    // Check if Yoco API call succeeded
    if (!yocoResponse.ok) {
      const errorText = await yocoResponse.text();
      console.error('Yoco API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create payment. Please try again.' },
        { status: 500 }
      );
    }

    const yocoData = await yocoResponse.json();

    // 4. Store payment metadata in Vercel KV
    try {
      await kv.set(`payment:${reference}`, {
        reference,
        name: trimmedName,
        amount: 2000,
        currency: 'ZAR',
        status: 'pending',
        checkoutId: yocoData.id,
        createdAt: new Date().toISOString(),
        yocoResponse: yocoData // Store full Yoco response for traceability
      });

      // Set expiry: 1 hour (payments should complete quickly)
      await kv.expire(`payment:${reference}`, 3600);
    } catch (kvError) {
      // Log KV error but don't fail the payment - KV might not be configured locally
      console.warn('KV storage warning (payment will still work):', kvError);
    }

    console.log('✅ Payment checkout created:', {
      reference,
      name: trimmedName,
      checkoutId: yocoData.id
    });

    // 5. Return checkout URL to frontend
    return NextResponse.json({
      checkoutUrl: yocoData.redirectUrl,
      reference
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment. Please try again.' },
      { status: 500 }
    );
  }
}
