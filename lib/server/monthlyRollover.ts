import { ATT_COL } from "@/lib/server/attendanceColumns";

// A teacher / door volunteer who has paid for the month is still free that day, but
// the day is recorded in Attendance with this reason prefix so it can be credited
// against their NEXT monthly purchase.
export const ROLLOVER_REASON_PREFIX = "monthly rollover:";

// free_entry_reason is used for analysis, so spending credit on a day entry always
// writes this exact value. The amount lives in the comment (notes) column, e.g.
// "Rollover credit used: R37.50 (from 1 day volunteered)".
export const CREDIT_USED_REASON = "rollover_credit";

function parseCreditUsed(comment: string): number {
  const m = (comment ?? "").match(/rollover credit used:?\s*R?\s*(\d+(?:\.\d+)?)/i);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export type RolloverCredit = {
  // Days taught / volunteered while on a monthly pass (usable on the next pass or
  // a Standard / Student / Pensioner day entry).
  teacherClasses: number;
  volunteerClasses: number;
  // Rand already spent on day entries since the last monthly purchase.
  creditUsed: number;
  // Days taught / volunteered earlier THIS MONTH without a pass. Only counts when
  // buying a monthly pass later in the same month.
  earlierThisMonth: { teacherClasses: number; volunteerClasses: number };
};

function isMonthlyPurchaseRow(row: string[]): boolean {
  const type = (row[ATT_COL.type] ?? "").trim().toLowerCase();
  const reason = (row[ATT_COL.reason] ?? "").trim().toLowerCase();
  // A purchase is a monthly-type row with no free-entry reason, or with the fixed
  // rollover_credit reason when credit was applied to it. Later check-ins on the
  // pass are written with reason "monthly" and are not purchases.
  return type.includes("monthly") && (!reason || reason === CREDIT_USED_REASON);
}

/**
 * Teacher / volunteer classes worked on a monthly pass since the member's last
 * monthly purchase. Buying a new pass starts a fresh window, so a credit is used
 * exactly once. Rows are read in sheet order (oldest first).
 *
 * Teaching / volunteering days earlier in the same calendar month as `todayISO`,
 * when the member was not on a pass, are returned separately so they can be
 * credited if the member then buys a monthly pass.
 */
export function countRolloverClasses(
  attendanceRows: string[][],
  memberId: number,
  parseMemberId: (raw: string) => number,
  todayISO: string
): RolloverCredit {
  let teacherClasses = 0;
  let volunteerClasses = 0;
  let creditUsed = 0;
  let earlierTeacher = 0;
  let earlierVolunteer = 0;
  const thisMonth = todayISO.slice(0, 7);

  for (const row of attendanceRows) {
    const firstCell = (row[ATT_COL.memberId] ?? "").trim().toLowerCase();
    if (!firstCell || firstCell === "member_id") continue;
    if (parseMemberId(row[ATT_COL.memberId] ?? "") !== memberId) continue;

    if (isMonthlyPurchaseRow(row)) {
      teacherClasses = 0;
      volunteerClasses = 0;
      creditUsed = 0;
      earlierTeacher = 0;
      earlierVolunteer = 0;
      continue;
    }

    const reason = (row[ATT_COL.reason] ?? "").trim().toLowerCase();
    if (reason === CREDIT_USED_REASON) {
      creditUsed += parseCreditUsed(row[ATT_COL.comment] ?? "");
      continue;
    }
    if (!reason.startsWith(ROLLOVER_REASON_PREFIX)) {
      // A teaching / door volunteer day without a pass: earlier this month only.
      const dateCell = (row[ATT_COL.date] ?? "").trim();
      const eventCell = (row[ATT_COL.event] ?? "").trim().toLowerCase();
      if (!dateCell.startsWith(thisMonth) || !eventCell.includes("monday")) continue;

      const what = `${row[ATT_COL.type] ?? ""} ${reason}`.toLowerCase();
      if (what.includes("teach")) earlierTeacher += 1;
      else if (what.includes("welcoming committee") || what.includes("door volunteer")) {
        earlierVolunteer += 1;
      }
      continue;
    }

    if (reason.includes("teacher")) teacherClasses += 1;
    else if (reason.includes("welcoming committee")) volunteerClasses += 1;
  }

  return {
    teacherClasses,
    volunteerClasses,
    creditUsed,
    earlierThisMonth: { teacherClasses: earlierTeacher, volunteerClasses: earlierVolunteer },
  };
}
