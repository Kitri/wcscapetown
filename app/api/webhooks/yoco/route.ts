import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderMemberIds } from '@/lib/redis';
import { completeRegistration, updateRegistrationPaymentStatusByOrder, updateYocoPaymentId, getOrderIdByCheckoutId } from '@/lib/db';
import { logApiResponse } from '@/lib/blobLogger';

// ─── Signature verification ───────────────────────────────────────────────────

function verifySignature(
  rawBody: string,
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string
): boolean {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) {
    console.error('YOCO_WEBHOOK_SECRET not configured');
    return false;
  }

  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64');
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Header may contain multiple space-separated signatures (e.g. "v1,abc123 v1,xyz456")
  // Strip the "v1," version prefix from each and check for a match
  for (const sig of webhookSignature.split(' ')) {
    const actual = sig.split(',').slice(1).join(',');
    try {
      const a = Buffer.from(expectedSignature);
      const b = Buffer.from(actual);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
    } catch {
      // length mismatch — not a match
    }
  }

  return false;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rawBody = await request.text(); // must read raw — not request.json()
  const webhookId = request.headers.get('webhook-id') ?? '';
  const webhookTime = request.headers.get('webhook-timestamp') ?? '';
  const webhookSig = request.headers.get('webhook-signature') ?? '';

  // Reject if any required headers are missing
  if (!webhookId || !webhookTime || !webhookSig) {
    console.warn('Yoco webhook missing headers');
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
  }

  // Reject events older than 3 minutes (prevents replay attacks)
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - parseInt(webhookTime, 10));
  if (ageSeconds > 180) {
    console.warn('Yoco webhook expired', { ageSeconds });
    return NextResponse.json({ error: 'Request expired' }, { status: 400 });
  }

  // Reject if signature doesn't match
  if (!verifySignature(rawBody, webhookId, webhookTime, webhookSig)) {
    console.warn('Yoco webhook invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse and handle the event
  const event = JSON.parse(rawBody);

  try {
    await handleEvent(event);
  } catch (err) {
    console.error('Yoco webhook handler error:', err);
    // Returning 500 tells Yoco to retry — only do this for transient errors
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}

// ─── Event handler ────────────────────────────────────────────────────────────

interface YocoEvent {
  id: string;
  type: string;
  createdDate?: string;
  payload: {
    id: string; // Yoco payment ID
    status: string;
    amount: number;
    currency: string;
    createdDate?: string;
    metadata?: {
      orderId?: string;
      checkoutId?: string;
      customerId?: string;
      customerEmail?: string;
      source?: string;
      bootcampType?: string;
    };
  };
}

async function handleEvent(event: YocoEvent) {
  console.log(`Yoco event received: ${event.type} [${event.id}]`);

  // Log webhook event to blob storage (non-blocking)
  logApiResponse(
    'yoco_webhook',
    '/api/webhooks/yoco',
    { eventType: event.type, eventId: event.id },
    200,
    event
  ).catch(console.error);

  switch (event.type) {
    case 'payment.succeeded': {
      const checkoutId = event.payload.metadata?.checkoutId;
      const paymentId = event.payload.id; // This is the Yoco payment ID
      const amount = event.payload.amount;
      const apiCreatedDate = event.payload.createdDate;

      if (!checkoutId) {
        console.warn('No checkoutId in webhook metadata', { eventId: event.id });
        return;
      }

      console.log('Processing payment.succeeded', { checkoutId, paymentId, amount });

      // Update payment_id, amount, and api_created_date in yoco_api_results
      if (paymentId) {
        await updateYocoPaymentId(checkoutId, paymentId, amount, apiCreatedDate || null);
      }

      // Get orderId from yoco_api_results via checkoutId to find member IDs
      const orderId = await getOrderIdByCheckoutId(checkoutId);
      if (!orderId) {
        console.warn('No orderId found for checkout', { checkoutId });
        return;
      }

      // Get member IDs from Redis using orderId
      const memberIds = await getOrderMemberIds(orderId);

      if (memberIds.length === 0) {
        console.warn('No member IDs found for order', { orderId });
        return;
      }

      // Complete each member's registration
      await Promise.all(memberIds.map(memberId => completeRegistration(memberId)));

      console.log('✅ Payment succeeded - registrations completed', {
        checkoutId,
        orderId,
        paymentId,
        memberIds,
        amount: amount / 100, // Convert from cents
      });
      break;
    }

    case 'payment.failed': {
      const checkoutId = event.payload.metadata?.checkoutId;

      if (!checkoutId) {
        console.warn('No checkoutId in failed payment webhook', { eventId: event.id });
        return;
      }

      // Get orderId from checkoutId
      const orderId = await getOrderIdByCheckoutId(checkoutId);
      if (!orderId) {
        console.warn('No orderId found for failed checkout', { checkoutId });
        return;
      }

      console.log('Processing payment.failed', { checkoutId, orderId });

      // Mark registrations as failed
      await updateRegistrationPaymentStatusByOrder(orderId, 'failed');

      console.log('❌ Payment failed - registrations marked as failed', { checkoutId, orderId });
      break;
    }

    case 'payment.cancelled': {
      const checkoutId = event.payload.metadata?.checkoutId;

      if (checkoutId) {
        console.log('Payment cancelled', { checkoutId });
        // Don't update status — user might retry
      }
      break;
    }

    default:
      // Ignore other event types — return 200 so Yoco doesn't retry
      console.log('Unhandled event type:', event.type);
      break;
  }
}

// Yoco might send a GET request to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
