import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";
import { formatZaDateISO } from "@/lib/zaDate";
import {
  CHECKIN_EVENT_NAME,
  CHECKIN_SPREADSHEET_ID,
} from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

type Payload = {
  member_id?: number;
  type?: string;
  paid_via?: "Cash" | "Yoco" | "" | "Override";
  paid_amount?: number;
  comment?: string;
  free_entry_reason?: string;
};

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

    const type = (body.type ?? "").trim();
    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const paid_via = (body.paid_via ?? "").trim();
    const paid_amount = Number(body.paid_amount ?? 0);
    const comment = (body.comment ?? "").trim();
    const free_entry_reason = (body.free_entry_reason ?? "").trim();

    const today = formatZaDateISO();

    // Append optional columns: comment (G) + free_entry_reason (H)
    await appendToSheet(CHECKIN_SPREADSHEET_ID, "Attendance!A:H", [
      [
        member_id,
        today,
        CHECKIN_EVENT_NAME,
        paid_via,
        paid_amount,
        type,
        comment,
        free_entry_reason,
      ],
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Attendance append error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
