import { getDb } from '@/lib/db';
import { getSheetValues } from '@/lib/googleSheets';

type RawWeekenderPassType = 'weekend' | 'day' | 'day_saturday' | 'day_sunday' | 'party';
export type WeekenderPassType = 'weekend' | 'day' | 'party';

type CheckInRow = {
  id: number;
  checked_in: boolean;
  colour: string | null;
  updated_at: string | null;
};

type DayPassDetails = {
  workshopDay: string | null;
  partyAddOn: boolean;
};

type WeekenderRegistrationRow = {
  registration_id: number;
  member_id: number;
  email: string;
  pass_type: RawWeekenderPassType;
  role: string;
  level: number;
  registration_type: string;
  payment_status: string;
  registration_status: string;
  name: string;
  surname: string;
};

function isWeekendCheckinTableMissing(error: unknown): boolean {
  const candidate = error as { code?: string; message?: string } | null;
  if (!candidate) return false;

  if (candidate.code === '42P01') return true;
  const message = String(candidate.message ?? '').toLowerCase();
  return message.includes('relation "weekend_checkin" does not exist');
}

export type WeekenderCheckInLookup = {
  member: {
    memberId: number;
    name: string;
    surname: string;
    email: string;
  };
  registration: {
    registrationId: number;
    passType: WeekenderPassType;
    passTypeLabel: string;
    role: string;
    level: number;
    registrationType: string;
    paymentStatus: string;
    registrationStatus: string;
    weekendDay: string | null;
    partyAddOn: boolean;
    spinningAddOn: boolean;
    spotlightAddOn: boolean;
    canCheckIn: boolean;
  };
  checkIn: {
    id: number;
    checkedIn: boolean;
    colour: string | null;
    updatedAt: string | null;
  } | null;
};

export type WeekenderCheckInAdminListItem = {
  checkInEntryId: number | null;
  memberId: number;
  registrationId: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  level: number;
  registrationType: string;
  passType: string;
  weekendDay: string | null;
  partyAddOn: boolean;
  spinningAddOn: boolean;
  spotlightAddOn: boolean;
  colour: string | null;
  checkedIn: boolean;
  updatedAt: string | null;
};

function normalizePassType(passType: RawWeekenderPassType): WeekenderPassType {
  if (passType === 'party') return 'party';
  if (passType === 'weekend') return 'weekend';
  return 'day';
}

function passTypeLabel(passType: WeekenderPassType): string {
  if (passType === 'weekend') return 'Weekend Pass';
  if (passType === 'party') return 'Party Pass';
  return 'Day Pass';
}

function resolveWeekendDay(rawPassType: RawWeekenderPassType, workshopDay: string | null): string | null {
  if (workshopDay) return workshopDay;
  if (rawPassType === 'day_saturday') return 'Saturday';
  if (rawPassType === 'day_sunday') return 'Sunday';
  return null;
}

function normalizeOptionalColour(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeEmail(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

const WEEKENDER_ADDON_SHEET_CACHE_TTL_MS = Number(
  process.env.WEEKENDER_ADDON_SHEET_CACHE_TTL_MS ?? 45_000
);
const weekenderAddOnSheetCache = new Map<string, { expiresAt: number; rows: string[][] }>();

async function getCachedSheetValues(spreadsheetId: string, range: string): Promise<string[][]> {
  const key = `${spreadsheetId}::${range}`;
  const now = Date.now();
  const cached = weekenderAddOnSheetCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.rows;
  }

  const rows = await getSheetValues(spreadsheetId, range);
  weekenderAddOnSheetCache.set(key, {
    rows,
    expiresAt: now + WEEKENDER_ADDON_SHEET_CACHE_TTL_MS,
  });
  return rows;
}

async function getAddOnFlags(memberId: number, email: string): Promise<{
  spinningAddOn: boolean;
  spotlightAddOn: boolean;
}> {
  let spinningAddOn = false;
  let spotlightAddOn = false;
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT
        pass_type,
        payment_status
      FROM weekend_add_ons
      WHERE member_id = ${memberId}
    `;

    for (const row of rows) {
      const passType = String(row.pass_type ?? '').trim();
      const paymentStatus = String(row.payment_status ?? '').trim();
      const isActive = paymentStatus !== 'failed';

      if (passType === 'spin' && isActive) spinningAddOn = true;
      if (passType === 'spot' && isActive) spotlightAddOn = true;
    }
  } catch {
    // Ignore DB add-on lookup errors so sheet-based membership can still be used.
  }

  const sheetId = process.env.SHEET_ID_WEEKEND_ADDON;
  const targetEmail = normalizeEmail(email);
  if (sheetId && targetEmail) {
    try {
      const [spinningRows, spotlightRows] = await Promise.all([
        getCachedSheetValues(sheetId, 'Spinning!A:K'),
        getCachedSheetValues(sheetId, 'Spotlight!A:M'),
      ]);

      for (const row of spinningRows) {
        if (normalizeEmail(row[3]) === targetEmail) {
          spinningAddOn = true;
          break;
        }
      }

      for (const row of spotlightRows) {
        if (normalizeEmail(row[3]) === targetEmail || normalizeEmail(row[12]) === targetEmail) {
          spotlightAddOn = true;
          break;
        }
      }
    } catch {
      // Ignore sheet lookup failures; DB-derived flags (if any) are still returned.
    }
  }

  return {
    spinningAddOn,
    spotlightAddOn,
  };
}

async function getCheckInByRegistrationId(registrationId: number): Promise<CheckInRow | null> {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT
        id,
        checked_in,
        colour,
        updated_at
      FROM weekend_checkin
      WHERE registration_id = ${registrationId}
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    return rows[0] as CheckInRow;
  } catch (error) {
    if (isWeekendCheckinTableMissing(error)) {
      console.warn('weekend_checkin table is missing; treating as not checked in for lookup.');
      return null;
    }
    throw error;
  }
}

async function getDayPassDetailsByRegistrationId(registrationId: number): Promise<DayPassDetails> {
  const sql = getDb();

  try {
    const rows = await sql`
      SELECT
        workshop_day,
        COALESCE(party_add_on, false) AS party_add_on
      FROM day_pass_details
      WHERE registration_id = ${registrationId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return {
        workshopDay: null,
        partyAddOn: false,
      };
    }

    return {
      workshopDay: rows[0].workshop_day ? String(rows[0].workshop_day).trim() : null,
      partyAddOn: Boolean(rows[0].party_add_on),
    };
  } catch (error) {
    console.warn('Could not read day_pass_details during weekender check-in lookup:', error);
    return {
      workshopDay: null,
      partyAddOn: false,
    };
  }
}

async function buildWeekenderCheckInLookup(
  row: WeekenderRegistrationRow,
  fallbackEmail: string
): Promise<WeekenderCheckInLookup> {

  const normalizedPassType = normalizePassType(row.pass_type);
  const [addOns, existingCheckIn, dayPassDetails] = await Promise.all([
    getAddOnFlags(Number(row.member_id), String(row.email ?? fallbackEmail)),
    getCheckInByRegistrationId(Number(row.registration_id)),
    getDayPassDetailsByRegistrationId(Number(row.registration_id)),
  ]);
  const canCheckIn = !Boolean(existingCheckIn?.checked_in);

  return {
    member: {
      memberId: Number(row.member_id),
      name: String(row.name ?? '').trim(),
      surname: String(row.surname ?? '').trim(),
      email: String(row.email ?? '').trim() || fallbackEmail,
    },
    registration: {
      registrationId: Number(row.registration_id),
      passType: normalizedPassType,
      passTypeLabel: passTypeLabel(normalizedPassType),
      role: String(row.role ?? '').trim(),
      level: Number(row.level ?? 0),
      registrationType: String(row.registration_type ?? '').trim(),
      paymentStatus: String(row.payment_status ?? '').trim(),
      registrationStatus: String(row.registration_status ?? '').trim(),
      weekendDay: resolveWeekendDay(
        row.pass_type,
        dayPassDetails.workshopDay
      ),
      partyAddOn:
        normalizedPassType === 'party'
          ? true
          : dayPassDetails.partyAddOn,
      spinningAddOn: addOns.spinningAddOn,
      spotlightAddOn: addOns.spotlightAddOn,
      canCheckIn,
    },
    checkIn: existingCheckIn
      ? {
        id: Number(existingCheckIn.id),
        checkedIn: Boolean(existingCheckIn.checked_in),
        colour: normalizeOptionalColour(existingCheckIn.colour),
        updatedAt: existingCheckIn.updated_at ? String(existingCheckIn.updated_at) : null,
      }
      : null,
  };
}

export async function lookupWeekenderCheckInByRegistrationId(
  registrationId: number
): Promise<WeekenderCheckInLookup | null> {
  if (!Number.isInteger(registrationId) || registrationId <= 0) return null;

  const sql = getDb();
  const rows = await sql`
    SELECT
      r.id AS registration_id,
      r.member_id,
      r.email,
      r.pass_type,
      r.role,
      r.level,
      r.registration_type,
      r.payment_status,
      r.registration_status,
      m.name,
      m.surname
    FROM registrations r
    INNER JOIN members m ON m.member_id = r.member_id
    WHERE r.id = ${registrationId}
      AND r.pass_type IN ('weekend', 'day', 'day_saturday', 'day_sunday', 'party')
    LIMIT 1
  `;

  if (rows.length === 0) return null;
  const row = rows[0] as WeekenderRegistrationRow;
  return buildWeekenderCheckInLookup(row, '');
}

export async function lookupWeekenderCheckInByEmail(
  email: string
): Promise<WeekenderCheckInLookup | null> {
  const normalizedEmail = String(email ?? '').trim();
  if (!normalizedEmail) return null;

  const sql = getDb();
  const rows = await sql`
    SELECT
      r.id AS registration_id,
      r.member_id,
      r.email,
      r.pass_type,
      r.role,
      r.level,
      r.registration_type,
      r.payment_status,
      r.registration_status,
      m.name,
      m.surname
    FROM registrations r
    INNER JOIN members m ON m.member_id = r.member_id
    WHERE LOWER(TRIM(r.email)) = LOWER(TRIM(${normalizedEmail}))
      AND r.pass_type IN ('weekend', 'day', 'day_saturday', 'day_sunday', 'party')
    ORDER BY
      CASE
        WHEN r.registration_status = 'complete' AND r.payment_status = 'complete' THEN 1
        WHEN r.registration_status = 'pending' OR r.payment_status = 'pending' THEN 2
        WHEN r.registration_status = 'waitlist' THEN 3
        ELSE 4
      END,
      r.created_at DESC
    LIMIT 1
  `;

  if (rows.length === 0) return null;
  const row = rows[0] as WeekenderRegistrationRow;
  return buildWeekenderCheckInLookup(row, normalizedEmail);
}

export async function upsertWeekenderCheckIn(params: {
  lookup: WeekenderCheckInLookup;
  checkedIn?: boolean;
  colour?: string | null;
}): Promise<void> {
  const sql = getDb();
  const checkedIn = params.checkedIn ?? true;
  const hasColourOverride = Object.prototype.hasOwnProperty.call(params, 'colour');
  const colourToStore = hasColourOverride
    ? normalizeOptionalColour(params.colour ?? null)
    : params.lookup.checkIn?.colour ?? null;

  try {
    await sql`
      INSERT INTO weekend_checkin (
        member_id,
        registration_id,
        pass_type,
        weekend_day,
        party_add_on,
        spinning_add_on,
        spotlight_add_on,
        colour,
        checked_in,
        created_at,
        updated_at
      )
      VALUES (
        ${params.lookup.member.memberId},
        ${params.lookup.registration.registrationId},
        ${params.lookup.registration.passType},
        ${params.lookup.registration.weekendDay},
        ${params.lookup.registration.partyAddOn},
        ${params.lookup.registration.spinningAddOn},
        ${params.lookup.registration.spotlightAddOn},
        ${colourToStore},
        ${checkedIn},
        now() AT TIME ZONE 'Africa/Johannesburg',
        now() AT TIME ZONE 'Africa/Johannesburg'
      )
      ON CONFLICT (registration_id)
      DO UPDATE SET
        member_id = EXCLUDED.member_id,
        pass_type = EXCLUDED.pass_type,
        weekend_day = EXCLUDED.weekend_day,
        party_add_on = EXCLUDED.party_add_on,
        spinning_add_on = EXCLUDED.spinning_add_on,
        spotlight_add_on = EXCLUDED.spotlight_add_on,
        colour = EXCLUDED.colour,
        checked_in = EXCLUDED.checked_in,
        updated_at = now() AT TIME ZONE 'Africa/Johannesburg'
    `;
  } catch (error) {
    if (isWeekendCheckinTableMissing(error)) {
      throw new Error('Weekender check-in table is not configured in this environment.');
    }
    throw error;
  }
}

export async function listWeekenderCheckIns(
  query: string
): Promise<WeekenderCheckInAdminListItem[]> {
  const sql = getDb();
  const q = String(query ?? '').trim().toLowerCase();
  const pattern = `%${q}%`;
  let rows: Array<Record<string, unknown>> = [];
  try {
    rows = q
      ? await sql`
          WITH ranked_registrations AS (
            SELECT
              r.id AS registration_id,
              r.member_id,
              r.email,
              r.pass_type,
              r.role,
              r.level,
              r.registration_type,
              ROW_NUMBER() OVER (
                PARTITION BY r.member_id
                ORDER BY
                  CASE
                    WHEN r.registration_status = 'complete' AND r.payment_status = 'complete' THEN 1
                    WHEN r.registration_status = 'pending' OR r.payment_status = 'pending' THEN 2
                    WHEN r.registration_status = 'waitlist' THEN 3
                    ELSE 4
                  END,
                  r.created_at DESC
              ) AS rn
            FROM registrations r
            WHERE r.pass_type IN ('weekend', 'day', 'day_saturday', 'day_sunday', 'party')
          )
          SELECT
            wc.id AS checkin_id,
            rr.member_id,
            rr.registration_id,
            rr.pass_type,
            COALESCE(
              NULLIF(wc.weekend_day, ''),
              NULLIF(dp.workshop_day, ''),
              CASE
                WHEN rr.pass_type = 'day_saturday' THEN 'Saturday'
                WHEN rr.pass_type = 'day_sunday' THEN 'Sunday'
                ELSE NULL
              END
            ) AS weekend_day,
            COALESCE(
              wc.party_add_on,
              CASE
                WHEN rr.pass_type = 'party' THEN true
                ELSE COALESCE(dp.party_add_on, false)
              END
            ) AS party_add_on,
            COALESCE(wc.spinning_add_on, false) AS spinning_add_on,
            COALESCE(wc.spotlight_add_on, false) AS spotlight_add_on,
            wc.colour,
            COALESCE(wc.checked_in, false) AS checked_in,
            wc.updated_at,
            m.name,
            m.surname,
            rr.email,
            rr.role,
            rr.level,
            rr.registration_type
          FROM ranked_registrations rr
          INNER JOIN members m ON m.member_id = rr.member_id
          LEFT JOIN day_pass_details dp ON dp.registration_id = rr.registration_id
          LEFT JOIN weekend_checkin wc ON wc.registration_id = rr.registration_id
          WHERE
            rr.rn = 1
            AND (
              LOWER(m.name || ' ' || m.surname) LIKE ${pattern}
              OR LOWER(COALESCE(rr.email, '')) LIKE ${pattern}
            )
          ORDER BY COALESCE(wc.checked_in, false) DESC, m.name ASC, m.surname ASC
          LIMIT 500
        `
      : await sql`
          WITH ranked_registrations AS (
            SELECT
              r.id AS registration_id,
              r.member_id,
              r.email,
              r.pass_type,
              r.role,
              r.level,
              r.registration_type,
              ROW_NUMBER() OVER (
                PARTITION BY r.member_id
                ORDER BY
                  CASE
                    WHEN r.registration_status = 'complete' AND r.payment_status = 'complete' THEN 1
                    WHEN r.registration_status = 'pending' OR r.payment_status = 'pending' THEN 2
                    WHEN r.registration_status = 'waitlist' THEN 3
                    ELSE 4
                  END,
                  r.created_at DESC
              ) AS rn
            FROM registrations r
            WHERE r.pass_type IN ('weekend', 'day', 'day_saturday', 'day_sunday', 'party')
          )
          SELECT
            wc.id AS checkin_id,
            rr.member_id,
            rr.registration_id,
            rr.pass_type,
            COALESCE(
              NULLIF(wc.weekend_day, ''),
              NULLIF(dp.workshop_day, ''),
              CASE
                WHEN rr.pass_type = 'day_saturday' THEN 'Saturday'
                WHEN rr.pass_type = 'day_sunday' THEN 'Sunday'
                ELSE NULL
              END
            ) AS weekend_day,
            COALESCE(
              wc.party_add_on,
              CASE
                WHEN rr.pass_type = 'party' THEN true
                ELSE COALESCE(dp.party_add_on, false)
              END
            ) AS party_add_on,
            COALESCE(wc.spinning_add_on, false) AS spinning_add_on,
            COALESCE(wc.spotlight_add_on, false) AS spotlight_add_on,
            wc.colour,
            COALESCE(wc.checked_in, false) AS checked_in,
            wc.updated_at,
            m.name,
            m.surname,
            rr.email,
            rr.role,
            rr.level,
            rr.registration_type
          FROM ranked_registrations rr
          INNER JOIN members m ON m.member_id = rr.member_id
          LEFT JOIN day_pass_details dp ON dp.registration_id = rr.registration_id
          LEFT JOIN weekend_checkin wc ON wc.registration_id = rr.registration_id
          WHERE rr.rn = 1
          ORDER BY COALESCE(wc.checked_in, false) DESC, m.name ASC, m.surname ASC
          LIMIT 500
        `;
  } catch (error) {
    if (!isWeekendCheckinTableMissing(error)) {
      throw error;
    }

    rows = q
      ? await sql`
          WITH ranked_registrations AS (
            SELECT
              r.id AS registration_id,
              r.member_id,
              r.email,
              r.pass_type,
              r.role,
              r.level,
              r.registration_type,
              ROW_NUMBER() OVER (
                PARTITION BY r.member_id
                ORDER BY
                  CASE
                    WHEN r.registration_status = 'complete' AND r.payment_status = 'complete' THEN 1
                    WHEN r.registration_status = 'pending' OR r.payment_status = 'pending' THEN 2
                    WHEN r.registration_status = 'waitlist' THEN 3
                    ELSE 4
                  END,
                  r.created_at DESC
              ) AS rn
            FROM registrations r
            WHERE r.pass_type IN ('weekend', 'day', 'day_saturday', 'day_sunday', 'party')
          )
          SELECT
            NULL::integer AS checkin_id,
            rr.member_id,
            rr.registration_id,
            rr.pass_type,
            COALESCE(
              NULLIF(dp.workshop_day, ''),
              CASE
                WHEN rr.pass_type = 'day_saturday' THEN 'Saturday'
                WHEN rr.pass_type = 'day_sunday' THEN 'Sunday'
                ELSE NULL
              END
            ) AS weekend_day,
            CASE
              WHEN rr.pass_type = 'party' THEN true
              ELSE COALESCE(dp.party_add_on, false)
            END AS party_add_on,
            false AS spinning_add_on,
            false AS spotlight_add_on,
            NULL::text AS colour,
            false AS checked_in,
            NULL::timestamptz AS updated_at,
            m.name,
            m.surname,
            rr.email,
            rr.role,
            rr.level,
            rr.registration_type
          FROM ranked_registrations rr
          INNER JOIN members m ON m.member_id = rr.member_id
          LEFT JOIN day_pass_details dp ON dp.registration_id = rr.registration_id
          WHERE
            rr.rn = 1
            AND (
              LOWER(m.name || ' ' || m.surname) LIKE ${pattern}
              OR LOWER(COALESCE(rr.email, '')) LIKE ${pattern}
            )
          ORDER BY m.name ASC, m.surname ASC
          LIMIT 500
        `
      : await sql`
          WITH ranked_registrations AS (
            SELECT
              r.id AS registration_id,
              r.member_id,
              r.email,
              r.pass_type,
              r.role,
              r.level,
              r.registration_type,
              ROW_NUMBER() OVER (
                PARTITION BY r.member_id
                ORDER BY
                  CASE
                    WHEN r.registration_status = 'complete' AND r.payment_status = 'complete' THEN 1
                    WHEN r.registration_status = 'pending' OR r.payment_status = 'pending' THEN 2
                    WHEN r.registration_status = 'waitlist' THEN 3
                    ELSE 4
                  END,
                  r.created_at DESC
              ) AS rn
            FROM registrations r
            WHERE r.pass_type IN ('weekend', 'day', 'day_saturday', 'day_sunday', 'party')
          )
          SELECT
            NULL::integer AS checkin_id,
            rr.member_id,
            rr.registration_id,
            rr.pass_type,
            COALESCE(
              NULLIF(dp.workshop_day, ''),
              CASE
                WHEN rr.pass_type = 'day_saturday' THEN 'Saturday'
                WHEN rr.pass_type = 'day_sunday' THEN 'Sunday'
                ELSE NULL
              END
            ) AS weekend_day,
            CASE
              WHEN rr.pass_type = 'party' THEN true
              ELSE COALESCE(dp.party_add_on, false)
            END AS party_add_on,
            false AS spinning_add_on,
            false AS spotlight_add_on,
            NULL::text AS colour,
            false AS checked_in,
            NULL::timestamptz AS updated_at,
            m.name,
            m.surname,
            rr.email,
            rr.role,
            rr.level,
            rr.registration_type
          FROM ranked_registrations rr
          INNER JOIN members m ON m.member_id = rr.member_id
          LEFT JOIN day_pass_details dp ON dp.registration_id = rr.registration_id
          WHERE rr.rn = 1
          ORDER BY m.name ASC, m.surname ASC
          LIMIT 500
        `;
  }

  return rows.map((row) => {
    const rawColour = row.colour;

    return {
      checkInEntryId: row.checkin_id == null ? null : Number(row.checkin_id),
      memberId: Number(row.member_id),
      registrationId: Number(row.registration_id),
      name: String(row.name ?? '').trim(),
      surname: String(row.surname ?? '').trim(),
      email: String(row.email ?? '').trim(),
      role: String(row.role ?? '').trim(),
      level: Number(row.level ?? 0),
      registrationType: String(row.registration_type ?? '').trim(),
      passType: String(row.pass_type ?? '').trim(),
      weekendDay: row.weekend_day ? String(row.weekend_day).trim() : null,
      partyAddOn: Boolean(row.party_add_on),
      spinningAddOn: Boolean(row.spinning_add_on),
      spotlightAddOn: Boolean(row.spotlight_add_on),
      colour: normalizeOptionalColour(
        typeof rawColour === 'string' || rawColour == null
          ? rawColour
          : String(rawColour)
      ),
      checkedIn: Boolean(row.checked_in),
      updatedAt: row.updated_at ? String(row.updated_at) : null,
    };
  });
}

export async function updateWeekenderCheckInColour(
  entryId: number,
  colour: string | null
): Promise<boolean> {
  const sql = getDb();
  const normalizedColour = normalizeOptionalColour(colour);
  let rows;
  try {
    rows = await sql`
      UPDATE weekend_checkin
      SET
        colour = ${normalizedColour},
        updated_at = now() AT TIME ZONE 'Africa/Johannesburg'
      WHERE id = ${entryId}
      RETURNING id
    `;
  } catch (error) {
    if (isWeekendCheckinTableMissing(error)) {
      return false;
    }
    throw error;
  }

  return rows.length > 0;
}
