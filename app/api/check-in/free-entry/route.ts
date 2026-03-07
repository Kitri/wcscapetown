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
import { isCheckinAuthed } from "@/lib/server/checkinAuth";
import { isBootcampEvent, loadBootcampAttendees } from "@/lib/server/bootcampSheet";

type FreeEntryMatch = {
  member_id: number;
  entry_type: string;
  details: string;
  reason: string;
  applicable_date: string;
  paid_amount_override?: number;
};

function parseBoolean(raw: string): boolean {
  const v = (raw ?? "").trim().toLowerCase();
  return v === "true" || v === "yes" || v === "1";
}

function matchesEvent(row: string[], event: string): boolean {
  // Columns: A=member_id, B=name, C=entry_type, D=applicable_date, E=details, F=reason,
  //          G=Monday Plumstead, H=Tuesday Pinelands, I=Social
  const mondayPlumstead = parseBoolean(row[6] ?? "");
  const tuesdayPinelands = parseBoolean(row[7] ?? "");
  const social = parseBoolean(row[8] ?? "");

  // If none are set, assume it applies to all events (backward compatibility)
  if (!mondayPlumstead && !tuesdayPinelands && !social) {
    return true;
  }

  const eventLower = event.toLowerCase();
  if (eventLower.includes("monday") && eventLower.includes("plumstead")) {
    return mondayPlumstead;
  }
  if (eventLower.includes("tuesday") && eventLower.includes("pinelands")) {
    return tuesdayPinelands;
  }
  // For "Social" events or any event with "social" in the name
  if (eventLower.includes("social")) {
    return social;
  }
  // For other events (Thursday, Saturday, etc.), check if any matching column is set
  // Default: if no specific column matches, don't grant free entry
  return false;
}

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const id = Number(digits);
  return Number.isFinite(id) ? id : NaN;
}

function matchesApplicableDate(
  applicable: string,
  todayISO: string,
  ctx: { monthYear: string; isMonday: boolean },
  opts: { hasEventFilters: boolean }
): number {
  // returns priority (higher is better), or 0 if no match
  const v = applicable.trim();
  if (!v) return 0;

  // Exact ISO date
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return v === todayISO ? 3 : 0;
  }

  // Month-year (e.g. "February 2026")
  // - If this row has event filters (Monday/Tues/Social columns), let the event filters decide the day.
  // - If it has NO event filters, keep the legacy behavior: apply only on Mondays.
  if (/^[A-Za-z]+\s+\d{4}$/.test(v)) {
    if (opts.hasEventFilters) {
      return v === ctx.monthYear ? 2 : 0;
    }
    return v === ctx.monthYear && ctx.isMonday ? 2 : 0;
  }

  if (v === "All Mondays") {
    return ctx.isMonday ? 1 : 0;
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

async function getTuesdayComboForMember(memberId: number, thursdayDate: Date): Promise<FreeEntryMatch | null> {
  const attendanceRows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "Attendance!A:H");
  const tuesdayISO = tuesdayDateForSameWeekIso(thursdayDate);

  for (const row of attendanceRows) {
    const firstCell = (row[0] ?? "").trim().toLowerCase();
    if (!firstCell || firstCell === "member_id") continue;

    const id = parseMemberId(row[0] ?? "");
    if (!Number.isFinite(id) || id !== memberId) continue;

    const attendanceDate = (row[1] ?? "").trim();
    if (attendanceDate !== tuesdayISO) continue;

    const event = (row[2] ?? "").trim().toLowerCase();
    if (!event.includes("tuesday")) continue;

    const type = (row[5] ?? "").trim();
    const paidAmount = parseAmount(row[4] ?? "");
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

    if (isBootcampEvent(eventParam)) {
      const attendees = await loadBootcampAttendees(CHECKIN_SPREADSHEET_ID);
      const attendeeExists = attendees.some((a) => a.member_id === member_id);
      if (!attendeeExists) {
        return NextResponse.json({ applies: false, today: dateISOParam || formatZaDateISO(date ?? undefined) });
      }

      return NextResponse.json({
        applies: true,
        today: dateISOParam || formatZaDateISO(date ?? undefined),
        entry_type: "Bootcamp registration",
        applicable_date: dateISOParam || formatZaDateISO(date ?? undefined),
        details: "Registered bootcamp attendee.",
        reason: "bootcamp registration",
        paid_amount_override: 0,
      });
    }

    const todayISO = dateISOParam || formatZaDateISO(date ?? undefined);
    const ctx = {
      monthYear: date ? formatZaMonthYear(date) : formatZaMonthYear(),
      isMonday: date ? isZaMonday(date) : isZaMonday(),
    };

    // Read columns A:I to include the new event filter columns
    const rows = await getSheetValues(
      CHECKIN_SPREADSHEET_ID,
      "'Free Entry'!A:I"
    );

    let best: (FreeEntryMatch & { priority: number }) | null = null;

    for (const row of rows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (firstCell === "member_id") continue;

      const [idRaw, , entry_type, applicable_date, details, reason] = row;
      const id = parseMemberId(idRaw ?? "");
      if (!Number.isFinite(id) || id !== member_id) continue;

      // Check event filter if an event is specified
      if (eventParam && !matchesEvent(row, eventParam)) continue;

      const hasEventFilters =
        parseBoolean(row[6] ?? "") ||
        parseBoolean(row[7] ?? "") ||
        parseBoolean(row[8] ?? "");

      const priority = matchesApplicableDate(applicable_date ?? "", todayISO, ctx, {
        hasEventFilters,
      });
      if (!priority) continue;

      const match: FreeEntryMatch & { priority: number } = {
        member_id: id,
        entry_type: (entry_type ?? "").trim(),
        details: (details ?? "").trim(),
        reason: (reason ?? "").trim(),
        applicable_date: (applicable_date ?? "").trim(),
        priority,
      };

      if (!best || match.priority > best.priority) {
        best = match;
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
