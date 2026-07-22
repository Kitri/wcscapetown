import { NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/googleSheets';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function generateOrderRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SS-${timestamp}-${random}`;
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

  // Validate required fields
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
  const role = isNonEmptyString(data.role) ? (data.role as string).trim() : '';
  const experience = isNonEmptyString(data.experience) ? (data.experience as string).trim() : '';
  const timestamp = new Date().toISOString();
  const orderRef = generateOrderRef();

  // Check env vars
  if (!process.env.YOCO_CO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
    console.error('Missing YOCO_CO_SECRET_KEY or NEXT_PUBLIC_BASE_URL');
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
  }

  // Append to Google Sheet (placeholder — set SHEET_ID_SWINGSTRONG in env once sheet is created)
  const sheetId = process.env.SHEET_ID_SWINGSTRONG;
  if (sheetId) {
    try {
      // Columns: Timestamp | Name | Surname | Email | Role | Experience | OrderRef | PaymentStatus
      await appendToSheet(sheetId, 'Sheet1!A:H', [
        [timestamp, name, surname, email, role, experience, orderRef, 'pending'],
      ]);
    } catch (err) {
      // Log but don't block payment — sheet logging is best-effort
      console.error('Swingstrong sheet append error:', err);
    }
  }

  // Create Yoco checkout
  const amountCents = 40000; // R400

  const yocoBody = {
    amount: amountCents,
    currency: 'ZAR',
    successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/swingstrong/success?ref=${orderRef}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/swingstrong/cancelled?ref=${orderRef}`,
    failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/swingstrong/cancelled?ref=${orderRef}`,
    metadata: {
      orderId: orderRef,
      customerEmail: email,
      source: 'swingstrong_workshop',
    },
    lineItems: [
      {
        displayName: 'Swing Strong Workshop',
        quantity: 1,
        pricingDetails: { price: amountCents },
        description: 'Swing Strong: Mobility & Movement for WCS — 6 September 2026',
      },
    ],
  };

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

    if (!yocoResponse.ok) {
      console.error('Yoco error for swingstrong:', yocoData);
      return NextResponse.json({ error: 'Failed to create payment. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: yocoData.redirectUrl,
      reference: orderRef,
    });
  } catch (err) {
    console.error('Swingstrong registration error:', err);
    return NextResponse.json({ error: 'Failed to process registration. Please try again.' }, { status: 500 });
  }
}
