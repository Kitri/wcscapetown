import { NextResponse } from 'next/server';
import { getSheetValues } from '@/lib/googleSheets';
import { KRISTEN_INTENSIVE_SHEET_ID, KRISTEN_INTENSIVE_RANGE } from '@/lib/server/kristenIntensiveConfig';

// Sheet columns: A=Timestamp B=Email C=First Name D=Surname E=Role F=Level G=OrderID H=Status I=payment_id

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const data = (payload ?? {}) as Record<string, unknown>;

  const email = isNonEmptyString(data.email) ? data.email.trim().toLowerCase() : null;
  const firstName = isNonEmptyString(data.firstName) ? data.firstName.trim().toLowerCase() : null;
  const surname = isNonEmptyString(data.surname) ? data.surname.trim().toLowerCase() : null;

  if (!email && !(firstName && surname)) {
    return NextResponse.json(
      { error: 'Please provide an email address, or both first name and surname.' },
      { status: 400 }
    );
  }

  try {
    const rows = await getSheetValues(KRISTEN_INTENSIVE_SHEET_ID, KRISTEN_INTENSIVE_RANGE);
    const dataRows = rows.slice(1); // skip header

    const matches = email
      ? dataRows.filter((row) => (row[1] ?? '').trim().toLowerCase() === email)
      : dataRows.filter(
          (row) =>
            (row[2] ?? '').trim().toLowerCase() === firstName &&
            (row[3] ?? '').trim().toLowerCase() === surname
        );

    if (matches.length === 0) {
      return NextResponse.json({ found: false });
    }

    // Someone may have an abandoned 'pending' row and a later 'paid' row — prefer the paid one.
    const paidMatch = matches.find((row) => (row[7] ?? '').toLowerCase() === 'paid');
    const match = paidMatch ?? matches[matches.length - 1];

    return NextResponse.json({
      found: true,
      paid: Boolean(paidMatch),
      firstName: match[2] ?? '',
    });
  } catch (err) {
    console.error('Kristen intensive check registration error:', err);
    return NextResponse.json({ error: 'Failed to check registration. Please try again.' }, { status: 500 });
  }
}
