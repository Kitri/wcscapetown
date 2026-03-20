import { NextRequest, NextResponse } from 'next/server';
import { logApiResponse, getNextOrderNumber } from '@/lib/blobLogger';
import { upsertWeekendAddOnEntry } from '@/lib/db';
import {
  ADD_ON_PASS_CONFIG,
  AddOnPaymentError,
  type AddOnPassType,
  type AddOnRegistrationType,
  getParticipantsForRegistrationType,
  resolveAddOnPaymentLookup,
  toWeekendAddOnPassType,
} from '@/lib/weekenderAddOnPayments';

function parsePassType(value: unknown): AddOnPassType | null {
  if (value === 'spinning_intensive' || value === 'spotlight_critique') {
    return value;
  }
  return null;
}

function parseRegistrationType(value: unknown): AddOnRegistrationType | null {
  if (value === 'single' || value === 'couple') {
    return value;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const passType = parsePassType(body?.passType);
    const requestedRegistrationType = parseRegistrationType(body?.registrationType) ?? 'single';
    if (!email || !passType) {
      return NextResponse.json(
        { error: 'Email and pass type are required.' },
        { status: 400 }
      );
    }

    if (!process.env.YOCO_CO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: 'Payment system not configured.' },
        { status: 500 }
      );
    }

    const lookup = await resolveAddOnPaymentLookup(email, passType);
    if (!lookup.found || !lookup.primary) {
      return NextResponse.json({ error: lookup.message || 'Member not found.' }, { status: 404 });
    }

    if (lookup.lookupStatus !== 'ready' || !lookup.bookingFound) {
      return NextResponse.json(
        { error: lookup.message || 'No booking found for this add-on.' },
        { status: 404 }
      );
    }

    const registrationType: AddOnRegistrationType =
      passType === 'spinning_intensive' ? 'single' : requestedRegistrationType;

    const participants = getParticipantsForRegistrationType(lookup, registrationType);
    const orderId = await getNextOrderNumber();
    const alreadyPaid =
      registrationType === 'couple'
        ? lookup.existing.coupleAlreadyPaid
        : lookup.existing.singleAlreadyPaid;

    if (alreadyPaid) {
      return NextResponse.json(
        { error: 'Member paid already.' },
        { status: 409 }
      );
    }

    const addOnPassType = toWeekendAddOnPassType(passType);
    const config = ADD_ON_PASS_CONFIG[passType];
    const totalAmountCents = config.pricePerPersonCents * participants.length;
    await Promise.all(
      participants.map((participant) =>
        upsertWeekendAddOnEntry({
          memberId: participant.memberId,
          registrationId: participant.registrationId,
          passType: addOnPassType,
          paymentStatus: 'pending',
        })
      )
    );
    const routePath = config.routePath;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const yocoRequestBody = {
      amount: totalAmountCents,
      currency: 'ZAR',
      successUrl: `${baseUrl}${routePath}?paid=true&ref=${orderId}&mode=${registrationType}`,
      cancelUrl: `${baseUrl}${routePath}?cancelled=true`,
      failureUrl: `${baseUrl}${routePath}?failed=true`,
      metadata: {
        orderId,
        customerId: `MEMBER-${participants[0].memberId}`,
        customerEmail: participants[0].email,
        source: `addon_${passType}`,
        registrationType,
        memberIds: participants.map((participant) => String(participant.memberId)).join(','),
      },
      lineItems: [
        {
          displayName: config.displayName,
          quantity: participants.length,
          pricingDetails: {
            price: config.pricePerPersonCents,
          },
          description:
            registrationType === 'couple'
              ? `${config.displayName} (Couple registration) - WCS Cape Town`
              : `${config.displayName} (Single registration) - WCS Cape Town`,
        },
      ],
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
      registrationType,
      totalAmountCents,
      perPersonAmountCents: config.pricePerPersonCents,
    });
  } catch (error) {
    if (error instanceof AddOnPaymentError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }

    console.error('Add-on payment checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to start payment checkout.' },
      { status: 500 }
    );
  }
}
