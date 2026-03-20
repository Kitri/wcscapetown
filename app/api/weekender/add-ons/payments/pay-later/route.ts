import { NextRequest, NextResponse } from 'next/server';
import { getNextOrderNumber } from '@/lib/blobLogger';
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

type PayLaterOption = 'April' | 'May' | '2 installments';

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

function parsePayLaterOption(value: unknown): PayLaterOption | null {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'april') return 'April';
  if (normalized === 'may') return 'May';
  if (normalized === '2 installments' || normalized === '2_installments') {
    return '2 installments';
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const passType = parsePassType(body?.passType);
    const requestedRegistrationType = parseRegistrationType(body?.registrationType) ?? 'single';
    const payLaterOption = parsePayLaterOption(body?.payLaterOption);
    if (!email || !passType || !payLaterOption) {
      return NextResponse.json(
        { error: 'Email, pass type, and pay-later option are required.' },
        { status: 400 }
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
    const config = ADD_ON_PASS_CONFIG[passType];
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

    const orderId = await getNextOrderNumber();

    const addOnPassType = toWeekendAddOnPassType(passType);
    await Promise.all(
      participants.map((participant) =>
        upsertWeekendAddOnEntry({
          memberId: participant.memberId,
          registrationId: participant.registrationId,
          passType: addOnPassType,
          paymentStatus: 'pay_later',
          note: payLaterOption,
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Saved. We noted that you plan to pay in ${payLaterOption}.`,
      reference: orderId,
      registrationType,
      payLaterOption,
      participants: participants.map((participant) => ({
        memberId: participant.memberId,
        name: participant.name,
        surname: participant.surname,
      })),
      totalAmountCents: config.pricePerPersonCents * participants.length,
      perPersonAmountCents: config.pricePerPersonCents,
    });
  } catch (error) {
    if (error instanceof AddOnPaymentError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }

    console.error('Add-on pay later error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to save pay-later registration.' },
      { status: 500 }
    );
  }
}
