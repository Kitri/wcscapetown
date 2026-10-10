// Monthly price rule: a class is worth monthlyPrice/4. A teaching day removes one
// class from the pass price, a door-volunteer day half a class
// (monthly = P * (4 - teachingDays - 0.5 * volunteerDays) / 4). Money already paid on
// Monday entries this month is then deducted so the member never pays more in total
// than the reduced pass price.

export type MonthlyPriceInput = {
  monthlyPrice: number;
  // Days taught / volunteered while on a previous pass (rolled-over credit).
  passTeacher: number;
  passVolunteer: number;
  // Rand of rollover credit already spent on day entries since the last pass.
  creditUsedRand: number;
  // Days taught / volunteered earlier this month without a pass.
  earlierTeacher: number;
  earlierVolunteer: number;
  // Rand already paid on Monday entries this month (since the last pass).
  paidEarlier: number;
  // Whether the member ticked "use credit".
  useCredit: boolean;
};

export type MonthlyPriceResult = {
  availableCredit: number;
  creditApplied: number;
  paidEarlierDeduction: number;
  payable: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function monthlyPriceBreakdown(i: MonthlyPriceInput): MonthlyPriceResult {
  const P = Math.max(0, i.monthlyPrice);
  const unit = P / 4;
  const passUnits = i.passTeacher + i.passVolunteer * 0.5;
  const earlierUnits = i.earlierTeacher + i.earlierVolunteer * 0.5;
  const remainingPassUnits = unit > 0 ? Math.max(0, passUnits - i.creditUsedRand / unit) : 0;
  const units = remainingPassUnits + earlierUnits;
  const availableCredit = round2(Math.min(P, units * unit));
  const creditApplied = i.useCredit ? availableCredit : 0;
  const paidEarlierDeduction = i.useCredit
    ? round2(Math.min(Math.max(0, i.paidEarlier), P - creditApplied))
    : 0;
  return {
    availableCredit,
    creditApplied,
    paidEarlierDeduction,
    payable: round2(Math.max(0, P - creditApplied - paidEarlierDeduction)),
  };
}

// Credit towards a single day entry: a taught day is worth the whole day price (free
// entry), a volunteered day half of it (the usual door-volunteer discount). Rand
// already spent on earlier day entries is deducted.
export function dayEntryCredit(
  dayPrice: number,
  teacherDays: number,
  volunteerDays: number,
  creditUsedRand: number
): number {
  const earned = Math.max(0, dayPrice) * (teacherDays + volunteerDays * 0.5);
  const available = Math.max(0, Math.round((earned - creditUsedRand) * 100) / 100);
  return Math.min(available, Math.max(0, dayPrice));
}
