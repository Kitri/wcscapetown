import { ATT_COL } from "@/lib/server/attendanceColumns";
import {
  CREDIT_USED_REASON,
  ROLLOVER_START_ISO,
  SessionCredit,
  parseCreditUsed,
  parseIncludedSessions,
  parseSessionReason,
} from "@/lib/sessionCredit";

export {
  CREDIT_USED_REASON,
  INCLUDED_REASON_PREFIX,
  ROLLOVER_REASON_PREFIX,
  ROLLOVER_START_ISO,
} from "@/lib/sessionCredit";

type ParseId = (raw: string) => number;

function isMonthlyPurchaseRow(row: string[]): boolean {
  const type = (row[ATT_COL.type] ?? "").trim().toLowerCase();
  const reason = (row[ATT_COL.reason] ?? "").trim().toLowerCase();
  // A purchase is a monthly-type row with no free-entry reason, or with the fixed
  // rollover_credit reason when a discount was applied. Later check-ins on the pass
  // are written with reason "monthly" and are not purchases.
  return type.includes("monthly") && (!reason || reason === CREDIT_USED_REASON);
}

/** This member's Attendance rows since ROLLOVER_START_ISO, oldest first. */
function memberRows(rows: string[][], memberId: number, parseMemberId: ParseId): string[][] {
  return rows.filter((row) => {
    const first = (row[ATT_COL.memberId] ?? "").trim().toLowerCase();
    if (!first || first === "member_id") return false;
    if (parseMemberId(row[ATT_COL.memberId] ?? "") !== memberId) return false;
    const date = (row[ATT_COL.date] ?? "").trim();
    return /^\d{4}-\d{2}-\d{2}/.test(date) && date >= ROLLOVER_START_ISO;
  });
}

const isMonday = (row: string[]) =>
  (row[ATT_COL.event] ?? "").trim().toLowerCase().includes("monday");

// A payer row for two people holds both amounts: only count the payer's share.
function ownAmount(row: string[]): number {
  const amt = Number((row[ATT_COL.amount] ?? "").toString().replace(/[^\d.]/g, ""));
  if (!Number.isFinite(amt) || amt <= 0) return 0;
  const cmt = (row[ATT_COL.comment] ?? "").trim();
  if (!/(^|\s-\s)paid for\s/i.test(cmt)) return amt;
  const share = cmt.match(/partner share R(\d+(?:\.\d+)?)/i);
  return share ? amt - Number(share[1]) : amt / 2;
}

/**
 * Volunteer / teaching credit since the member's last monthly purchase. Buying a
 * pass starts a fresh window, so every credit is used exactly once.
 */
export function countSessionCredit(
  attendanceRows: string[][],
  memberId: number,
  parseMemberId: ParseId,
  todayISO: string
): SessionCredit {
  const thisMonth = todayISO.slice(0, 7);
  const c = {
    rollover: { volunteer: 0, teaching: 0 },
    creditUsedSessions: 0,
    creditUsedLegacyRand: 0,
    earlierThisMonth: { volunteer: 0, teaching: 0 },
    paidEarlierThisMonth: 0,
  };

  for (const row of memberRows(attendanceRows, memberId, parseMemberId)) {
    if (isMonthlyPurchaseRow(row)) {
      c.rollover = { volunteer: 0, teaching: 0 };
      c.creditUsedSessions = 0;
      c.creditUsedLegacyRand = 0;
      c.earlierThisMonth = { volunteer: 0, teaching: 0 };
      c.paidEarlierThisMonth = 0;
      continue;
    }

    const inThisMonth = (row[ATT_COL.date] ?? "").trim().startsWith(thisMonth);
    if (inThisMonth && isMonday(row)) c.paidEarlierThisMonth += ownAmount(row);

    const reason = (row[ATT_COL.reason] ?? "").trim().toLowerCase();
    if (reason === CREDIT_USED_REASON) {
      const used = parseCreditUsed(row[ATT_COL.comment] ?? "");
      c.creditUsedSessions += used.sessions;
      c.creditUsedLegacyRand += used.legacyRand;
      continue;
    }

    const session = parseSessionReason(reason, row[ATT_COL.type] ?? "");
    if (!session) continue;
    if (session.status === "rollover") {
      c.rollover[session.kind] += 1;
    } else if (session.status === "free" && inThisMonth && isMonday(row)) {
      c.earlierThisMonth[session.kind] += 1;
    }
    // "included" sessions were already deducted from the pass price: no credit.
  }

  c.paidEarlierThisMonth = Math.round(c.paidEarlierThisMonth * 100) / 100;
  return c;
}

/**
 * Sessions that the member's pass for this month already paid for (they were
 * assigned in advance and deducted at purchase) and that have not been worked yet.
 * While this is above zero, a session on the pass is recorded as "included"
 * instead of earning rollover credit.
 */
export function includedSessionsRemaining(
  attendanceRows: string[][],
  memberId: number,
  parseMemberId: ParseId,
  todayISO: string
): number {
  const thisMonth = todayISO.slice(0, 7);
  let included = 0;
  for (const row of memberRows(attendanceRows, memberId, parseMemberId)) {
    if (isMonthlyPurchaseRow(row)) {
      const inMonth = (row[ATT_COL.date] ?? "").trim().startsWith(thisMonth);
      included = inMonth ? parseIncludedSessions(row[ATT_COL.comment] ?? "") : 0;
      continue;
    }
    const s = parseSessionReason(row[ATT_COL.reason] ?? "", row[ATT_COL.type] ?? "");
    if (s?.status === "included") included -= 1;
  }
  return Math.max(0, included);
}
