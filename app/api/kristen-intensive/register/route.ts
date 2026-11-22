import { NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/googleSheets';
import { logInfo, logError, logApiResponse } from '@/lib/blobLogger';
import { saveSwingStrongYocoResult } from '@/lib/db';
import {
  KRISTEN_INTENSIVE_SHEET_ID,
  KRISTEN_INTENSIVE_RANGE,
  KRISTEN_INTENSIVE_PRICE_CENTS,
  KRISTEN_INTENSIVE_YOCO_SOURCE,
} from '@/lib/server/kristenIntensiveConfig';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function generateOrderRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KW-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;

  if (!isNonEmptyString(data.name)) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 });
  }
  if (!isNonEmptyString(data.surname)) {
    return NextResponse.json({ error: 'Surname is required' }, { status: 400 });
  }
  if (!isNonEmptyString(data.email)) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const email = (data.email as string).trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const name = (data.name as string).trim().slice(0, 100);
  const surname = (data.surname as string).trim().slice(0, 100);
  const role = isNonEmptyString(data.role) ? (data.role as string).trim().slice(0, 20) : '';
  const experience = isNonEmptyString(data.experience) ? (data.experience as string).trim().slice(0, 20) : '';
  const timestamp = new Date().toISOString();
  const orderRef = generateOrderRef();

  if (!process.env.YOCO_CO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
    console.error('Missing YOCO_CO_SECRET_KEY or NEXT_PUBLIC_BASE_URL');
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
  }

  logInfo('kristen_intensive_register', 'Registration started', { orderRef, email }).catch(console.error);

  // Write initial row to Google Sheet
  // Columns: A=Timestamp B=Email C=First Name D=Surname E=Role F=Level G=OrderID H=Status I=payment_id
  try {
    await appendToSheet(KRISTEN_INTENSIVE_SHEET_ID, KRISTEN_INTENSIVE_RANGE, [
      [timestamp, email, name, surname, role, experience, orderRef, 'pending', ''],
    ]);
  } catch (err) {
    // Best-effort — don't block payment if sheet write fails
    logError('kristen_intensive_register', 'Sheet append failed', { orderRef }, err instanceof Error ? err : new Error(String(err))).catch(console.error);
  }

  const amountCents = KRISTEN_INTENSIVE_PRICE_CENTS;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const yocoBody = {
    amount: amountCents,
    currency: 'ZAR',
    successUrl: `${baseUrl}/kristen-intensive/success?ref=${orderRef}`,
    cancelUrl: `${baseUrl}/kristen-intensive/cancelled?ref=${orderRef}`,
    failureUrl: `${baseUrl}/kristen-intensive/cancelled?ref=${orderRef}`,
    clientReferenceId: orderRef,
    metadata: {
      orderId: orderRef,
      customerEmail: email,
      source: KRISTEN_INTENSIVE_YOCO_SOURCE,
    },
    lineItems: [
      {
        displayName: 'Kristen Wallace Intensive',
        quantity: 1,
        pricingDetails: { price: amountCents },
        description: 'WCS intensive with Kristen Wallace — 16 December 2026, 15:00–17:00',
      },
    ],
  };

  const requestTimestamp = new Date();

  try {
    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.YOCO_CO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yocoBody),
    });

    const yocoData = await yocoResponse.json();

    logApiResponse(
      'yoco',
      'https://payments.yoco.com/api/checkouts',
      { ...yocoBody, metadata: { ...yocoBody.metadata } },
      yocoResponse.status,
      yocoData
    ).catch(console.error);

    if (!yocoResponse.ok) {
      logError('kristen_intensive_register', 'Yoco checkout failed', { orderRef, status: yocoResponse.status }).catch(console.error);
      return NextResponse.json({ error: 'Failed to create payment. Please try again.' }, { status: 500 });
    }

    const checkoutId: string = yocoData.id;

    // Same yoco_api_results insert as Swing Strong (no registrations table row for this event)
    saveSwingStrongYocoResult({
      requestTimestamp,
      requestAmount: amountCents,
      responseStatus: yocoResponse.status,
      responseId: checkoutId,
      processingMode: yocoData.processingMode || null,
    }).catch(err => logError('kristen_intensive_register', 'DB yoco_api_results write failed', { orderRef }, err instanceof Error ? err : new Error(String(err))).catch(console.error));

    logInfo('kristen_intensive_register', 'Checkout created', { orderRef, checkoutId }).catch(console.error);

    return NextResponse.json({
      success: true,
      checkoutUrl: yocoData.redirectUrl,
      reference: orderRef,
    });
  } catch (err) {
    logError('kristen_intensive_register', 'Unexpected error', { orderRef }, err instanceof Error ? err : new Error(String(err))).catch(console.error);
    return NextResponse.json({ error: 'Failed to process registration. Please try again.' }, { status: 500 });
  }
}
