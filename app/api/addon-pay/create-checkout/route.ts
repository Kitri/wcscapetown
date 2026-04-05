import { NextRequest, NextResponse } from 'next/server';
import { getDb, upsertWeekendAddOnEntry, type WeekendAddOnPassType } from '@/lib/db';
import { logApiResponse, getNextOrderNumber } from '@/lib/blobLogger';

type SelectedItem = {
  type: 'spin' | 'spot' | 'tshirt';
  couple?: boolean; // spotlight critique only
  quantity?: number; // tshirt only
};

function calculateItemAmount(item: SelectedItem): number {
  switch (item.type) {
    case 'spin':
      return 20_000; // R200
    case 'spot':
      return item.couple ? 25_000 : 12_500; // R250 or R125
    case 'tshirt':
      return 18_000 * (item.quantity ?? 1); // R180 per shirt
    default:
      return 0;
  }
}

function itemDisplayName(item: SelectedItem): string {
  switch (item.type) {
    case 'spin':
      return 'Spinning Intensive';
    case 'spot':
      return item.couple ? 'Spotlight Critique (Couple)' : 'Spotlight Critique';
    case 'tshirt':
      return `T-Shirt x${item.quantity ?? 1}`;
    default:
      return '';
  }
}

function noteForItem(item: SelectedItem): string | null {
  if (item.type === 'spot' && item.couple) return 'couple';
  if (item.type === 'tshirt') return String(item.quantity ?? 1);
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? '').trim();
    const surname = String(body?.surname ?? '').trim();
    const items: SelectedItem[] = Array.isArray(body?.items) ? body.items : [];

    if (!name || !surname) {
      return NextResponse.json(
        { error: 'Name and surname are required.' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one item to pay for.' },
        { status: 400 }
      );
    }

    // Validate items
    const validTypes: WeekendAddOnPassType[] = ['spin', 'spot', 'tshirt'];
    for (const item of items) {
      if (!validTypes.includes(item.type)) {
        return NextResponse.json(
          { error: `Invalid item type: ${item.type}` },
          { status: 400 }
        );
      }
      if (item.type === 'tshirt' && (!item.quantity || item.quantity < 1)) {
        return NextResponse.json(
          { error: 'T-shirt quantity must be at least 1.' },
          { status: 400 }
        );
      }
    }

    if (!process.env.YOCO_CO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: 'Payment system not configured.' },
        { status: 500 }
      );
    }

    const sql = getDb();

    // Look up member by name and surname
    const memberResult = await sql`
      SELECT member_id
      FROM members
      WHERE LOWER(name) = LOWER(${name})
        AND LOWER(surname) = LOWER(${surname})
      LIMIT 1
    `;

    if (memberResult.length === 0) {
      return NextResponse.json(
        { error: `Could not find a member named ${name} ${surname}. Please check the spelling and try again.` },
        { status: 404 }
      );
    }

    const memberId = Number(memberResult[0].member_id);

    // Look up registration by member_id where pass_type is weekend or day
    const registrationResult = await sql`
      SELECT id
      FROM registrations
      WHERE member_id = ${memberId}
        AND pass_type IN ('weekend', 'day')
      ORDER BY
        CASE registration_status
          WHEN 'complete' THEN 1
          WHEN 'pending' THEN 2
          WHEN 'waitlist' THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT 1
    `;

    if (registrationResult.length === 0) {
      return NextResponse.json(
        { error: `No weekender registration found for ${name} ${surname}. Please contact weekender@wcscapetown.co.za for help.` },
        { status: 404 }
      );
    }

    const registrationId = Number(registrationResult[0].id);

    // Calculate total
    const totalAmountCents = items.reduce((sum, item) => sum + calculateItemAmount(item), 0);

    // Insert one pending row per add-on type
    for (const item of items) {
      await upsertWeekendAddOnEntry({
        memberId,
        registrationId,
        passType: item.type,
        paymentStatus: 'pending',
        note: noteForItem(item),
      });
    }

    const orderId = await getNextOrderNumber();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const lineItems = items.map((item) => ({
      displayName: itemDisplayName(item),
      quantity: 1,
      pricingDetails: {
        price: calculateItemAmount(item),
      },
    }));

    const yocoRequestBody = {
      amount: totalAmountCents,
      currency: 'ZAR',
      successUrl: `${baseUrl}/addon-pay/success?ref=${orderId}`,
      cancelUrl: `${baseUrl}/addon-pay/cancelled`,
      failureUrl: `${baseUrl}/addon-pay/failed`,
      metadata: {
        orderId,
        customerId: `MEMBER-${memberId}`,
        source: 'addon_pay_outstanding',
        memberIds: String(memberId),
      },
      lineItems,
    };

    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.YOCO_CO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yocoRequestBody),
    });

    const yocoData = await yocoResponse.json().catch(() => ({}));

    logApiResponse(
      'yoco',
      'https://payments.yoco.com/api/checkouts',
      yocoRequestBody,
      yocoResponse.status,
      yocoData
    ).catch(console.error);

    if (!yocoResponse.ok || !yocoData?.redirectUrl) {
      return NextResponse.json(
        { error: 'Failed to create payment checkout.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: String(yocoData.redirectUrl),
      reference: orderId,
      totalAmountCents,
    });
  } catch (error) {
    console.error('Add-on pay checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong.' },
      { status: 500 }
    );
  }
}
