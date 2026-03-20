import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationsByEmailOrOrder } from '@/lib/db';
import { getSheetValues } from '@/lib/googleSheets';

type AddOnBookingType = 'private_lesson' | 'spotlight_critique' | 'advanced_spinning_intensive';

type AddOnRequestSummary = {
  bookingType: AddOnBookingType;
  submittedAt: string;
  privateLesson?: {
    pro: string;
    lessonCount: number;
    preferredSlots: string[];
    unavailablePlan: string;
    bookWithPartner?: boolean;
    partnerName?: string;
    partnerSurname?: string;
    partnerEmail?: string;
  };
  spotlightCritique?: {
    participantName: string;
    participantSurname: string;
    partnerName: string;
    partnerSurname: string;
    earlierAvailability: string[];
  };
  advancedSpinning?: {
    role: string;
    level: string;
  };
};

function isAddOnBookingType(value: string): value is AddOnBookingType {
  return value === 'private_lesson' || value === 'spotlight_critique' || value === 'advanced_spinning_intensive';
}

function splitPipeList(value: string): string[] {
  return value
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseLessonCount(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function normalizePrivateSlot(slot: string): string {
  return slot
    .trim()
    .replace(/_(igor|fernanda|harold|kristen)$/i, '')
    .replace(/_hellenic$/i, '');
}

function parseYesNo(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === 'yes' || normalized === 'true';
}

async function getWeekenderAddOnsByEmail(emails: string[]): Promise<Record<string, AddOnRequestSummary[]>> {
  if (emails.length === 0) return {};

  const sheetId = process.env.SHEET_ID_WEEKEND_ADDON;
  if (!sheetId) return {};

  const emailSet = new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean));
  if (emailSet.size === 0) return {};
  const byEmail: Record<string, AddOnRequestSummary[]> = {};
  const addRequest = (email: string, request: AddOnRequestSummary) => {
    if (!byEmail[email]) byEmail[email] = [];
    byEmail[email].push(request);
  };

  const readRange = async (range: string): Promise<string[][]> => {
    try {
      return await getSheetValues(sheetId, range);
    } catch {
      return [];
    }
  };

  try {
    const privateRows = await readRange('Privates!A:Q');
    for (const row of privateRows) {
      const participantEmail = String(row[3] ?? '').trim().toLowerCase();
      const partnerEmail = String(row[16] ?? '').trim().toLowerCase();
      const participantMatches = emailSet.has(participantEmail);
      const partnerMatches = emailSet.has(partnerEmail);
      if (!participantMatches && !partnerMatches) continue;

      const privateRequest: AddOnRequestSummary = {
        bookingType: 'private_lesson',
        submittedAt: String(row[0] ?? '').trim(),
        privateLesson: {
          pro: String(row[9] ?? '').trim(),
          lessonCount: parseLessonCount(String(row[10] ?? '').trim()),
          preferredSlots: splitPipeList(String(row[11] ?? '')).map(normalizePrivateSlot),
          unavailablePlan: String(row[12] ?? '').trim(),
          bookWithPartner: parseYesNo(String(row[13] ?? '')),
          partnerName: String(row[14] ?? '').trim(),
          partnerSurname: String(row[15] ?? '').trim(),
          partnerEmail,
        },
      };

      if (participantMatches) {
        addRequest(participantEmail, privateRequest);
      }
      if (partnerMatches && partnerEmail !== participantEmail) {
        addRequest(partnerEmail, privateRequest);
      }
    }

    const spotlightRows = await readRange('Spotlight!A:M');
    for (const row of spotlightRows) {
      const participantEmail = String(row[3] ?? '').trim().toLowerCase();
      const partnerEmail = String(row[12] ?? '').trim().toLowerCase();
      const participantMatches = emailSet.has(participantEmail);
      const partnerMatches = emailSet.has(partnerEmail);
      if (!participantMatches && !partnerMatches) continue;

      const spotlightRequest: AddOnRequestSummary = {
        bookingType: 'spotlight_critique',
        submittedAt: String(row[0] ?? '').trim(),
        spotlightCritique: {
          participantName: String(row[1] ?? '').trim(),
          participantSurname: String(row[2] ?? '').trim(),
          partnerName: String(row[9] ?? '').trim(),
          partnerSurname: String(row[10] ?? '').trim(),
          earlierAvailability: splitPipeList(String(row[11] ?? '')),
        },
      };

      if (participantMatches) {
        addRequest(participantEmail, spotlightRequest);
      }
      if (partnerMatches && partnerEmail !== participantEmail) {
        addRequest(partnerEmail, spotlightRequest);
      }
    }

    const spinningRows = await readRange('Spinning!A:K');
    for (const row of spinningRows) {
      const email = String(row[3] ?? '').trim().toLowerCase();
      if (!emailSet.has(email)) continue;

      addRequest(email, {
        bookingType: 'advanced_spinning_intensive',
        submittedAt: String(row[0] ?? '').trim(),
        advancedSpinning: {
          role: String(row[9] ?? '').trim(),
          level: String(row[10] ?? '').trim(),
        },
      });
    }

    const legacyRows = await readRange('Sheet1!A:U');
    for (const row of legacyRows) {
      const bookingTypeRaw = String(row[1] ?? '').trim();
      const email = String(row[4] ?? '').trim().toLowerCase();
      if (!isAddOnBookingType(bookingTypeRaw) || !emailSet.has(email)) continue;

      if (bookingTypeRaw === 'private_lesson') {
        addRequest(email, {
          bookingType: 'private_lesson',
          submittedAt: String(row[0] ?? '').trim(),
          privateLesson: {
            pro: String(row[10] ?? '').trim(),
            lessonCount: parseLessonCount(String(row[11] ?? '').trim()),
            preferredSlots: splitPipeList(String(row[11] ?? '').includes('|') ? String(row[11] ?? '') : String(row[12] ?? '')).map(normalizePrivateSlot),
            unavailablePlan: String(row[13] ?? row[12] ?? '').trim(),
            bookWithPartner: false,
            partnerName: '',
            partnerSurname: '',
            partnerEmail: '',
          },
        });
      } else if (bookingTypeRaw === 'spotlight_critique') {
        addRequest(email, {
          bookingType: 'spotlight_critique',
          submittedAt: String(row[0] ?? '').trim(),
          spotlightCritique: {
            participantName: String(row[13] ?? '').trim(),
            participantSurname: String(row[14] ?? '').trim(),
            partnerName: String(row[15] ?? '').trim(),
            partnerSurname: String(row[16] ?? '').trim(),
            earlierAvailability: splitPipeList(String(row[17] ?? '')),
          },
        });
      } else {
        addRequest(email, {
          bookingType: 'advanced_spinning_intensive',
          submittedAt: String(row[0] ?? '').trim(),
          advancedSpinning: {
            role: String(row[18] ?? '').trim(),
            level: String(row[19] ?? '').trim(),
          },
        });
      }
    }
  } catch (error) {
    console.error('Failed to read weekender add-ons sheets for registration check:', error);
    return {};
  }

  for (const email of Object.keys(byEmail)) {
    byEmail[email].sort((a, b) => {
      const aTime = new Date(a.submittedAt).getTime();
      const bTime = new Date(b.submittedAt).getTime();
      return bTime - aTime;
    });
  }

  return byEmail;
}

function getStatusInfo(paymentStatus: string, registrationStatus: string, role: string) {
  const normalizedRole = String(role || '').trim().toUpperCase();
  const needsRoleText =
    normalizedRole === 'F' || normalizedRole === 'FOLLOW'
      ? 'We are still waiting for more leads to sign up.'
      : normalizedRole === 'L' || normalizedRole === 'LEAD'
        ? 'We are still waiting for more followers to sign up.'
        : 'We are still waiting for more opposite-role dancers to sign up.';

  if (registrationStatus === 'waitlist') {
    return {
      label: 'On waitlist',
      message: `You are currently on the waitlist. ${needsRoleText}`,
    };
  }

  if (paymentStatus === 'complete' && registrationStatus === 'complete') {
    return {
      label: 'Confirmed',
      message: 'Booking confirmed.',
    };
  }

  if (paymentStatus === 'pending' || registrationStatus === 'pending') {
    return {
      label: 'Payment pending',
      message:
        'Payment is still pending. Your booking is only fully confirmed once payment is completed. If you paid recently, it may take a few minutes for your status to reflect.',
    };
  }

  if (paymentStatus === 'failed') {
    return {
      label: 'Payment failed',
      message:
        'Your last payment attempt appears to have failed. Please try again or contact us if you need help.',
    };
  }

  if (paymentStatus === 'expired' || registrationStatus === 'expired') {
    return {
      label: 'Expired',
      message:
        'This registration expired before payment completed. Please start a new booking if you still want to attend.',
    };
  }

  return {
    label: 'In progress',
    message: 'Your registration is still being processed.',
  };
}


function getWeekenderInfo(passType: string, workshopDay: string | null, partyAddOn: boolean | null) {
  if (passType === 'spinning_intensive') {
    return {
      registrationLabel: 'Spinning Intensive Add-on',
      eventDate: 'Weekender add-on session',
      venueName: 'Hellenic Community Centre, Greenpoint',
      venueAddress: 'Hellenic Community Centre, Greenpoint',
      venueMapUrl: 'https://maps.app.goo.gl/rhtWRj4fmg1Pw8fw8',
      details: [
        'This is an add-on registration linked to your weekender booking.',
        'Please keep your payment reference in case we need to verify details.',
      ],
      shoeTips: [],
      shoeOptions: [],
    };
  }

  if (passType === 'spotlight_critique') {
    return {
      registrationLabel: 'Spotlight Critique Add-on',
      eventDate: 'Weekender add-on session',
      venueName: 'Hellenic Community Centre, Greenpoint',
      venueAddress: 'Hellenic Community Centre, Greenpoint',
      venueMapUrl: 'https://maps.app.goo.gl/rhtWRj4fmg1Pw8fw8',
      details: [
        'This is an add-on registration linked to your weekender booking.',
        'If this was a couple registration, both dancers should appear as paid once processing completes.',
      ],
      shoeTips: [],
      shoeOptions: [],
    };
  }
  const passLabel =
    passType === 'weekend'
      ? 'Weekender Weekend Pass'
      : passType === 'day'
        ? `Weekender Day Pass${workshopDay ? ` (${workshopDay})` : ''}${partyAddOn ? ' + Friday Pre-Party' : ''}`
        : passType === 'party'
          ? 'Weekender Party Pass'
          : 'Weekender Registration';

  const eventDate =
    passType === 'day'
      ? workshopDay === 'Saturday'
        ? '21 March 2026'
        : workshopDay === 'Sunday'
          ? '22 March 2026'
          : 'Weekender day pass (date to confirm)'
      : '20–22 March 2026';

  return {
    registrationLabel: passLabel,
    eventDate,
    venueName: 'Hellenic Community Centre, Greenpoint',
    venueAddress: 'Hellenic Community Centre, Greenpoint',
    venueMapUrl: 'https://maps.app.goo.gl/rhtWRj4fmg1Pw8fw8',
    details: [
      'Plenty of secure parking on site.',
      'There is a restaurant onsite with drinks, coffee, and food, open until 4pm.',
      'You can bring your own water bottle, but no other drinks before 4pm.',
      'The schedule is being finalised and will be shared via email on Monday 9 March 2026.',
      'The venue is close to the promenade and several restaurants/coffee shops, which makes for a great day out.',
      'Friday pre-party is at Scout Hall, Claremont (our usual monthly social venue).',
    ],
    shoeTips: [
      'Bring comfortable, flat, or low-heeled shoes with smooth, non-stick soles that allow for easy spinning (particularly the patch around the ball of the foot).',
      'The venue has a tile floor, and some rubber-sole shoes may feel sticky.',
      "If you don't have proper dance shoes (suede-soled flats or low, wide heels are ideal), these are good options:",
    ],
    shoeOptions: [
      'Smooth-soled sneakers or trainers',
      'Canvas shoes (e.g., Keds-style)',
      'Casual flats or flexible shoes',
      'You can also dance in socks if you prefer',
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = String(body?.query ?? '').trim();
    const sourceRaw = String(body?.source ?? '').trim().toLowerCase();
    const source: 'weekender' | 'all' =
      sourceRaw === 'weekender' ? sourceRaw : 'all';

    if (!query) {
      return NextResponse.json({ error: 'Please enter an email address or order number.' }, { status: 400 });
    }

    const rows = await getRegistrationsByEmailOrOrder(query, source);
    const addOnsByEmail = await getWeekenderAddOnsByEmail(rows.map((row) => row.email));

    const registrations = rows.map((row) => {
      const status = getStatusInfo(row.paymentStatus, row.registrationStatus, row.role);
      const eventInfo = getWeekenderInfo(row.passType, row.workshopDay, row.partyAddOn);
      const rowEmail = String(row.email ?? '').trim().toLowerCase();

      return {
        orderId: row.orderId,
        name: row.name,
        surname: row.surname,
        email: row.email,
        role: row.role,
        level: row.level,
        passType: row.passType,
        registrationType: row.registrationType,
        createdAt: row.createdAt,
        statusLabel: status.label,
        statusMessage: status.message,
        registrationLabel: eventInfo.registrationLabel,
        eventDate: eventInfo.eventDate,
        venueName: eventInfo.venueName,
        venueAddress: eventInfo.venueAddress,
        venueMapUrl: eventInfo.venueMapUrl,
        details: eventInfo.details,
        shoeTips: eventInfo.shoeTips,
        shoeOptions: eventInfo.shoeOptions,
        addOnRequests: addOnsByEmail[rowEmail] ?? [],
      };
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json({ error: 'Failed to check registration details.' }, { status: 500 });
  }
}
