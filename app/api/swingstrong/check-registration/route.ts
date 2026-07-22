import { NextResponse } from 'next/server';
import { getSheetValues } from '@/lib/googleSheets';

// Sheet columns: A=Timestamp B=Email C=First Name D=Surname E=Role F=Level G=OrderRef H=Paid I=PaymentId

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

  const data = payload as Record<string, unknown>;

  const email = isNonEmptyString(data.email) ? data.email.trim().toLowerCase() : null;
  const firstName = isNonEmptyString(data.firstName) ? data.firstName.trim().toLowerCase() : null;
  const surname = isNonEmptyString(data.surname) ? data.surname.trim().toLowerCase() : null;

  // Need either email or both name fields
  if (!email && !(firstName && surname)) {
    return NextResponse.json(
      { error: 'Please provide an email address, or both first name and surname.' },
      { status: 400 }
    );
  }

  const sheetId = process.env.SHEET_ID_SWINGSTRONG;
  if (!sheetId) {
    return NextResponse.json({ error: 'Registration system not configured.' }, { status: 500 });
  }

  try {
    // Read all rows (skip header row 1)
    const rows = await getSheetValues(sheetId, "'jeff workshop'!A:I");
    const dataRows = rows.slice(1); // skip header

    let match: string[] | undefined;

    if (email) {
      match = dataRows.find((row) => (row[1] ?? '').trim().toLowerCase() === email);
    } else if (firstName && surname) {
      match = dataRows.find(
        (row) =>
          (row[2] ?? '').trim().toLowerCase() === firstName &&
          (row[3] ?? '').trim().toLowerCase() === surname
      );
    }

    if (!match) {
      return NextResponse.json({ found: false });
    }

    const paid = (match[7] ?? '').toLowerCase() === 'paid';

    return NextResponse.json({
      found: true,
      paid,
      firstName: match[2] ?? '',
    });
  } catch (err) {
    console.error('Check registration error:', err);
    return NextResponse.json({ error: 'Failed to check registration. Please try again.' }, { status: 500 });
  }
}
