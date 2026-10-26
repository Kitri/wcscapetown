// Free-entry sessions (door volunteer / welcoming committee and teaching) and the
// credit they earn. Shared by the check-in API and the check-in screen so the rules
// live in exactly one place. See docs/check-in-rules.md.
//
// The rule is the same for both roles:
//   * A volunteer / teaching session is always free entry.
//   * Every session is worth ONE class. A monthly pass counts as 4 classes, so each
//     session takes (monthly price / 4) off a monthly pass, or covers one whole day
//     entry (Standard / Student / Pensioner).
//   * Which price the session comes off depends on when it happens:
//       - before buying a pass this month   -> off this month's pass, if bought later
//       - assigned for later this month     -> off this month's pass, when bought
//       - while already on a pass           -> rolls over to the next entry / pass

export type SessionKind = "volunteer" | "teaching";

// Values written to free_entry_reason (Attendance column I) for a session.
export const SESSION_ROLES = {
  volunteer: "welcoming committee",
  teacher: "teacher",
  newcomerTeacher: "newcomer teacher",
} as const;
export type SessionRole = (typeof SESSION_ROLES)[keyof typeof SESSION_ROLES];

// Prefixes on free_entry_reason for sessions worked while on a monthly pass.
//   rollover: not in the pass price -> credit for the next entry / pass
//   included: already deducted from this month's pass price -> no further credit
export const ROLLOVER_REASON_PREFIX = "monthly rollover:";
export const INCLUDED_REASON_PREFIX = "monthly included:";

// free_entry_reason whenever session credit (or money already paid this month) is
// applied to an entry. The details are in the comment column.
export const CREDIT_USED_REASON = "rollover_credit";

// Session credit is tracked from this date. Earlier attendance was settled manually.
export const ROLLOVER_START_ISO = "2026-10-01";

export const CLASSES_PER_MONTH = 4;

export type SessionStatus = "free" | "rollover" | "included";

export function sessionKindOfRole(role: SessionRole): SessionKind {
  return role === SESSION_ROLES.volunteer ? "volunteer" : "teaching";
}

/** free_entry_reason for a session, given the member's pass state that night. */
export function sessionReason(
  role: SessionRole,
  pass: { onMonthlyPass: boolean; includedRemaining: number }
): string {
  if (!pass.onMonthlyPass) return role;
  return pass.includedRemaining > 0
    ? `${INCLUDED_REASON_PREFIX} ${role}`
    : `${ROLLOVER_REASON_PREFIX} ${role}`;
}

/**
 * Read a free_entry_reason (and entry type) back into a session. Returns null for
 * rows that are not volunteer / teaching sessions. Also understands the older
 * "door volunteer" wording.
 */
export function parseSessionReason(
  reasonRaw: string,
  typeRaw = ""
): { kind: SessionKind; status: SessionStatus; role: SessionRole } | null {
  const reason = (reasonRaw ?? "").trim().toLowerCase();
  const type = (typeRaw ?? "").trim().toLowerCase();

  let status: SessionStatus = "free";
  let rest = reason;
  if (reason.startsWith(ROLLOVER_REASON_PREFIX)) {
    status = "rollover";
    rest = reason.slice(ROLLOVER_REASON_PREFIX.length).trim();
  } else if (reason.startsWith(INCLUDED_REASON_PREFIX)) {
    status = "included";
    rest = reason.slice(INCLUDED_REASON_PREFIX.length).trim();
  }

  const what = status === "free" ? `${type} ${rest}` : rest;
  if (what.includes("newcomer teacher")) {
    return { kind: "teaching", status, role: SESSION_ROLES.newcomerTeacher };
  }
  if (what.includes("teach")) return { kind: "teaching", status, role: SESSION_ROLES.teacher };
  if (what.includes("welcoming committee") || what.includes("door volunteer")) {
    return { kind: "volunteer", status, role: SESSION_ROLES.volunteer };
  }
  return null;
}

// ---- comment notes ------------------------------------------------------------

const round2 = (n: number) => Math.round(n * 100) / 100;
const zar = (n: number) => `R${round2(n).toFixed(2)}`;
const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

/** "2 volunteer sessions" / "1 teaching slot". */
export function describeSessions(count: number, kind: SessionKind): string {
  return kind === "teaching"
    ? plural(count, "teaching slot")
    : plural(count, "volunteer session");
}

// Written on a monthly purchase: how many of this month's sessions that had NOT yet
// happened were deducted from the price. Those later sessions earn no further credit.
export function includedSessionsNote(count: number): string {
  return `Pass price includes ${plural(count, "upcoming session")}`;
}
export function parseIncludedSessions(comment: string): number {
  const m = (comment ?? "").match(/pass price includes\s+(\d+)\s+upcoming sessions?/i);
  return m ? Number(m[1]) : 0;
}

// Written on a day entry paid with rolled-over credit.
export function creditUsedNote(sessions: number, rand: number): string {
  return `Session credit used: ${plural(round2(sessions), "session")} (${zar(rand)})`;
}
/**
 * Credit spent, from a comment. New rows record sessions; rows written before
 * October 2026's change recorded rand ("Rollover credit used: R37.50").
 */
export function parseCreditUsed(comment: string): { sessions: number; legacyRand: number } {
  const c = comment ?? "";
  const s = c.match(/session credit used:\s*(\d+(?:\.\d+)?)\s*sessions?/i);
  if (s) return { sessions: Number(s[1]) || 0, legacyRand: 0 };
  const r = c.match(/rollover credit used:?\s*R?\s*(\d+(?:\.\d+)?)/i);
  const n = r ? Number(r[1]) : NaN;
  return { sessions: 0, legacyRand: Number.isFinite(n) && n > 0 ? n : 0 };
}

// ---- credit summary (built from Attendance on the server) -----------------------

export type SessionCount = { volunteer: number; teaching: number };
export const NO_SESSIONS: SessionCount = { volunteer: 0, teaching: 0 };
export const totalSessions = (c: SessionCount) => c.volunteer + c.teaching;

export type SessionCredit = {
  // Sessions worked while on a monthly pass since the last purchase (rollover).
  rollover: SessionCount;
  // Rollover credit already spent on day entries since the last purchase.
  creditUsedSessions: number;
  creditUsedLegacyRand: number;
  // Sessions earlier THIS calendar month without a pass (since the last purchase).
  // Only count towards a monthly pass bought later this month.
  earlierThisMonth: SessionCount;
  // Rand paid on Monday entries this month since the last purchase.
  paidEarlierThisMonth: number;
};
export const NO_CREDIT: SessionCredit = {
  rollover: NO_SESSIONS,
  creditUsedSessions: 0,
  creditUsedLegacyRand: 0,
  earlierThisMonth: NO_SESSIONS,
  paidEarlierThisMonth: 0,
};

/** Rollover sessions still unspent, valuing legacy rand at the given session price. */
export function remainingRolloverSessions(c: SessionCredit, sessionPrice: number): number {
  const legacy = sessionPrice > 0 ? c.creditUsedLegacyRand / sessionPrice : 0;
  return Math.max(0, totalSessions(c.rollover) - c.creditUsedSessions - legacy);
}

// ---- prices ---------------------------------------------------------------------

export type MonthlyPassPrice = {
  rolloverSessions: number; // rolled-over sessions applied
  thisMonthSessions: number; // this month's sessions applied
  sessionDiscount: number; // rand off for sessions
  paidEarlierDeduction: number; // rand already paid this month
  payable: number;
};

/**
 * Monthly pass: P - (P / 4) * sessions - money already paid this month, never
 * below zero. `thisMonthSessions` = earlier this month + tonight + upcoming
 * (or the operator's override). Unticking "use credit" charges the full price.
 */
export function monthlyPassPrice(i: {
  monthlyPrice: number;
  credit: SessionCredit;
  thisMonthSessions: number;
  useCredit: boolean;
}): MonthlyPassPrice {
  const P = Math.max(0, i.monthlyPrice);
  if (!i.useCredit) {
    return { rolloverSessions: 0, thisMonthSessions: 0, sessionDiscount: 0, paidEarlierDeduction: 0, payable: P };
  }
  const unit = P / CLASSES_PER_MONTH;
  const rolloverSessions = remainingRolloverSessions(i.credit, unit);
  const thisMonthSessions = Math.max(0, i.thisMonthSessions);
  const sessionDiscount = round2(Math.min(P, (rolloverSessions + thisMonthSessions) * unit));
  const paidEarlierDeduction = round2(
    Math.min(Math.max(0, i.credit.paidEarlierThisMonth), P - sessionDiscount)
  );
  return {
    rolloverSessions: round2(rolloverSessions),
    thisMonthSessions,
    sessionDiscount,
    paidEarlierDeduction,
    payable: round2(Math.max(0, P - sessionDiscount - paidEarlierDeduction)),
  };
}

/**
 * Day entry (Standard / Student / Pensioner) paid with rolled-over credit: one
 * session covers the whole entry. Sessions earlier this month without a pass don't
 * count here, as those nights were already free.
 */
export function dayEntryPrice(i: {
  dayPrice: number;
  credit: SessionCredit;
  useCredit: boolean;
}): { sessionsUsed: number; creditApplied: number; payable: number } {
  const price = Math.max(0, i.dayPrice);
  if (!i.useCredit || price === 0) return { sessionsUsed: 0, creditApplied: 0, payable: price };
  const sessionsUsed = Math.min(1, remainingRolloverSessions(i.credit, price));
  const creditApplied = round2(sessionsUsed * price);
  return { sessionsUsed: round2(sessionsUsed), creditApplied, payable: round2(price - creditApplied) };
}
