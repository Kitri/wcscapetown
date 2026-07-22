import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSheetValues, updateSheetValues } from '@/lib/googleSheets';
import {
  completeRegistration,
  updateRegistrationPaymentStatusByOrder,
  updateYocoPaymentId,
  getOrderIdByCheckoutId,
  getRegistrationIdsByOrderId,
  updateWeekendAddOnPaymentStatusByRegistrationIds,
  updateWeekendAddOnPaymentStatusByMemberIds,
  updateAllPendingWeekendAddOnsByMemberIds,
} from '@/lib/db';
import { logApiResponse } from '@/lib/blobLogger';
import {
  type AddOnPassType,
  type AddOnRegistrationType,
  getParticipantsForRegistrationType,
  resolveAddOnPaymentLookup,
  toWeekendAddOnPassType,
} from '@/lib/weekenderAddOnPayments';

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
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
  }

  // Reject events older than 3 minutes (prevents replay attacks)
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - parseInt(webhookTime, 10));
  if (ageSeconds > 180) {
    return NextResponse.json({ error: 'Request expired' }, { status: 400 });
  }

  // Reject if signature doesn't match
  if (!verifySignature(rawBody, webhookId, webhookTime, webhookSig)) {
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
      registrationType?: string;
      memberIds?: string;
    };
  };
}

function parseAddOnPassTypeFromSource(source: string | undefined): AddOnPassType | null {
  if (source === 'addon_spinning_intensive') return 'spinning_intensive';
  if (source === 'addon_spotlight_critique') return 'spotlight_critique';
  return null;
}

function parseAddOnRegistrationType(value: string | undefined): AddOnRegistrationType {
  return value === 'couple' ? 'couple' : 'single';
}

function parseMemberIds(value: string | undefined): number[] {
  if (!value) return [];
  const ids = value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((num) => Number.isInteger(num) && num > 0);
  return Array.from(new Set(ids));
}

async function resolveAddOnMemberIdsFromMetadata(
  passType: AddOnPassType,
  customerEmail: string | undefined,
  registrationTypeRaw: string | undefined
): Promise<number[]> {
  if (!customerEmail) return [];

  try {
    const lookup = await resolveAddOnPaymentLookup(customerEmail, passType);
    if (lookup.lookupStatus !== 'ready' || !lookup.primary) return [];

    const registrationType: AddOnRegistrationType =
      passType === 'spinning_intensive'
        ? 'single'
        : parseAddOnRegistrationType(registrationTypeRaw);
    const participants = getParticipantsForRegistrationType(lookup, registrationType);
    return participants.map((participant) => participant.memberId);
  } catch {
    return [];
  }
}

// ─── Swing Strong sheet helper ───────────────────────────────────────────────

// Sheet columns: A=Timestamp B=Email C=First Name D=Surname E=Role F=Level G=OrderRef H=Paid I=PaymentId
async function updateSwingStrongPaymentStatus(orderId: string, status: string, paymentId?: string): Promise<void> {
  const sheetId = process.env.SHEET_ID_SWINGSTRONG;
  if (!sheetId) {
    console.warn('SHEET_ID_SWINGSTRONG not set — cannot update payment status for', orderId);
    return;
  }

  try {
    const rows = await getSheetValues(sheetId, "'jeff workshop'!A:I");
    const rowIndex = rows.findIndex((row) => row[6] === orderId); // column G (index 6) = OrderRef
    if (rowIndex === -1) {
      console.warn('Swingstrong order not found in sheet:', orderId);
      return;
    }
    // Rows are 1-indexed in Sheets API; header is row 1 so data starts at row 2
    const sheetRowNumber = rowIndex + 1;
    // Update H (Paid) and I (PaymentId) in one write
    await updateSheetValues(sheetId, `'jeff workshop'!H${sheetRowNumber}:I${sheetRowNumber}`, [
      [status, paymentId ?? ''],
    ]);
  } catch (err) {
    console.error('Failed to update swingstrong sheet status:', err);
  }
}

// ─── Event handler ────────────────────────────────────────────────────────────

async function handleEvent(event: YocoEvent) {

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
      const source = event.payload.metadata?.source;

      // Handle Swing Strong workshop payment
      // - event.payload.id = payment ID (the actual payment processed by Yoco)
      // - event.payload.metadata.orderId = our SS-xxx order reference (Google Sheet lookup key)
      // - event.payload.metadata.checkoutId = Yoco checkout ID (links to yoco_api_results.response_id)
      if (source === 'swingstrong_workshop') {
        const orderId = event.payload.metadata?.orderId;
        const paymentId = event.payload.id;
        const checkoutId = event.payload.metadata?.checkoutId;
        const amount = event.payload.amount;
        const apiCreatedDate = event.payload.createdDate;

        // Update Google Sheet: mark row as paid and record the payment ID
        if (orderId) {
          await updateSwingStrongPaymentStatus(orderId, 'paid', paymentId);
        }

        // Update yoco_api_results: store the payment ID against the checkout ID
        if (checkoutId && paymentId) {
          await updateYocoPaymentId(checkoutId, paymentId, amount, apiCreatedDate || null);
        }

        return;
      }

      // Handle outstanding add-on payments (combined spin/spot/tshirt checkout)
      if (source === 'addon_pay_outstanding') {
        const memberIds = parseMemberIds(event.payload.metadata?.memberIds);
        if (memberIds.length > 0) {
          await updateAllPendingWeekendAddOnsByMemberIds(memberIds);
        }
        return;
      }

      const addOnPassType = parseAddOnPassTypeFromSource(source);
      if (addOnPassType) {
        let memberIds = parseMemberIds(event.payload.metadata?.memberIds);
        if (memberIds.length === 0) {
          memberIds = await resolveAddOnMemberIdsFromMetadata(
            addOnPassType,
            event.payload.metadata?.customerEmail,
            event.payload.metadata?.registrationType
          );
        }

        if (memberIds.length === 0) {
          return;
        }

        await updateWeekendAddOnPaymentStatusByMemberIds(
          memberIds,
          toWeekendAddOnPassType(addOnPassType),
          'complete'
        );

        return;
      }
      const checkoutId = event.payload.metadata?.checkoutId;
      const paymentId = event.payload.id; // This is the Yoco payment ID
      const amount = event.payload.amount;
      const apiCreatedDate = event.payload.createdDate;

      if (!checkoutId) {
        return;
      }

      // Update payment_id, amount, and api_created_date in yoco_api_results
      if (paymentId) {
        await updateYocoPaymentId(checkoutId, paymentId, amount, apiCreatedDate || null);
      }

      // Get orderId from yoco_api_results via checkoutId
      const orderId = await getOrderIdByCheckoutId(checkoutId);
      if (!orderId) {
        return;
      }

      // Get registration IDs directly from database using orderId
      const registrationIds = await getRegistrationIdsByOrderId(orderId);

      if (registrationIds.length === 0) {
        return;
      }

      // Complete each registration by registration_id (precise, no cross-pass-type updates)
      await Promise.all(registrationIds.map(registrationId => completeRegistration(registrationId)));
      await updateWeekendAddOnPaymentStatusByRegistrationIds(registrationIds, 'complete');

      break;
    }

    case 'payment.failed': {
      const source = event.payload.metadata?.source;

      // Handle outstanding add-on payment failures
      if (source === 'addon_pay_outstanding') {
        const memberIds = parseMemberIds(event.payload.metadata?.memberIds);
        if (memberIds.length > 0) {
          // Mark pending entries as failed
          const { getDb } = await import('@/lib/db');
          const sql = getDb();
          for (const memberId of memberIds) {
            await sql`
              UPDATE weekend_add_ons
              SET
                payment_status = 'failed',
                updated_at = now() AT TIME ZONE 'Africa/Johannesburg'
              WHERE member_id = ${memberId}
                AND payment_status = 'pending'
            `;
          }
        }
        return;
      }

      const addOnPassType = parseAddOnPassTypeFromSource(source);
      if (addOnPassType) {
        let memberIds = parseMemberIds(event.payload.metadata?.memberIds);
        if (memberIds.length === 0) {
          memberIds = await resolveAddOnMemberIdsFromMetadata(
            addOnPassType,
            event.payload.metadata?.customerEmail,
            event.payload.metadata?.registrationType
          );
        }

        if (memberIds.length === 0) {
          return;
        }

        await updateWeekendAddOnPaymentStatusByMemberIds(
          memberIds,
          toWeekendAddOnPassType(addOnPassType),
          'failed'
        );

        return;
      }
      const checkoutId = event.payload.metadata?.checkoutId;

      if (!checkoutId) {
        return;
      }

      // Get orderId from checkoutId
      const orderId = await getOrderIdByCheckoutId(checkoutId);
      if (!orderId) {
        return;
      }

      // Mark registrations as failed
      await updateRegistrationPaymentStatusByOrder(orderId, 'failed');
      const failedRegistrationIds = await getRegistrationIdsByOrderId(orderId);
      await updateWeekendAddOnPaymentStatusByRegistrationIds(failedRegistrationIds, 'failed');

      break;
    }

    case 'payment.cancelled': {
      const checkoutId = event.payload.metadata?.checkoutId;

      if (checkoutId) {
        // Don't update status — user might retry
      }
      break;
    }

    default:
      // Ignore other event types — return 200 so Yoco doesn't retry
      break;
  }
}

// Yoco might send a GET request to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
