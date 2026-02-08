import { NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { formatZaDateISO, parseZaDateISO } from "@/lib/zaDate";
import { CHECKIN_EVENT_NAME, CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

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

    // Attendance columns: A member_id, B date, C event
    const rows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "Attendance!A:C");

    for (const row of rows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (firstCell === "member_id") continue;

      const id = parseMemberId(row[0] ?? "");
      const dateCell = (row[1] ?? "").trim();
      const eventCell = (row[2] ?? "").trim();

      if (id === member_id && dateCell === today && eventCell === eventName) {
        return NextResponse.json({ alreadyCheckedIn: true, today, event: eventName });
      }
    }

    return NextResponse.json({ alreadyCheckedIn: false, today, event: eventName });
  } catch (error) {
    console.error("Already-checked-in error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
