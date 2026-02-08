import { NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { formatZaDateISO } from "@/lib/zaDate";
import { CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
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

    const today = formatZaDateISO();

    // Attendance columns: A member_id, B date
    const rows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "Attendance!A:B");

    for (const row of rows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (firstCell === "member_id") continue;

      const id = parseMemberId(row[0] ?? "");
      const date = (row[1] ?? "").trim();

      if (id === member_id && date === today) {
        return NextResponse.json({ alreadyCheckedIn: true, today });
      }
    }

    return NextResponse.json({ alreadyCheckedIn: false, today });
  } catch (error) {
    console.error("Already-checked-in error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
