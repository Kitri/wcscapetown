import { NextResponse } from "next/server";
import { appendToSheet, getSheetValues } from "@/lib/googleSheets";
import { formatZaDateISO, formatZaMonthYear, parseZaDateISO } from "@/lib/zaDate";
import {
  CHECKIN_EVENT_NAME,
  CHECKIN_SPREADSHEET_ID,
} from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";
import { ATT_COL, ATTENDANCE_RANGE } from "@/lib/server/attendanceColumns";

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

type Payload = {
  member_id?: number;
  type?: string;
  paid_via?: "Cash" | "Yoco" | "" | "Override";
  paid_amount?: number;
  comment?: string;
  free_entry_reason?: string;
  date?: string; // YYYY-MM-DD (Cape Town)
  event?: string;
  // Optional: one payment covering a second person. paid_amount is the
  // per-person amount; the payer's row records 2 x paid_amount.
  paid_for_member_id?: number;
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

    const paidForRaw = body.paid_for_member_id;
    const hasPaidFor =
      paidForRaw !== undefined && paidForRaw !== null && String(paidForRaw) !== "";
    const paid_for_member_id = hasPaidFor ? Number(paidForRaw) : NaN;

    if (hasPaidFor) {
      if (!Number.isFinite(paid_for_member_id)) {
        return NextResponse.json({ error: "Invalid paid_for_member_id" }, { status: 400 });
      }
      if (paid_for_member_id === member_id) {
        return NextResponse.json(
          { error: "Cannot pay for yourself" },
          { status: 400 }
        );
      }
      if (isMonthlyType(type)) {
        return NextResponse.json(
          { error: "Paying for 2 is not supported for monthly passes" },
          { status: 400 }
        );
      }

      // The second person must exist and must not already be checked in.
      const existing = await getSheetValues(CHECKIN_SPREADSHEET_ID, "Attendance!A:D");
      for (const row of existing) {
        const firstCell = (row[0] ?? "").trim().toLowerCase();
        if (!firstCell || firstCell === "member_id") continue;
        if (
          parseMemberId(row[0] ?? "") === paid_for_member_id &&
          (row[ATT_COL.date] ?? "").trim() === today &&
          (row[ATT_COL.event] ?? "").trim() === event
        ) {
          return NextResponse.json(
            { error: `Member ${paid_for_member_id} is already checked in` },
            { status: 409 }
          );
        }
      }
      const partnerName = await lookupMemberFullName(paid_for_member_id);
      if (!partnerName) {
        return NextResponse.json({ error: "Second member not found" }, { status: 400 });
      }
    }

    if (hasPaidFor) {
      // One row per attendee, but the payer's row carries the full payment so
      // it matches the single Yoco transaction. The second row is R0.
      const payerComment = [comment, `paid for ${paid_for_member_id}`]
        .filter(Boolean)
        .join(" - ");
      const partnerType = type.toLowerCase() === "practice" ? type : "Standard entry";
      await appendToSheet(CHECKIN_SPREADSHEET_ID, ATTENDANCE_RANGE, [
        [
          member_id,
          null, // column B: name lookup
          today,
          event,
          paid_via,
          paid_amount * 2,
          type,
          payerComment,
          free_entry_reason,
        ],
        [
          paid_for_member_id,
          null,
          today,
          event,
          "",
          0,
          partnerType,
          `paid by ${member_id}`,
          "",
        ],
      ]);
      return NextResponse.json({ ok: true, free_entry_added: false });
    }

    // Column B is a name lookup in the sheet, so it is skipped (null).
    // Columns: C date, D event, E paid_via, F amount, G type, H comment, I free_entry_reason
    await appendToSheet(CHECKIN_SPREADSHEET_ID, ATTENDANCE_RANGE, [
      [
        member_id,
        null,
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

        // Only add monthly passes for Monday events.
        if (!isMonday) {
          free_entry_error = "Monthly free entry is only supported for Monday events.";
        } else {
          const monthYear = formatZaMonthYear(date ?? undefined);

          // Avoid duplicates: if the row already exists for this month, don't add again.
          const existing = await getSheetValues(
            CHECKIN_SPREADSHEET_ID,
            "'Free Entry'!A:F"
          );

          let alreadyExists = false;
          for (const row of existing) {
            const firstCell = (row[0] ?? "").trim().toLowerCase();
            if (!firstCell || firstCell === "member_id") continue;

            const id = parseMemberId(row[0] ?? "");
            if (!Number.isFinite(id) || id !== member_id) continue;

            const entryType = (row[2] ?? "").trim().toLowerCase();
            const applicable = (row[3] ?? "").trim();

            if (entryType === "monthly" && applicable === monthYear) {
              alreadyExists = true;
              break;
            }
          }

          if (!alreadyExists) {
            // Column B (full name) is a lookup formula in the sheet; leave it untouched.
            await appendToSheet(CHECKIN_SPREADSHEET_ID, "'Free Entry'!A:F", [
              [
                member_id,
                null,
                "monthly",
                monthYear,
                "Member has paid for the month, they can just sign in",
                "monthly",
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
