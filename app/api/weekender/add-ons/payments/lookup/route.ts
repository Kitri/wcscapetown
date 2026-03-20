import { NextRequest, NextResponse } from 'next/server';
import {
  AddOnPaymentError,
  type AddOnPassType,
  resolveAddOnPaymentLookup,
} from '@/lib/weekenderAddOnPayments';

function parsePassType(value: unknown): AddOnPassType | null {
  if (value === 'spinning_intensive' || value === 'spotlight_critique') {
    return value;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const passType = parsePassType(body?.passType);

    if (!email || !passType) {
      return NextResponse.json(
        { error: 'Email and pass type are required.' },
        { status: 400 }
      );
    }

    const lookup = await resolveAddOnPaymentLookup(email, passType);
    return NextResponse.json(lookup);
  } catch (error) {
    if (error instanceof AddOnPaymentError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    console.error('Add-on payment lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to load registration details.' },
      { status: 500 }
    );
  }
}
