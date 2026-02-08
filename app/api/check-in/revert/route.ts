import { NextResponse } from "next/server";
import {
  appendToSheet,
  deleteSheetRowByNumber,
  getSheetValues,
} from "@/lib/googleSheets";
import { parseZaDateISO } from "@/lib/zaDate";
import { CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

type Payload = {
  member_id?: number;
  date?: string; // YYYY-MM-DD
  event?: string;
  revert_reason?: string;
  rowNumber?: number; // 1-based row number in Attendance
};

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const id = Number(digits);
  return Number.isFinite(id) ? id : NaN;
}

export async function POST(request: Request) {
  try {
    if (!(await isCheckinAuthed())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Payload;
    const member_id = Number(body.member_id);
    if (!Number.isFinite(member_id)) {
      return NextResponse.json({ error: "Invalid member_id" }, { status: 400 });
    }

    const dateISO = (body.date ?? "").trim();
    if (!dateISO || !parseZaDateISO(dateISO)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const event = (body.event ?? "").trim();
    if (!event) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const revert_reason = (body.revert_reason ?? "").trim();
    if (!revert_reason) {
      return NextResponse.json({ error: "Revert reason is required" }, { status: 400 });
    }

    const attendanceRows = await getSheetValues(
      CHECKIN_SPREADSHEET_ID,
      "Attendance!A:H"
    );

    let matchRow: string[] | null = null;
    let matchRowNumber = 0;

    const requestedRowNumber =
      body.rowNumber !== undefined ? Number(body.rowNumber) : NaN;

    if (Number.isFinite(requestedRowNumber) && requestedRowNumber >= 1) {
      const idx = requestedRowNumber - 1;
      const row = attendanceRows[idx];
      if (!row) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (!firstCell || firstCell === "member_id") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const id = parseMemberId(row[0] ?? "");
      const dateCell = (row[1] ?? "").trim();
      const eventCell = (row[2] ?? "").trim();

      if (id !== member_id || dateCell !== dateISO || eventCell !== event) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      matchRow = row;
      matchRowNumber = requestedRowNumber;
    } else {
      for (let i = 0; i < attendanceRows.length; i++) {
        const row = attendanceRows[i] ?? [];
        const firstCell = (row[0] ?? "").trim().toLowerCase();
        if (!firstCell || firstCell === "member_id") continue;

        const id = parseMemberId(row[0] ?? "");
        const dateCell = (row[1] ?? "").trim();
        const eventCell = (row[2] ?? "").trim();

        if (id === member_id && dateCell === dateISO && eventCell === event) {
          matchRow = row;
          matchRowNumber = i + 1; // 1-based
        }
      }

      if (!matchRow || !matchRowNumber) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    // Move to "Check in reverted" sheet.
    await appendToSheet(CHECKIN_SPREADSHEET_ID, "'Check in reverted'!A:I", [
      [...matchRow.slice(0, 8), revert_reason],
    ]);

    // Remove from Attendance sheet.
    await deleteSheetRowByNumber(
      CHECKIN_SPREADSHEET_ID,
      "Attendance",
      matchRowNumber
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Check-in revert error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
