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

type Item = {
  member_id: number;
  full_name: string;
  type: string;
  paid_via: string;
  paid_amount: number;
  comment: string;
  rowNumber: number; // 1-based row number in Attendance sheet
};

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

    const eventParam = (searchParams.get("event") ?? "").trim();
    const eventName = eventParam || CHECKIN_EVENT_NAME;

    const today = dateISOParam || formatZaDateISO(date ?? undefined);

    // Members mapping
    const memberRows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "All_members!A:C");
    const idToName = new Map<number, string>();
    for (const row of memberRows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (!firstCell || firstCell === "member_id") continue;
      const id = parseMemberId(row[0] ?? "");
      if (!Number.isFinite(id)) continue;
      const first = (row[1] ?? "").trim();
      const sur = (row[2] ?? "").trim();
      const full_name = `${first} ${sur}`.trim();
      if (full_name) idToName.set(id, full_name);
    }

    // Attendance: A member_id, B date, C event, D paid_via, E amount, F type, G comment
    const attendanceRows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "Attendance!A:G");

    const items: Item[] = [];
    for (let i = 0; i < attendanceRows.length; i++) {
      const row = attendanceRows[i] ?? [];
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (!firstCell || firstCell === "member_id") continue;

      const id = parseMemberId(row[0] ?? "");
      const dateCell = (row[1] ?? "").trim();
      const eventCell = (row[2] ?? "").trim();
      if (!Number.isFinite(id) || dateCell !== today || eventCell !== eventName) continue;

      const paid_via = (row[3] ?? "").trim();
      const paid_amount = Number(String(row[4] ?? "").replace(/[^0-9.]/g, "")) || 0;
      const type = (row[5] ?? "").trim();
      const comment = (row[6] ?? "").trim();

      items.push({
        member_id: id,
        full_name: idToName.get(id) ?? `#${id}`,
        type,
        paid_via,
        paid_amount,
        comment,
        rowNumber: i + 1,
      });
    }

    return NextResponse.json({ today, event: eventName, items });
  } catch (error) {
    console.error("Checked-in-today error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
