import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface YocoWebhookPayload {
  id: string;
  type: string;
  createdDate: string;
  payload: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata?: {
      reference?: string;
      name?: string;
      testPayment?: string;
      createdAt?: string;
    };
  };
}

interface PaymentData {
  reference: string;
  name: string;
  amount: number;
  currency: string;
  status: string;
  checkoutId: string;
  createdAt: string;
  paymentId?: string;
  paidAt?: string;
  failedAt?: string;
  yocoResponse?: unknown;
  webhookPayload?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse webhook payload
    const payload: YocoWebhookPayload = await request.json();

    console.log('📥 Webhook received:', {
      type: payload.type,
      paymentId: payload.payload?.id,
      timestamp: new Date().toISOString()
    });

    // 2. Handle different event types
    if (payload.type === 'payment.succeeded') {
      const reference = payload.payload.metadata?.reference;
      const paymentId = payload.payload.id;
      const amount = payload.payload.amount;

      if (!reference) {
        console.error('No reference in webhook payload');
        return NextResponse.json({ received: true });
      }

      // 3. Update payment status in KV
      try {
        const existingPayment = await kv.get<PaymentData>(`payment:${reference}`);

        if (existingPayment) {
          await kv.set(`payment:${reference}`, {
            ...existingPayment,
            status: 'paid',
            paymentId,
            paidAt: new Date().toISOString(),
            webhookPayload: payload // Store webhook for traceability
          });

          // Remove expiry since payment is complete
          await kv.persist(`payment:${reference}`);

          console.log('✅ Payment succeeded:', {
            reference,
            amount,
            paymentId,
            name: existingPayment.name
          });

          // TODO: Send confirmation email here
          // await sendConfirmationEmail(existingPayment.name, existingPayment.email);

        } else {
          console.warn('Payment not found in KV:', reference);
        }
      } catch (kvError) {
        console.error('KV update error:', kvError);
      }

    } else if (payload.type === 'payment.failed') {
      const reference = payload.payload.metadata?.reference;

      if (reference) {
        try {
          const existingPayment = await kv.get<PaymentData>(`payment:${reference}`);

          if (existingPayment) {
            await kv.set(`payment:${reference}`, {
              ...existingPayment,
              status: 'failed',
              failedAt: new Date().toISOString(),
              webhookPayload: payload
            });
          }
        } catch (kvError) {
          console.error('KV update error:', kvError);
        }

        console.log('❌ Payment failed:', reference);
      }

    } else if (payload.type === 'payment.refunded') {
      const reference = payload.payload.metadata?.reference;

      if (reference) {
        try {
          const existingPayment = await kv.get<PaymentData>(`payment:${reference}`);

          if (existingPayment) {
            await kv.set(`payment:${reference}`, {
              ...existingPayment,
              status: 'refunded',
              refundedAt: new Date().toISOString(),
              webhookPayload: payload
            });
          }
        } catch (kvError) {
          console.error('KV update error:', kvError);
        }

        console.log('💰 Payment refunded:', reference);
      }

    } else {
      console.log('Unhandled webhook type:', payload.type);
    }

    // 4. Always return 200 to acknowledge receipt
    // If we don't return 200, Yoco will retry the webhook
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);

    // Still return 200 to prevent retries
    // Log the error for investigation
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

// Yoco might send a GET request to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
