import { getDb } from '@/lib/db';
import { getSheetValues } from '@/lib/googleSheets';

export type AddOnPassType = 'spinning_intensive' | 'spotlight_critique';
export type AddOnRegistrationType = 'single' | 'couple';
export type AddOnLookupStatus =
  | 'ready'
  | 'member_not_found'
  | 'not_on_list_spinning'
  | 'not_on_list_spotlight_closed';

type Role = 'L' | 'F';

export type AddOnResolvedMember = {
  memberId: number;
  registrationId: number;
  name: string;
  surname: string;
  role: Role;
  level: 1 | 2;
  email: string;
};

type ExistingAddOnRegistration = {
  paymentStatus: string;
  registrationStatus: string;
  registrationType: string;
  orderId: string;
};

type ExistingWeekendAddOnState = {
  paymentStatus: string;
  note: string;
};

export type AddOnLookupResult = {
  found: boolean;
  message: string;
  lookupStatus: AddOnLookupStatus;
  helpHref: string | null;
  inputEmail: string;
  passType: AddOnPassType;
  bookingFound: boolean;
  pricePerPersonCents: number;
  primary: AddOnResolvedMember | null;
  partner: AddOnResolvedMember | null;
  partnerEmail: string;
  canPayCouple: boolean;
  allowedRegistrationTypes: AddOnRegistrationType[];
  existing: {
    primary: ExistingAddOnRegistration | null;
    partner: ExistingAddOnRegistration | null;
    primaryAddOn: ExistingWeekendAddOnState | null;
    partnerAddOn: ExistingWeekendAddOnState | null;
    singleAlreadyPaid: boolean;
    coupleAlreadyPaid: boolean;
    singlePayLaterSelected: boolean;
    couplePayLaterSelected: boolean;
    singlePayLaterNote: string | null;
    couplePayLaterNote: string | null;
  };
};

export type UpsertPendingRegistrationsResult = {
  passType: AddOnPassType;
  registrationType: AddOnRegistrationType;
  participants: AddOnResolvedMember[];
  registrationIds: number[];
  perPersonAmountCents: number;
  totalAmountCents: number;
};

export class AddOnPaymentError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const DEFAULT_PRICE_TIER = 'just-now';
const SHEET_VALUES_CACHE_TTL_MS = Number(
  process.env.WEEKENDER_ADDON_SHEET_CACHE_TTL_MS ?? 45_000
);
const sheetValuesCache = new Map<string, { expiresAt: number; rows: string[][] }>();

export const ADD_ON_PASS_CONFIG: Record<
  AddOnPassType,
  {
    displayName: string;
    pricePerPersonCents: number;
    routePath: string;
  }
> = {
  spinning_intensive: {
    displayName: 'Spinning Intensive',
    pricePerPersonCents: 20_000,
    routePath: '/weekender/private-pay/spinning-intensive',
  },
  spotlight_critique: {
    displayName: 'Spotlight Critique',
    pricePerPersonCents: 12_500,
    routePath: '/weekender/private-pay/spotlight-critique',
  },
};

export function toWeekendAddOnPassType(passType: AddOnPassType): 'spin' | 'spot' {
  return passType === 'spinning_intensive' ? 'spin' : 'spot';
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeRole(role: unknown): Role {
  const raw = String(role ?? '').trim().toUpperCase();
  if (raw === 'L' || raw === 'LEAD') return 'L';
  if (raw === 'F' || raw === 'FOLLOW') return 'F';
  return 'F';
}

function normalizeLevel(level: unknown): 1 | 2 {
  const parsed = Number(level);
  if (parsed === 2) return 2;
  return 1;
}

function isHeaderRow(row: string[]): boolean {
  const first = normalize(row[0] ?? '');
  const second = normalize(row[1] ?? '');
  return first === 'timestamp' || second === 'name';
}

function isComplete(existing: ExistingAddOnRegistration | null): boolean {
  if (!existing) return false;
  return existing.paymentStatus === 'complete' && existing.registrationStatus === 'complete';
}

function isWeekendAddOnComplete(existing: ExistingWeekendAddOnState | null): boolean {
  if (!existing) return false;
  return existing.paymentStatus === 'complete';
}

function isWeekendAddOnPayLater(existing: ExistingWeekendAddOnState | null): boolean {
  if (!existing) return false;
  return existing.paymentStatus === 'pay_later';
}

function getWeekendAddOnNote(existing: ExistingWeekendAddOnState | null): string | null {
  const note = String(existing?.note ?? '').trim();
  return note || null;
}

function getCachedSheetCacheKey(spreadsheetId: string, range: string): string {
  return `${spreadsheetId}::${range}`;
}

async function getCachedSheetValues(
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const key = getCachedSheetCacheKey(spreadsheetId, range);
  const cached = sheetValuesCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.rows;
  }

  const rows = await getSheetValues(spreadsheetId, range);
  sheetValuesCache.set(key, {
    rows,
    expiresAt: now + SHEET_VALUES_CACHE_TTL_MS,
  });
  return rows;
}

function emptyExistingInfo() {
  return {
    primary: null as ExistingAddOnRegistration | null,
    partner: null as ExistingAddOnRegistration | null,
    primaryAddOn: null as ExistingWeekendAddOnState | null,
    partnerAddOn: null as ExistingWeekendAddOnState | null,
    singleAlreadyPaid: false,
    coupleAlreadyPaid: false,
    singlePayLaterSelected: false,
    couplePayLaterSelected: false,
    singlePayLaterNote: null as string | null,
    couplePayLaterNote: null as string | null,
  };
}

function buildNotReadyResult(params: {
  status: AddOnLookupStatus;
  message: string;
  inputEmail: string;
  passType: AddOnPassType;
  helpHref?: string | null;
  primary?: AddOnResolvedMember | null;
}): AddOnLookupResult {
  const config = ADD_ON_PASS_CONFIG[params.passType];
  const primary = params.primary ?? null;
  return {
    found: Boolean(primary),
    message: params.message,
    lookupStatus: params.status,
    helpHref: params.helpHref ?? null,
    inputEmail: params.inputEmail,
    passType: params.passType,
    bookingFound: false,
    pricePerPersonCents: config.pricePerPersonCents,
    primary,
    partner: null,
    partnerEmail: '',
    canPayCouple: false,
    allowedRegistrationTypes: ['single'],
    existing: emptyExistingInfo(),
  };
}

function toResolvedMember(row: {
  member_id: number;
  registration_id: number;
  name: string;
  surname: string;
  member_role: string | null;
  member_level: number | null;
  registration_role: string | null;
  registration_level: number | null;
  email: string | null;
}): AddOnResolvedMember {
  return {
    memberId: Number(row.member_id),
    registrationId: Number(row.registration_id),
    name: String(row.name ?? '').trim(),
    surname: String(row.surname ?? '').trim(),
    role: normalizeRole(row.registration_role ?? row.member_role),
    level: normalizeLevel(row.registration_level ?? row.member_level),
    email: String(row.email ?? '').trim(),
  };
}

function getSheetIdOrThrow(): string {
  const sheetId = process.env.SHEET_ID_WEEKEND_ADDON;
  if (!sheetId) {
    throw new AddOnPaymentError(
      'sheet_not_configured',
      'Weekender add-on spreadsheet is not configured.',
      500
    );
  }
  return sheetId;
}

async function findMemberByEmail(email: string): Promise<AddOnResolvedMember | null> {
  const normalizedEmail = String(email ?? '').trim();
  if (!normalizedEmail) return null;

  const sql = getDb();
  const result = await sql`
    SELECT
      m.member_id,
      r.id AS registration_id,
      m.name,
      m.surname,
      m.role AS member_role,
      m.level AS member_level,
      r.role AS registration_role,
      r.level AS registration_level,
      r.email
    FROM registrations r
    INNER JOIN members m ON m.member_id = r.member_id
    WHERE LOWER(r.email) = LOWER(${normalizedEmail})
    ORDER BY
      CASE r.registration_status
        WHEN 'complete' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'waitlist' THEN 3
        ELSE 4
      END,
      r.created_at DESC
    LIMIT 1
  `;

  if (result.length === 0) return null;
  return toResolvedMember(result[0] as {
    member_id: number;
    registration_id: number;
    name: string;
    surname: string;
    member_role: string | null;
    member_level: number | null;
    registration_role: string | null;
    registration_level: number | null;
    email: string | null;
  });
}

async function getLatestAddOnRegistration(
  memberId: number,
  passType: AddOnPassType
): Promise<ExistingAddOnRegistration | null> {
  const sql = getDb();
  const result = await sql`
    SELECT
      payment_status,
      registration_status,
      registration_type,
      order_id
    FROM registrations
    WHERE member_id = ${memberId}
      AND pass_type = ${passType}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (result.length === 0) return null;

  return {
    paymentStatus: String(result[0].payment_status ?? '').trim(),
    registrationStatus: String(result[0].registration_status ?? '').trim(),
    registrationType: String(result[0].registration_type ?? '').trim(),
    orderId: String(result[0].order_id ?? '').trim(),
  };
}

async function getLatestWeekendAddOnState(
  memberId: number,
  passType: AddOnPassType
): Promise<ExistingWeekendAddOnState | null> {
  const sql = getDb();
  const mappedPassType = toWeekendAddOnPassType(passType);
  const result = await sql`
    SELECT
      payment_status,
      note
    FROM weekend_add_ons
    WHERE member_id = ${memberId}
      AND pass_type = ${mappedPassType}
    ORDER BY updated_at DESC, id DESC
    LIMIT 1
  `;

  if (result.length === 0) return null;

  return {
    paymentStatus: String(result[0].payment_status ?? '').trim(),
    note: String(result[0].note ?? '').trim(),
  };
}

async function findSpinningBookingByEmail(email: string): Promise<{ found: boolean }> {
  const sheetId = getSheetIdOrThrow();
  const rows = await getCachedSheetValues(sheetId, 'Spinning!A:K');
  const target = normalize(email);

  for (const row of rows) {
    if (isHeaderRow(row)) continue;
    const participantEmail = normalize(String(row[3] ?? '').trim());
    if (participantEmail && participantEmail === target) {
      return { found: true };
    }
  }

  return { found: false };
}

async function findSpotlightBookingByEmail(email: string): Promise<{
  found: boolean;
  partnerEmail: string;
}> {
  const sheetId = getSheetIdOrThrow();
  const rows = await getCachedSheetValues(sheetId, 'Spotlight!A:M');
  const target = normalize(email);

  for (const row of rows) {
    if (isHeaderRow(row)) continue;

    const participantEmail = String(row[3] ?? '').trim();
    const partnerEmail = String(row[12] ?? '').trim();

    if (normalize(participantEmail) === target) {
      return {
        found: true,
        partnerEmail,
      };
    }

    if (normalize(partnerEmail) === target) {
      return {
        found: true,
        partnerEmail: participantEmail,
      };
    }
  }

  return {
    found: false,
    partnerEmail: '',
  };
}

export async function resolveAddOnPaymentLookup(
  email: string,
  passType: AddOnPassType
): Promise<AddOnLookupResult> {
  const trimmedEmail = String(email ?? '').trim();
  const normalizedEmail = normalize(trimmedEmail);
  const config = ADD_ON_PASS_CONFIG[passType];

  if (!trimmedEmail || !normalizedEmail.includes('@')) {
    throw new AddOnPaymentError(
      'email_required',
      'Please provide a valid email address.',
      400
    );
  }


  if (passType === 'spinning_intensive') {
    const [primary, booking] = await Promise.all([
      findMemberByEmail(trimmedEmail),
      findSpinningBookingByEmail(trimmedEmail),
    ]);
    if (!booking.found) {
      return buildNotReadyResult({
        status: 'not_on_list_spinning',
        message:
          'You are not on the spinning intensive sign-up list. Please sign up first.',
        helpHref: '/weekender/add-ons?tab=advanced_spinning_intensive',
        inputEmail: trimmedEmail,
        passType,
        primary,
      });
    }

    if (!primary) {
      return buildNotReadyResult({
        status: 'member_not_found',
        message:
          'We found your add-on sign-up, but could not match this email to a weekender member profile.',
        inputEmail: trimmedEmail,
        passType,
      });
    }

    if (!primary.email) {
      primary.email = trimmedEmail;
    }
    const [existingPrimary, primaryAddOn] = await Promise.all([
      getLatestAddOnRegistration(primary.memberId, passType),
      getLatestWeekendAddOnState(primary.memberId, passType),
    ]);
    const singleAlreadyPaid =
      isComplete(existingPrimary) || isWeekendAddOnComplete(primaryAddOn);
    const singlePayLaterSelected =
      !singleAlreadyPaid && isWeekendAddOnPayLater(primaryAddOn);
    const singlePayLaterNote = singlePayLaterSelected
      ? getWeekendAddOnNote(primaryAddOn)
      : null;

    return {
      found: true,
      message: 'Registration loaded. You can pay now or pay later.',
      lookupStatus: 'ready',
      helpHref: null,
      inputEmail: trimmedEmail,
      passType,
      bookingFound: true,
      pricePerPersonCents: config.pricePerPersonCents,
      primary,
      partner: null,
      partnerEmail: '',
      canPayCouple: false,
      allowedRegistrationTypes: ['single'],
      existing: {
        primary: existingPrimary,
        partner: null,
        primaryAddOn,
        partnerAddOn: null,
        singleAlreadyPaid,
        coupleAlreadyPaid: false,
        singlePayLaterSelected,
        couplePayLaterSelected: false,
        singlePayLaterNote,
        couplePayLaterNote: null,
      },
    };
  }

  const [primary, booking] = await Promise.all([
    findMemberByEmail(trimmedEmail),
    findSpotlightBookingByEmail(trimmedEmail),
  ]);
  if (!booking.found) {
    return buildNotReadyResult({
      status: 'not_on_list_spotlight_closed',
      message:
        'You are not on the spotlight critique sign-up list. Registrations are closed.',
      inputEmail: trimmedEmail,
      passType,
      primary,
    });
  }

  if (!primary) {
    return buildNotReadyResult({
      status: 'member_not_found',
      message:
        'We found your add-on sign-up, but could not match this email to a weekender member profile.',
      inputEmail: trimmedEmail,
      passType,
    });
  }

  if (!primary.email) {
    primary.email = trimmedEmail;
  }
  const [partner, existingPrimary, primaryAddOn] = await Promise.all([
    booking.partnerEmail
      ? findMemberByEmail(booking.partnerEmail)
      : Promise.resolve(null),
    getLatestAddOnRegistration(primary.memberId, passType),
    getLatestWeekendAddOnState(primary.memberId, passType),
  ]);

  if (partner && !partner.email) {
    partner.email = booking.partnerEmail;
  }

  const validPartner =
    partner && partner.email && partner.memberId !== primary.memberId ? partner : null;
  const [existingPartner, partnerAddOn] = validPartner
    ? await Promise.all([
      getLatestAddOnRegistration(validPartner.memberId, passType),
      getLatestWeekendAddOnState(validPartner.memberId, passType),
    ])
    : [null, null];
  const singleAlreadyPaid =
    isComplete(existingPrimary) || isWeekendAddOnComplete(primaryAddOn);
  const partnerAlreadyPaid =
    isComplete(existingPartner) || isWeekendAddOnComplete(partnerAddOn);
  const coupleAlreadyPaid = Boolean(validPartner && (singleAlreadyPaid || partnerAlreadyPaid));
  const singlePayLaterSelected =
    !singleAlreadyPaid && isWeekendAddOnPayLater(primaryAddOn);
  const couplePayLaterSelected = Boolean(validPartner) &&
    !coupleAlreadyPaid &&
    isWeekendAddOnPayLater(primaryAddOn) &&
    isWeekendAddOnPayLater(partnerAddOn);
  const singlePayLaterNote = singlePayLaterSelected
    ? getWeekendAddOnNote(primaryAddOn)
    : null;
  const couplePayLaterNote = couplePayLaterSelected
    ? getWeekendAddOnNote(primaryAddOn) ?? getWeekendAddOnNote(partnerAddOn)
    : null;

  return {
    found: true,
    message: 'Registration loaded. You can pay for yourself or for both dancers.',
    lookupStatus: 'ready',
    helpHref: null,
    inputEmail: trimmedEmail,
    passType,
    bookingFound: true,
    pricePerPersonCents: config.pricePerPersonCents,
    primary,
    partner: validPartner,
    partnerEmail: booking.partnerEmail,
    canPayCouple: Boolean(validPartner),
    allowedRegistrationTypes: validPartner ? ['single', 'couple'] : ['single'],
    existing: {
      primary: existingPrimary,
      partner: existingPartner,
      primaryAddOn,
      partnerAddOn,
      singleAlreadyPaid,
      coupleAlreadyPaid,
      singlePayLaterSelected,
      couplePayLaterSelected,
      singlePayLaterNote,
      couplePayLaterNote,
    },
  };
}

export function getParticipantsForRegistrationType(
  lookup: AddOnLookupResult,
  registrationType: AddOnRegistrationType
): AddOnResolvedMember[] {
  if (lookup.lookupStatus !== 'ready' || !lookup.primary) {
    throw new AddOnPaymentError(
      'lookup_not_ready',
      'Please load a valid registration first.',
      400
    );
  }

  if (lookup.passType === 'spinning_intensive') {
    if (registrationType !== 'single') {
      throw new AddOnPaymentError(
        'invalid_registration_type',
        'Spinning intensive is paid per person.',
        400
      );
    }
    return [lookup.primary];
  }

  if (registrationType === 'single') {
    return [lookup.primary];
  }

  if (!lookup.partner) {
    throw new AddOnPaymentError(
      'partner_not_found',
      'Could not load partner details for couple payment.',
      400
    );
  }

  if (lookup.partner.memberId === lookup.primary.memberId) {
    throw new AddOnPaymentError(
      'partner_invalid',
      'Partner details could not be validated as a different member.',
      400
    );
  }

  return [lookup.primary, lookup.partner];
}

export async function upsertPendingAddOnRegistrations(params: {
  passType: AddOnPassType;
  registrationType: AddOnRegistrationType;
  sessionId: string;
  orderId: string;
  participants: AddOnResolvedMember[];
}): Promise<UpsertPendingRegistrationsResult> {
  const { passType, registrationType, sessionId, orderId, participants } = params;
  const config = ADD_ON_PASS_CONFIG[passType];
  const sql = getDb();

  const registrationIds: number[] = [];
  const existingByMember = new Map<
    number,
    { id: number; payment_status: string; registration_status: string } | null
  >();

  for (const participant of participants) {
    const email = String(participant.email ?? '').trim();
    if (!email) {
      throw new AddOnPaymentError(
        'email_not_found',
        `${participant.name} ${participant.surname} does not have a usable email on record.`,
        400
      );
    }

    const existing = await sql`
      SELECT
        id,
        payment_status,
        registration_status
      FROM registrations
      WHERE member_id = ${participant.memberId}
        AND pass_type = ${passType}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (
      existing.length > 0 &&
      existing[0].payment_status === 'complete' &&
      existing[0].registration_status === 'complete'
    ) {
      throw new AddOnPaymentError(
        'already_paid',
        `${participant.name} ${participant.surname} has already paid for this add-on.`,
        409
      );
    }

    existingByMember.set(
      participant.memberId,
      existing.length > 0
        ? {
          id: Number(existing[0].id),
          payment_status: String(existing[0].payment_status ?? ''),
          registration_status: String(existing[0].registration_status ?? ''),
        }
        : null
    );
  }

  for (const participant of participants) {
    const email = String(participant.email ?? '').trim();
    const existing = existingByMember.get(participant.memberId) ?? null;

    if (existing) {
      await sql`
        UPDATE registrations
        SET
          email = ${email},
          role = ${participant.role},
          level = ${participant.level},
          booking_session_id = ${sessionId},
          order_id = ${orderId},
          pass_type = ${passType},
          price_tier = ${DEFAULT_PRICE_TIER},
          amount_cents = ${config.pricePerPersonCents},
          payment_status = 'pending',
          registration_status = 'pending',
          registration_type = ${registrationType},
          created_at = now() AT TIME ZONE 'Africa/Johannesburg'
        WHERE id = ${existing.id}
      `;
      registrationIds.push(Number(existing.id));
      continue;
    }

    const inserted = await sql`
      INSERT INTO registrations (
        email,
        member_id,
        role,
        level,
        booking_session_id,
        order_id,
        pass_type,
        price_tier,
        amount_cents,
        payment_status,
        registration_status,
        registration_type,
        created_at
      )
      VALUES (
        ${email},
        ${participant.memberId},
        ${participant.role},
        ${participant.level},
        ${sessionId},
        ${orderId},
        ${passType},
        ${DEFAULT_PRICE_TIER},
        ${config.pricePerPersonCents},
        'pending',
        'pending',
        ${registrationType},
        now() AT TIME ZONE 'Africa/Johannesburg'
      )
      RETURNING id
    `;

    registrationIds.push(Number(inserted[0].id));
  }

  return {
    passType,
    registrationType,
    participants,
    registrationIds,
    perPersonAmountCents: config.pricePerPersonCents,
    totalAmountCents: config.pricePerPersonCents * participants.length,
  };
}
