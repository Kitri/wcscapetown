import { NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { formatZaDateISO, parseZaDateISO } from "@/lib/zaDate";
import { CHECKIN_EVENT_NAME, CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";
import { ATT_COL, ATTENDANCE_RANGE } from "@/lib/server/attendanceColumns";
import { countRolloverClasses } from "@/lib/server/monthlyRollover";

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const id = Number(digits);
  return Number.isFinite(id) ? id : NaN;
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
    const eventName = eventParam || CHECKIN_EVENT_NAME;

    const today = dateISOParam || formatZaDateISO(date ?? undefined);

    const rows = await getSheetValues(CHECKIN_SPREADSHEET_ID, ATTENDANCE_RANGE);

    let alreadyCheckedIn = false;
    // Only one welcoming committee member per event: once someone has checked in
    // as one today, the option is withdrawn for everybody else.
    let welcomingCommitteeCheckedIn = false;

    for (const row of rows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (firstCell === "member_id") continue;

      const dateCell = (row[ATT_COL.date] ?? "").trim();
      const eventCell = (row[ATT_COL.event] ?? "").trim();
      if (dateCell !== today || eventCell !== eventName) continue;

      if (parseMemberId(row[0] ?? "") === member_id) alreadyCheckedIn = true;

      const typeAndReason = `${row[ATT_COL.type] ?? ""} ${row[ATT_COL.reason] ?? ""}`.toLowerCase();
      if (
        typeAndReason.includes("welcoming committee") ||
        typeAndReason.includes("door volunteer")
      ) {
        welcomingCommitteeCheckedIn = true;
      }
    }

    // Teacher / volunteer classes worked on a monthly pass: credited against the
    // next monthly purchase.
    const rolloverCredit = countRolloverClasses(rows, member_id, parseMemberId);

    return NextResponse.json({
      alreadyCheckedIn,
      welcomingCommitteeCheckedIn,
      rolloverCredit,
      today,
      event: eventName,
    });
  } catch (error) {
    console.error("Already-checked-in error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
