import { NextRequest, NextResponse } from 'next/server';
import { getSheetValues, updateSheetValues } from '@/lib/googleSheets';
import { getDb } from '@/lib/db';

type BookingType = 'private_lesson' | 'spotlight_critique' | 'advanced_spinning_intensive';
type PrivatePro = 'igor' | 'fernanda' | 'harold' | 'kristen';
type Role = 'L' | 'F';
const ANY_TIME_PRIVATE_SLOT = 'any_time';

type LookupResult = {
  email: string;
  role: Role;
  level: number;
  pass_type: 'weekend' | 'day';
  registration_status: string;
};

type SubmitPayload = {
  bookingType: BookingType;
  contact: {
    name: string;
    surname: string;
    email?: string;
  };
  privateLesson?: {
    requests: Array<{
      pro: PrivatePro;
      preferredSlots: string[];
      lessonCount: number;
    }>;
    unavailablePlan: string;
    bookWithPartner?: boolean;
    partnerName?: string;
    partnerSurname?: string;
  };
  spotlightCritique?: {
    partnerName: string;
    partnerSurname: string;
    earlierAvailability: string[];
  };
  advancedSpinning?: {
    role?: Role;
    level?: number;
  };
};

async function findWeekenderRegistrant(name: string, surname: string): Promise<LookupResult | null> {
  const sql = getDb();

  const result = await sql`
    SELECT
      r.email,
      r.role,
      r.level,
      r.pass_type,
      r.registration_status
    FROM members m
    INNER JOIN registrations r ON r.member_id = m.member_id
    WHERE LOWER(m.name) = LOWER(${name})
      AND LOWER(m.surname) = LOWER(${surname})
      AND r.pass_type IN ('weekend', 'day')
      AND r.registration_status != 'expired'
    ORDER BY
      CASE r.registration_status
        WHEN 'complete' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'waitlist' THEN 3
        ELSE 4
      END,
      CASE r.pass_type
        WHEN 'weekend' THEN 1
        WHEN 'day' THEN 2
        ELSE 3
      END,
      r.created_at DESC
    LIMIT 1
  `;

  if (result.length === 0) return null;
  return result[0] as LookupResult;
}

function isRole(value: unknown): value is Role {
  return value === 'L' || value === 'F';
}

function isPrivatePro(value: unknown): value is PrivatePro {
  return value === 'igor' || value === 'fernanda' || value === 'harold' || value === 'kristen';
}

function normalizePrivateSlot(slot: string): string {
  return slot
    .trim()
    .replace(/_(igor|fernanda|harold|kristen)$/i, '')
    .replace(/_hellenic$/i, '');
}

function normalizePrivateSlots(slots: string[]): string[] {
  const normalized = slots
    .map((slot) => normalizePrivateSlot(slot).toLowerCase())
    .filter((slot) => slot.length > 0);

  if (normalized.includes(ANY_TIME_PRIVATE_SLOT)) {
    return [ANY_TIME_PRIVATE_SLOT];
  }

  return Array.from(new Set(normalized));
}

async function writeRowsToSheet(
  spreadsheetId: string,
  sheetName: string,
  endColumn: string,
  rows: string[][]
) {
  if (rows.length === 0) return;

  const existingRows = await getSheetValues(spreadsheetId, `${sheetName}!A:${endColumn}`);
  const nextRow = existingRows.length + 1;
  const endRow = nextRow + rows.length - 1;
  await updateSheetValues(spreadsheetId, `${sheetName}!A${nextRow}:${endColumn}${endRow}`, rows);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitPayload;
    const bookingType = body.bookingType;
    const name = String(body?.contact?.name ?? '').trim();
    const surname = String(body?.contact?.surname ?? '').trim();

    if (!bookingType || !name || !surname) {
      return NextResponse.json(
        { error: 'Booking type, name and surname are required.' },
        { status: 400 }
      );
    }

    if (!['private_lesson', 'spotlight_critique', 'advanced_spinning_intensive'].includes(bookingType)) {
      return NextResponse.json(
        { error: 'Invalid booking type.' },
        { status: 400 }
      );
    }

    const lookup = await findWeekenderRegistrant(name, surname);
    const manualEmail = String(body?.contact?.email ?? '').trim();
    const resolvedEmail = lookup?.email ?? manualEmail;

    if (!resolvedEmail) {
      return NextResponse.json(
        { error: 'Email is required if no weekender registration is found.' },
        { status: 400 }
      );
    }

    const sheetId = process.env.SHEET_ID_WEEKEND_ADDON;
    if (!sheetId) {
      throw new Error('SHEET_ID_WEEKEND_ADDON is not configured');
    }

    const timestamp = new Date().toISOString();
    const baseColumns = [
      timestamp, // A
      name, // B
      surname, // C
      resolvedEmail, // D
      lookup ? 'yes' : 'no', // E
      lookup?.pass_type ?? '', // F
      lookup?.registration_status ?? '', // G
      lookup?.role ?? '', // H
      lookup?.level ? String(lookup.level) : '', // I
    ];

    if (bookingType === 'private_lesson') {
      const privateLesson = body.privateLesson;
      const requests = Array.isArray(privateLesson?.requests) ? privateLesson.requests : [];
      const unavailablePlan = String(privateLesson?.unavailablePlan ?? '').trim();
      const bookWithPartner = Boolean(privateLesson?.bookWithPartner);
      const partnerName = String(privateLesson?.partnerName ?? '').trim();
      const partnerSurname = String(privateLesson?.partnerSurname ?? '').trim();

      if (requests.length === 0 || !unavailablePlan) {
        return NextResponse.json(
          { error: 'Private lesson bookings require at least one pro request and your fallback plan.' },
          { status: 400 }
        );
      }

      if (bookWithPartner && (!partnerName || !partnerSurname)) {
        return NextResponse.json(
          { error: 'Please provide partner name and surname when booking private lessons with a partner.' },
          { status: 400 }
        );
      }
      const partnerLookup = bookWithPartner
        ? await findWeekenderRegistrant(partnerName, partnerSurname)
        : null;
      const partnerEmail = partnerLookup?.email ?? '';

      const seenPros = new Set<PrivatePro>();
      const privateRows: string[][] = [];

      for (const request of requests) {
        const pro = String(request?.pro ?? '').trim().toLowerCase();
        const preferredSlots = Array.isArray(request?.preferredSlots)
          ? normalizePrivateSlots(
            request.preferredSlots.filter((slot) => typeof slot === 'string')
          )
          : [];
        const lessonCount = Number(request?.lessonCount ?? NaN);

        if (!isPrivatePro(pro) || seenPros.has(pro)) {
          return NextResponse.json(
            { error: 'Each private lesson request must include a unique valid pro.' },
            { status: 400 }
          );
        }

        if (preferredSlots.length === 0) {
          return NextResponse.json(
            { error: `Please provide preferred slots for ${pro}.` },
            { status: 400 }
          );
        }

        if (!Number.isInteger(lessonCount) || lessonCount < 1 || lessonCount > 4) {
          return NextResponse.json(
            { error: `Please provide a valid lesson count for ${pro}.` },
            { status: 400 }
          );
        }

        seenPros.add(pro);
        privateRows.push([
          ...baseColumns,
          pro, // J
          String(lessonCount), // K
          preferredSlots.join(' | '), // L
          unavailablePlan, // M
          bookWithPartner ? 'yes' : 'no', // N
          bookWithPartner ? partnerName : '', // O
          bookWithPartner ? partnerSurname : '', // P
          partnerEmail, // Q
        ]);
      }
      await writeRowsToSheet(sheetId, 'Privates', 'Q', privateRows);
      return NextResponse.json({ success: true });
    }

    if (bookingType === 'spotlight_critique') {
      const spotlight = body.spotlightCritique;
      const partnerName = String(spotlight?.partnerName ?? '').trim();
      const partnerSurname = String(spotlight?.partnerSurname ?? '').trim();
      const earlierAvailability = Array.isArray(spotlight?.earlierAvailability)
        ? spotlight.earlierAvailability.filter((slot) => typeof slot === 'string' && slot.trim().length > 0)
        : [];

      if (!partnerName || !partnerSurname) {
        return NextResponse.json(
          { error: 'Spotlight critique bookings require your partner name and surname.' },
          { status: 400 }
        );
      }
      const partnerLookup = await findWeekenderRegistrant(partnerName, partnerSurname);
      const partnerEmail = partnerLookup?.email ?? '';

      await writeRowsToSheet(sheetId, 'Spotlight', 'M', [[
        ...baseColumns,
        partnerName, // J
        partnerSurname, // K
        earlierAvailability.join(' | '), // L
        partnerEmail, // M
      ]]);

      return NextResponse.json({ success: true });
    }

    const manualRole = body?.advancedSpinning?.role;
    const manualLevel = Number(body?.advancedSpinning?.level ?? NaN);
    const resolvedRole = isRole(manualRole) ? manualRole : null;
    const resolvedLevel = Number(lookup?.level ?? manualLevel);

    if (!resolvedRole || !Number.isFinite(resolvedLevel) || ![1, 2].includes(resolvedLevel)) {
      return NextResponse.json(
        { error: 'Advanced spinning intensive requires role and level.' },
        { status: 400 }
      );
    }

    await writeRowsToSheet(sheetId, 'Spinning', 'K', [[
      ...baseColumns,
      resolvedRole, // J
      String(resolvedLevel), // K
    ]]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Weekender add-ons submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit add-on booking.' },
      { status: 500 }
    );
  }
}
