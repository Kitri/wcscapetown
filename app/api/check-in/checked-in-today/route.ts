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

type Item = {
  member_id: number;
  full_name: string;
  type: string;
  paid_via: string;
  paid_amount: number;
  comment: string;
};

export async function GET() {
  try {
    if (!(await isCheckinAuthed())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = formatZaDateISO();

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

    // Attendance: A member_id, B date, D paid_via, E amount, F type, G comment
    const attendanceRows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "Attendance!A:G");

    const items: Item[] = [];
    for (const row of attendanceRows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (!firstCell || firstCell === "member_id") continue;

      const id = parseMemberId(row[0] ?? "");
      const date = (row[1] ?? "").trim();
      if (!Number.isFinite(id) || date !== today) continue;

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
      });
    }

    return NextResponse.json({ today, items });
  } catch (error) {
    console.error("Checked-in-today error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
