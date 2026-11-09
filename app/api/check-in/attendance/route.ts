import { NextResponse } from "next/server";
import { appendToSheet, getSheetValues } from "@/lib/googleSheets";
import { formatZaDateISO, formatZaMonthYear, parseZaDateISO } from "@/lib/zaDate";
import {
  CHECKIN_EVENT_NAME,
  CHECKIN_SPREADSHEET_ID,
} from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";
import { ATT_COL, ATTENDANCE_RANGE } from "@/lib/server/attendanceColumns";
import { formatZaTimestamp } from "@/lib/server/timestamp";
import {
  CREDIT_USED_REASON,
  SESSION_ROLES,
  SessionRole,
  includedSessionsNote,
} from "@/lib/sessionCredit";

const SESSION_ROLE_VALUES = Object.values(SESSION_ROLES) as string[];

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

const FREE_ENTRY_RANGE = "'Free Entry'!A:F";

// Does this member already have the "monthly" Free Entry row for the month?
function hasMonthlyFreeEntry(rows: string[][], memberId: number, monthYear: string): boolean {
  return rows.some((row) => {
    const firstCell = (row[0] ?? "").trim().toLowerCase();
    if (!firstCell || firstCell === "member_id") return false;
    return (
      parseMemberId(row[0] ?? "") === memberId &&
      (row[2] ?? "").trim().toLowerCase() === "monthly" &&
      (row[3] ?? "").trim() === monthYear
    );
  });
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
  // With paid_for_member_id: what the second person's own entry costs and its type
  // (a student / pensioner partner pays a different price). Default: same as payer.
  partner_amount?: number;
  partner_type?: string;
  // Monthly for two: the second person's own discount details (their pass row).
  partner_comment?: string;
  partner_free_entry_reason?: string;
  partner_included_sessions?: number;
  // Buying a monthly pass on a night the member volunteers / teaches: a free
  // session row is written just before the purchase row, so tonight counts as an
  // "earlier this month" session already priced into the pass.
  tonight_session?: SessionRole;
  // Deprecated alias for tonight_session: "welcoming committee".
  also_volunteer?: boolean;
  // Monthly purchase: how many sessions still to come this month were deducted
  // from the price. Recorded in the comment so they earn no further credit.
  included_sessions?: number;
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
      // Buying two monthly passes: the second person must not already have one.
      if (isMonthlyType(type)) {
        const monthYear = formatZaMonthYear(date ?? undefined);
        const freeEntryRows = await getSheetValues(CHECKIN_SPREADSHEET_ID, FREE_ENTRY_RANGE);
        if (hasMonthlyFreeEntry(freeEntryRows, paid_for_member_id, monthYear)) {
          return NextResponse.json(
            { error: `Member ${paid_for_member_id} already has a monthly pass for ${monthYear}` },
            { status: 409 }
          );
        }
      }
    }

    const timestamp = formatZaTimestamp();

    const tonightSession: SessionRole | null = SESSION_ROLE_VALUES.includes(
      String(body.tonight_session ?? "")
    )
      ? (body.tonight_session as SessionRole)
      : body.also_volunteer === true
        ? SESSION_ROLES.volunteer
        : null;

    if (tonightSession && isMonthlyType(type) && event.toLowerCase().includes("monday")) {
      // Written BEFORE the purchase row: tonight is already in this pass's price, and
      // the purchase resets the credit window so it is not credited again.
      await appendToSheet(CHECKIN_SPREADSHEET_ID, ATTENDANCE_RANGE, [
        [
          member_id,
          null,
          today,
          event,
          "",
          0,
          tonightSession === SESSION_ROLES.volunteer ? "Welcoming committee" : "Teacher",
          "Free entry, counted in this month's pass price",
          tonightSession,
          timestamp,
        ],
      ]);
    }

    const includedSessions = Math.max(0, Math.floor(Number(body.included_sessions ?? 0)) || 0);
    const rowComment =
      isMonthlyType(type) && includedSessions > 0
        ? [comment, includedSessionsNote(includedSessions)].filter(Boolean).join(" - ")
        : comment;

    if (hasPaidFor) {
      // One row per attendee, but the payer's row carries the full payment so
      // it matches the single Yoco transaction. The second row is R0.
      // Buying a monthly pass for two: the second person gets their own monthly
      // type (student / pensioner / standard) and their own pass row.
      const payerMonthly = isMonthlyType(type);
      // The second person's own volunteer / teaching discount on their pass.
      const partnerIncluded = Math.max(
        0,
        Math.floor(Number(body.partner_included_sessions ?? 0)) || 0
      );
      const allowedPartnerTypes = payerMonthly
        ? ["Monthly", "Student monthly", "Pensioner monthly"]
        : ["Standard entry", "Student", "Pensioner", "Practice", "Social only"];
      const requestedPartnerType = (body.partner_type ?? "").trim();
      const partnerType =
        allowedPartnerTypes.find((t) => t.toLowerCase() === requestedPartnerType.toLowerCase()) ??
        (payerMonthly ? "Monthly" : type.toLowerCase() === "practice" ? type : "Standard entry");
      const partnerAmountRaw = Number(body.partner_amount);
      const partnerAmount =
        body.partner_amount !== undefined && Number.isFinite(partnerAmountRaw) && partnerAmountRaw >= 0
          ? partnerAmountRaw
          : paid_amount;
      // Comment keeps "paid for <id>"; the partner's share is only added when it
      // differs from the payer's, so the payer's own share can be worked out later.
      const payerComment = [
        rowComment,
        `paid for ${paid_for_member_id}`,
        partnerAmount !== paid_amount ? `partner share R${partnerAmount}` : "",
      ]
        .filter(Boolean)
        .join(" - ");
      await appendToSheet(CHECKIN_SPREADSHEET_ID, ATTENDANCE_RANGE, [
        [
          member_id,
          null, // column B: name lookup
          today,
          event,
          paid_via,
          paid_amount + partnerAmount,
          type,
          payerComment,
          free_entry_reason,
          timestamp,
        ],
        [
          paid_for_member_id,
          null,
          today,
          event,
          "",
          0,
          partnerType,
          [
            `paid by ${member_id}`,
            payerMonthly ? (body.partner_comment ?? "").trim() : "",
            payerMonthly && partnerIncluded > 0 ? includedSessionsNote(partnerIncluded) : "",
          ]
            .filter(Boolean)
            .join(" - "),
          payerMonthly && body.partner_free_entry_reason === CREDIT_USED_REASON
            ? CREDIT_USED_REASON
            : "",
          timestamp,
        ],
      ]);
    } else {
      // Column B is a name lookup in the sheet, so it is skipped (null).
      // Columns: C date, D event, E paid_via, F amount, G type, H comment, I free_entry_reason, J timestamp
      await appendToSheet(CHECKIN_SPREADSHEET_ID, ATTENDANCE_RANGE, [
        [
          member_id,
          null,
          today,
          event,
          paid_via,
          paid_amount,
          type,
          rowComment,
          free_entry_reason,
          timestamp,
        ],
      ]);
    }

    // If they PAID for a monthly pass, add them (and the person they paid for) to
    // Free Entry for the month. (Not when just signing in with existing free entry.)
    // A pass fully covered by volunteer / teaching credit costs R0 and has no
    // payment method, but is still a purchase.
    const paidForMonthly =
      isMonthlyType(type) &&
      paid_amount >= 0 &&
      (paid_via === "Cash" || paid_via === "Yoco" || free_entry_reason === CREDIT_USED_REASON) &&
      (!free_entry_reason || free_entry_reason === CREDIT_USED_REASON);

    let free_entry_added = false;
    let partner_free_entry_added = false;
    let free_entry_error: string | undefined;

    if (paidForMonthly) {
      const eventLower = event.toLowerCase();
      // Only add monthly passes for Monday events.
      if (!(eventLower.includes("monday") && eventLower.includes("plumstead"))) {
        free_entry_error = "Monthly free entry is only supported for Monday events.";
      } else {
        try {
          const monthYear = formatZaMonthYear(date ?? undefined);
          const existing = await getSheetValues(CHECKIN_SPREADSHEET_ID, FREE_ENTRY_RANGE);
          // Avoid duplicates: skip anyone who already has the row for this month.
          const ids = (hasPaidFor ? [member_id, paid_for_member_id] : [member_id]).filter(
            (id) => !hasMonthlyFreeEntry(existing, id, monthYear)
          );
          if (ids.length > 0) {
            // Column B (full name) is a lookup formula in the sheet; leave it untouched.
            await appendToSheet(
              CHECKIN_SPREADSHEET_ID,
              FREE_ENTRY_RANGE,
              ids.map((id) => [
                id,
                null,
                "monthly",
                monthYear,
                "Member has paid for the month, they can just sign in",
                "monthly",
              ])
            );
          }
          free_entry_added = ids.includes(member_id);
          partner_free_entry_added = hasPaidFor && ids.includes(paid_for_member_id);
        } catch (e) {
          console.error("Monthly free entry append error:", e);
          free_entry_error = e instanceof Error ? e.message : "Failed";
        }
      }
    }

    return NextResponse.json({
      ok: true,
      free_entry_added,
      ...(hasPaidFor ? { partner_free_entry_added } : {}),
      free_entry_error,
    });

  } catch (error) {
    console.error("Attendance append error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
