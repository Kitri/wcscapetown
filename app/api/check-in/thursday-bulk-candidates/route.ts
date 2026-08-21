import { NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { formatZaDateISO, parseZaDateISO } from "@/lib/zaDate";
import { CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

type Candidate = {
  member_id: number;
  full_name: string;
  last_seen_date: string;
  sessions_attended: number;
  already_checked_in: boolean;
};

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const id = Number(digits);
  return Number.isFinite(id) ? id : NaN;
}

function isIsoDate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export async function GET(request: Request) {
  try {
    if (!(await isCheckinAuthed())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateISOParam = (searchParams.get("date") ?? "").trim();
    const date = dateISOParam ? parseZaDateISO(dateISOParam) : null;

    if (dateISOParam && !date) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const today = dateISOParam || formatZaDateISO(date ?? undefined);
    const eventName = (searchParams.get("event") ?? "").trim() || "Thursday Pinelands";

    if (!eventName.toLowerCase().includes("thursday")) {
      return NextResponse.json({
        date: today,
        event: eventName,
        session_dates: [] as string[],
        candidates: [] as Candidate[],
      });
    }

    const [attendanceRows, memberRows] = await Promise.all([
      getSheetValues(CHECKIN_SPREADSHEET_ID, "Attendance!A:C"),
      getSheetValues(CHECKIN_SPREADSHEET_ID, "All_members!A:C"),
    ]);

    const previousSessionDates = new Set<string>();
    const checkedInToday = new Set<number>();

    for (const row of attendanceRows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (!firstCell || firstCell === "member_id") continue;

      const memberId = parseMemberId(row[0] ?? "");
      const dateCell = (row[1] ?? "").trim();
      const eventCell = (row[2] ?? "").trim();

      if (eventCell !== eventName || !isIsoDate(dateCell)) continue;

      if (dateCell === today && Number.isFinite(memberId)) {
        checkedInToday.add(memberId);
        continue;
      }

      if (dateCell < today) previousSessionDates.add(dateCell);
    }

    const sessionDates = Array.from(previousSessionDates)
      .sort((a, b) => (a > b ? -1 : a < b ? 1 : 0))
      .slice(0, 3);

    if (sessionDates.length === 0) {
      return NextResponse.json({
        date: today,
        event: eventName,
        session_dates: [] as string[],
        candidates: [] as Candidate[],
      });
    }

    const sessionDateSet = new Set(sessionDates);
    const candidateMap = new Map<
      number,
      { member_id: number; last_seen_date: string; sessions: Set<string> }
    >();

    for (const row of attendanceRows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (!firstCell || firstCell === "member_id") continue;

      const memberId = parseMemberId(row[0] ?? "");
      if (!Number.isFinite(memberId)) continue;

      const dateCell = (row[1] ?? "").trim();
      const eventCell = (row[2] ?? "").trim();
      if (eventCell !== eventName || !sessionDateSet.has(dateCell)) continue;

      const existing = candidateMap.get(memberId);
      if (!existing) {
        candidateMap.set(memberId, {
          member_id: memberId,
          last_seen_date: dateCell,
          sessions: new Set([dateCell]),
        });
        continue;
      }

      existing.sessions.add(dateCell);
      if (dateCell > existing.last_seen_date) {
        existing.last_seen_date = dateCell;
      }
    }

    const names = new Map<number, string>();
    for (const row of memberRows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (!firstCell || firstCell === "member_id") continue;

      const memberId = parseMemberId(row[0] ?? "");
      if (!Number.isFinite(memberId)) continue;

      const firstName = (row[1] ?? "").trim();
      const surname = (row[2] ?? "").trim();
      const fullName = `${firstName} ${surname}`.trim();
      if (fullName) names.set(memberId, fullName);
    }

    const candidates: Candidate[] = Array.from(candidateMap.values())
      .filter((candidate) => !checkedInToday.has(candidate.member_id))
      .map((candidate) => ({
        member_id: candidate.member_id,
        full_name: names.get(candidate.member_id) ?? `#${candidate.member_id}`,
        last_seen_date: candidate.last_seen_date,
        sessions_attended: candidate.sessions.size,
        already_checked_in: false,
      }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "en"));

    return NextResponse.json({
      date: today,
      event: eventName,
      session_dates: sessionDates,
      candidates,
    });
  } catch (error) {
    console.error("Thursday bulk candidates error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
