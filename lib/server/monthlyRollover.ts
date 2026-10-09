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
  teacherClasses: number;
  volunteerClasses: number;
  // Rand already spent on day entries since the last monthly purchase.
  creditUsed: number;
};

function isMonthlyPurchaseRow(row: string[]): boolean {
  const type = (row[ATT_COL.type] ?? "").trim().toLowerCase();
  const reason = (row[ATT_COL.reason] ?? "").trim();
  // A purchase is a monthly-type row with no free-entry reason. Later check-ins on
  // the pass are written with reason "monthly" and are not purchases.
  return type.includes("monthly") && !reason;
}

/**
 * Teacher / volunteer classes worked on a monthly pass since the member's last
 * monthly purchase. Buying a new pass starts a fresh window, so a credit is used
 * exactly once. Rows are read in sheet order (oldest first).
 */
export function countRolloverClasses(
  attendanceRows: string[][],
  memberId: number,
  parseMemberId: (raw: string) => number
): RolloverCredit {
  let teacherClasses = 0;
  let volunteerClasses = 0;
  let creditUsed = 0;

  for (const row of attendanceRows) {
    const firstCell = (row[ATT_COL.memberId] ?? "").trim().toLowerCase();
    if (!firstCell || firstCell === "member_id") continue;
    if (parseMemberId(row[ATT_COL.memberId] ?? "") !== memberId) continue;

    if (isMonthlyPurchaseRow(row)) {
      teacherClasses = 0;
      volunteerClasses = 0;
      creditUsed = 0;
      continue;
    }

    const reason = (row[ATT_COL.reason] ?? "").trim().toLowerCase();
    if (reason === CREDIT_USED_REASON) {
      creditUsed += parseCreditUsed(row[ATT_COL.comment] ?? "");
      continue;
    }
    if (!reason.startsWith(ROLLOVER_REASON_PREFIX)) continue;

    if (reason.includes("teacher")) teacherClasses += 1;
    else if (reason.includes("welcoming committee")) volunteerClasses += 1;
  }

  return { teacherClasses, volunteerClasses, creditUsed };
}
