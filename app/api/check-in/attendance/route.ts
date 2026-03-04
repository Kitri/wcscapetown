import { NextResponse } from "next/server";
import { appendToSheet, getSheetValues } from "@/lib/googleSheets";
import { formatZaDateISO, formatZaMonthYear, parseZaDateISO } from "@/lib/zaDate";
import {
  CHECKIN_EVENT_NAME,
  CHECKIN_SPREADSHEET_ID,
} from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const id = Number(digits);
  return Number.isFinite(id) ? id : NaN;
}

async function lookupMemberFullName(member_id: number): Promise<string> {
  // Only need id + first_name + surname
  const rows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "All_members!A:C");
  for (const row of rows) {
    const firstCell = (row[0] ?? "").trim().toLowerCase();
    if (!firstCell || firstCell === "member_id") continue;

    const id = parseMemberId(row[0] ?? "");
    if (!Number.isFinite(id) || id !== member_id) continue;

    const firstName = (row[1] ?? "").trim();
    const surname = (row[2] ?? "").trim();
    return `${firstName} ${surname}`.trim();
  }

  return "";
}

function isMonthlyType(type: string): boolean {
  return (type ?? "").trim().toLowerCase().includes("monthly");
}

function normalizeBoolCell(v: boolean): string {
  return v ? "TRUE" : "";
}

type Payload = {
  member_id?: number;
  type?: string;
  paid_via?: "Cash" | "Yoco" | "" | "Override";
  paid_amount?: number;
  comment?: string;
  free_entry_reason?: string;
  date?: string; // YYYY-MM-DD (Cape Town)
  event?: string;
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

    const dateISOParam = (body.date ?? "").trim();
    const date = dateISOParam ? parseZaDateISO(dateISOParam) : null;

    if (dateISOParam && !date) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const event = (body.event ?? "").trim() || CHECKIN_EVENT_NAME;
    if (event.length > 80) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const today = dateISOParam || formatZaDateISO(date ?? undefined);

    // Append optional columns: comment (G) + free_entry_reason (H)
    await appendToSheet(CHECKIN_SPREADSHEET_ID, "Attendance!A:H", [
      [
        member_id,
        today,
        event,
        paid_via,
        paid_amount,
        type,
        comment,
        free_entry_reason,
      ],
    ]);

    // If they PAID for a monthly pass, add them to Free Entry for the month.
    // (Do not do this when they are just signing in with existing free entry.)
    const paidForMonthly =
      isMonthlyType(type) &&
      paid_amount > 0 &&
      (paid_via === "Cash" || paid_via === "Yoco") &&
      !free_entry_reason;

    let free_entry_added = false;
    let free_entry_error: string | undefined;

    if (paidForMonthly) {
      try {
        const eventLower = event.toLowerCase();
        const isMonday =
          eventLower.includes("monday") && eventLower.includes("plumstead");
        const isTuesday =
          eventLower.includes("tuesday") && eventLower.includes("pinelands");

        // Only add monthly passes for Monday/Tuesday events.
        if (!isMonday && !isTuesday) {
          free_entry_error = "Monthly free entry is only supported for Monday or Tuesday events.";
        } else {
          const monthYear = formatZaMonthYear(date ?? undefined);
          const fullName = await lookupMemberFullName(member_id);

          // Avoid duplicates: if the row already exists for this month + event, don't add again.
          const existing = await getSheetValues(
            CHECKIN_SPREADSHEET_ID,
            "'Free Entry'!A:I"
          );

          let alreadyExists = false;
          for (const row of existing) {
            const firstCell = (row[0] ?? "").trim().toLowerCase();
            if (!firstCell || firstCell === "member_id") continue;

            const id = parseMemberId(row[0] ?? "");
            if (!Number.isFinite(id) || id !== member_id) continue;

            const entryType = (row[2] ?? "").trim().toLowerCase();
            const applicable = (row[3] ?? "").trim();

            const mondayCell = (row[6] ?? "").trim().toLowerCase();
            const tuesdayCell = (row[7] ?? "").trim().toLowerCase();
            const monday =
              mondayCell === "true" || mondayCell === "yes" || mondayCell === "1";
            const tuesday =
              tuesdayCell === "true" ||
              tuesdayCell === "yes" ||
              tuesdayCell === "1";

            if (
              entryType === "monthly" &&
              applicable === monthYear &&
              monday === isMonday &&
              tuesday === isTuesday
            ) {
              alreadyExists = true;
              break;
            }
          }

          if (!alreadyExists) {
            await appendToSheet(CHECKIN_SPREADSHEET_ID, "'Free Entry'!A:I", [
              [
                member_id,
                fullName,
                "monthly",
                monthYear,
                "Member has paid for the month, they can just sign in",
                "monthly",
                normalizeBoolCell(isMonday),
                normalizeBoolCell(isTuesday),
                "", // Social column
              ],
            ]);
            free_entry_added = true;
          }
        }
      } catch (e) {
        console.error("Monthly free entry append error:", e);
        free_entry_error = e instanceof Error ? e.message : "Failed";
      }
    }

    return NextResponse.json({ ok: true, free_entry_added, free_entry_error });
  } catch (error) {
    console.error("Attendance append error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
