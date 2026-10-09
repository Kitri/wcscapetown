import { NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import {
  formatZaDateISO,
  formatZaMonthYear,
  getZaWeekday,
  isZaMonday,
  parseZaDateISO,
} from "@/lib/zaDate";
import { CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { getTeacherRoleForDate } from "@/lib/server/teacherRoster";
import { ROLLOVER_REASON_PREFIX } from "@/lib/server/monthlyRollover";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";
import { ATT_COL, ATTENDANCE_RANGE } from "@/lib/server/attendanceColumns";

type FreeEntryMatch = {
  member_id: number;
  entry_type: string;
  details: string;
  reason: string;
  applicable_date: string;
  paid_amount_override?: number;
};

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const id = Number(digits);
  return Number.isFinite(id) ? id : NaN;
}

function parseIsoDateParts(v: string): { year: number; month: number; day: number } | null {
  const match = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, yRaw, mRaw, dRaw] = match;
  const year = Number(yRaw);
  const month = Number(mRaw);
  const day = Number(dRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

function normalizeOptionalYear(raw?: string): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  if (raw.length === 2) return 2000 + n;
  return n;
}

function parseFlexibleDayFirstDate(
  raw: string
): { day: number; month: number; year?: number } | null {
  const v = (raw ?? "").trim().replace(/,/g, " ").replace(/\s+/g, " ");
  if (!v) return null;

  const numericMatch = v.match(/^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?$/);
  if (numericMatch) {
    const [, dayRaw, monthRaw, yearRaw] = numericMatch;
    const day = Number(dayRaw);
    const month = Number(monthRaw);
    const year = normalizeOptionalYear(yearRaw);
    if (!Number.isFinite(day) || !Number.isFinite(month)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;
    if (year !== undefined && !isValidDateParts(year, month, day)) return null;
    return { day, month, year };
  }

  const textMatch = v.match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{2,4}))?$/);
  if (!textMatch) return null;

  const [, dayRaw, monthRaw, yearRaw] = textMatch;
  const day = Number(dayRaw);
  const monthToken = monthRaw.toLowerCase();
  const monthMap: Record<string, number> = {
    january: 1,
    jan: 1,
    february: 2,
    feb: 2,
    march: 3,
    mar: 3,
    april: 4,
    apr: 4,
    may: 5,
    june: 6,
    jun: 6,
    july: 7,
    jul: 7,
    august: 8,
    aug: 8,
    september: 9,
    sept: 9,
    sep: 9,
    october: 10,
    oct: 10,
    november: 11,
    nov: 11,
    december: 12,
    dec: 12,
  };
  const month = monthMap[monthToken];
  const year = normalizeOptionalYear(yearRaw);

  if (!Number.isFinite(day) || day < 1 || day > 31 || !month) return null;
  if (year !== undefined && !isValidDateParts(year, month, day)) return null;
  return { day, month, year };
}

function matchesFlexibleDayFirstDate(applicable: string, todayISO: string): boolean {
  const today = parseIsoDateParts(todayISO);
  if (!today) return false;

  const parsed = parseFlexibleDayFirstDate(applicable);
  if (!parsed) return false;

  const sameMonthDay = parsed.month === today.month && parsed.day === today.day;
  if (!sameMonthDay) return false;

  return parsed.year === undefined || parsed.year === today.year;
}

// Priority for session-count rules: above year / "All Mondays" (1), below an
// exact ISO date (3); same tier as a month-year match (2).
const SESSION_PRIORITY = 2;

// Recognise a session-count token in the applicable_date column, e.g.
// "5 sessions", "1 session", or "Sessions: 5". Returns the allowance (N), or
// null when the value is not a session token (so date parsing can handle it).
function parseSessionLimit(applicable: string): number | null {
  const v = (applicable ?? "").trim();
  if (!v) return null;

  const trailing = v.match(/^(\d+)\s*sessions?$/i);
  const leading = v.match(/^sessions?\s*:?\s*(\d+)$/i);
  const digits = trailing?.[1] ?? leading?.[1];
  if (!digits) return null;

  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Count how many times a member has already used a given session-based free
// entry. Matches on the rule's reason (Attendance col I) when the rule has one,
// otherwise on the entry type (col G) — both are written when a free check-in
// is recorded, so either uniquely identifies the grant.
function countConsumedSessions(
  attendanceRows: string[][],
  memberId: number,
  reason: string,
  entryType: string
): number {
  const reasonKey = reason.trim().toLowerCase();
  const typeKey = entryType.trim().toLowerCase();
  const useReason = reasonKey.length > 0;

  let count = 0;
  for (const row of attendanceRows) {
    const firstCell = (row[0] ?? "").trim().toLowerCase();
    if (!firstCell || firstCell === "member_id") continue;

    const id = parseMemberId(row[0] ?? "");
    if (!Number.isFinite(id) || id !== memberId) continue;

    if (useReason) {
      if ((row[ATT_COL.reason] ?? "").trim().toLowerCase() === reasonKey) count += 1;
    } else if (typeKey && (row[ATT_COL.type] ?? "").trim().toLowerCase() === typeKey) {
      count += 1;
    }
  }

  return count;
}

function matchesApplicableDate(
  applicable: string,
  todayISO: string,
  ctx: { monthYear: string; isMonday: boolean }
): number {
  // returns priority (higher is better), or 0 if no match
  const v = applicable.trim();
  if (!v) return 0;

  // Exact ISO date: applies to whatever event is being checked in
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return v === todayISO ? 3 : 0;
  }

  // Year only (e.g. "2026"): Mondays in that year
  if (/^\d{4}$/.test(v)) {
    return v === todayISO.slice(0, 4) && ctx.isMonday ? 1 : 0;
  }

  // Month-year (e.g. "February 2026"): Mondays in that month
  if (/^[A-Za-z]+\s+\d{4}$/.test(v)) {
    return v === ctx.monthYear && ctx.isMonday ? 2 : 0;
  }

  if (v.toLowerCase() === "all mondays") {
    return ctx.isMonday ? 1 : 0;
  }

  // Explicit day-first formats used in the sheet, e.g. "24 August" or
  // "24/08/2026".
  if (matchesFlexibleDayFirstDate(v, todayISO)) {
    return 3;
  }

  // Try parsing other date formats (best-effort)
  const parsed = new Date(v);
  if (!Number.isNaN(parsed.getTime())) {
    const parsedISO = formatZaDateISO(parsed);
    return parsedISO === todayISO ? 3 : 0;
  }

  return 0;
}

function isThursdayContext(event: string, date: Date | null): boolean {
  if ((event ?? "").toLowerCase().includes("thursday")) return true;
  if (!date) return false;
  return getZaWeekday(date) === "Thursday";
}

function tuesdayDateForSameWeekIso(baseDate: Date): string {
  const weekday = getZaWeekday(baseDate);
  const weekdayIndex: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const current = weekdayIndex[weekday];
  const tuesday = weekdayIndex["Tuesday"];
  if (current === undefined) {
    return formatZaDateISO(baseDate);
  }

  const adjusted = new Date(baseDate.getTime());
  adjusted.setDate(adjusted.getDate() - (current - tuesday));
  return formatZaDateISO(adjusted);
}

function parseAmount(raw: string): number {
  const cleaned = String(raw ?? "").replace(/[^0-9.]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function isTeacherEntryType(rawType: string): boolean {
  return (rawType ?? "").trim().toLowerCase().includes("teach");
}

function isDoorVolunteerEntry(entryType: string, reason: string): boolean {
  const entry = (entryType ?? "").trim().toLowerCase();
  const why = (reason ?? "").trim().toLowerCase();
  return (
    entry.includes("door volunteer") ||
    why.includes("door volunteer") ||
    why.includes("welcoming committee")
  );
}

async function getTuesdayComboForMember(memberId: number, thursdayDate: Date): Promise<FreeEntryMatch | null> {
  const attendanceRows = await getSheetValues(CHECKIN_SPREADSHEET_ID, ATTENDANCE_RANGE);
  const tuesdayISO = tuesdayDateForSameWeekIso(thursdayDate);

  for (const row of attendanceRows) {
    const firstCell = (row[0] ?? "").trim().toLowerCase();
    if (!firstCell || firstCell === "member_id") continue;

    const id = parseMemberId(row[0] ?? "");
    if (!Number.isFinite(id) || id !== memberId) continue;

    const attendanceDate = (row[ATT_COL.date] ?? "").trim();
    if (attendanceDate !== tuesdayISO) continue;

    const event = (row[ATT_COL.event] ?? "").trim().toLowerCase();
    if (!event.includes("tuesday")) continue;

    const type = (row[ATT_COL.type] ?? "").trim();
    const paidAmount = parseAmount(row[ATT_COL.amount] ?? "");
    const teacherNoPay = isTeacherEntryType(type) && paidAmount <= 0;

    return {
      member_id: memberId,
      entry_type: teacherNoPay ? "Tuesday combo (R25)" : "Tuesday combo",
      details: teacherNoPay
        ? "Attended Tuesday as teacher. Thursday combo rate applies."
        : "Attended Tuesday this week. Thursday combo applies.",
      reason: "tuesday combo",
      applicable_date: tuesdayISO,
      paid_amount_override: teacherNoPay ? 25 : 0,
    };
  }

  return null;
}

export async function GET(request: Request) {
  try {
    if (!(await isCheckinAuthed())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberIdRaw = searchParams.get("member_id") ?? "";
    const member_id = parseMemberId(memberIdRaw);

    if (!Number.isFinite(member_id)) {
      return NextResponse.json({ error: "Invalid member_id" }, { status: 400 });
    }

    const dateISOParam = (searchParams.get("date") ?? "").trim();
    const date = dateISOParam ? parseZaDateISO(dateISOParam) : null;

    if (dateISOParam && !date) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const eventParam = (searchParams.get("event") ?? "").trim();

    const todayISO = dateISOParam || formatZaDateISO(date ?? undefined);
    const ctx = {
      monthYear: date ? formatZaMonthYear(date) : formatZaMonthYear(),
      isMonday: date ? isZaMonday(date) : isZaMonday(),
    };

    // Columns: A member_id, B name (lookup), C entry_type, D applicable_date,
    //          E details, F reason
    const rows = await getSheetValues(
      CHECKIN_SPREADSHEET_ID,
      "'Free Entry'!A:F"
    );

    let best: (FreeEntryMatch & { priority: number }) | null = null;
    // True when a monthly pass covers today (teachers / volunteers on a pass are
    // still free, but the day is recorded so it can be credited next month).
    let monthlyActive = false;

    // Session-count rules need the member's attendance history to know how many
    // free sessions have already been used. Load it lazily (once) so date-only
    // lookups don't trigger an extra Sheets read.
    let attendanceRowsCache: string[][] | null = null;
    const loadAttendanceRows = async (): Promise<string[][]> => {
      if (!attendanceRowsCache) {
        attendanceRowsCache = await getSheetValues(
          CHECKIN_SPREADSHEET_ID,
          ATTENDANCE_RANGE
        );
      }
      return attendanceRowsCache;
    };

    for (const row of rows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (firstCell === "member_id") continue;

      const [idRaw, , entry_type, applicable_date, details, reason] = row;
      const id = parseMemberId(idRaw ?? "");
      if (!Number.isFinite(id) || id !== member_id) continue;

      let match: (FreeEntryMatch & { priority: number }) | null = null;

      const sessionLimit = parseSessionLimit(applicable_date ?? "");
      if (sessionLimit !== null) {
        // Session-count rule: applies until the allowance is used up.
        const ruleReason = (reason ?? "").trim();
        const ruleEntryType = (entry_type ?? "").trim();
        const consumed = countConsumedSessions(
          await loadAttendanceRows(),
          id,
          ruleReason,
          ruleEntryType
        );
        const remaining = sessionLimit - consumed;

        if (remaining > 0) {
          const sessionNumber = consumed + 1;
          const usage =
            remaining === 1
              ? `free session ${sessionNumber} of ${sessionLimit} \u2014 last free session`
              : `free session ${sessionNumber} of ${sessionLimit} \u2014 ${remaining} remaining`;
          const baseDetails = (details ?? "").trim();

          match = {
            member_id: id,
            entry_type: ruleEntryType || "Free entry",
            details: baseDetails ? `${baseDetails} (${usage})` : `(${usage})`,
            reason: ruleReason,
            applicable_date: (applicable_date ?? "").trim(),
            priority: SESSION_PRIORITY,
          };
        }
        // remaining <= 0: allowance used up — leave match null so the operator
        // falls through to normal paid entry (silent fallback).
      } else {
        const priority = matchesApplicableDate(applicable_date ?? "", todayISO, ctx);

        if (priority) {
          match = {
            member_id: id,
            entry_type: (entry_type ?? "").trim(),
            details: (details ?? "").trim(),
            reason: (reason ?? "").trim(),
            applicable_date: (applicable_date ?? "").trim(),
            priority,
          };
        }
      }

      if (!match) continue;

      if ((match.entry_type ?? "").toLowerCase().includes("monthly")) {
        monthlyActive = true;
      }

      // Prefer door volunteer entries over monthly at the same priority
      const matchIsDoorVol = isDoorVolunteerEntry(match.entry_type, match.reason);
      const bestIsDoorVol = best
        ? isDoorVolunteerEntry(best.entry_type, best.reason)
        : false;

      if (
        !best ||
        match.priority > best.priority ||
        (match.priority === best.priority && matchIsDoorVol && !bestIsDoorVol)
      ) {
        best = match;
      }
    }

    // Teachers come from the live teaching roster (only looked up for members
    // listed in the Teachers tab). A roster failure must never block check-in.
    const isMondayEvent = !eventParam || eventParam.toLowerCase().includes("monday");
    if (isMondayEvent) {
      try {
        const teacherRole = await getTeacherRoleForDate(member_id, todayISO);
        if (teacherRole) {
          best = {
            member_id,
            entry_type: "Teacher",
            details:
              teacherRole === "newcomer teacher"
                ? "Newcomer teacher."
                : "Teaching today.",
            // On a monthly pass the class is recorded so it rolls over as a credit.
            reason: monthlyActive
              ? `${ROLLOVER_REASON_PREFIX} ${teacherRole}`
              : teacherRole,
            applicable_date: todayISO,
            priority: 4,
          };
        }
      } catch (e) {
        console.error("Teacher roster lookup error:", e);
      }
    }

    const comboCandidate =
      isThursdayContext(eventParam, date) && date
        ? await getTuesdayComboForMember(member_id, date)
        : null;

    if (!best && !comboCandidate) {
      return NextResponse.json({ applies: false, today: todayISO });
    }
    const resolved = best ?? comboCandidate;
    if (!resolved) {
      return NextResponse.json({ applies: false, today: todayISO });
    }

    return NextResponse.json({
      applies: true,
      today: todayISO,
      entry_type: resolved.entry_type,
      applicable_date: resolved.applicable_date,
      details: resolved.details,
      reason: resolved.reason,
      paid_amount_override: resolved.paid_amount_override ?? 0,
    });
  } catch (error) {
    console.error("Free entry check error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
