export const ZA_TIME_ZONE = "Africa/Johannesburg";

// DEV/TEST helper: set CHECKIN_FORCE_ZA_DATE=YYYY-MM-DD in your environment
// to simulate a specific Cape Town date for check-in rules.
export function getZaNow(): Date {
  const forced = process.env.CHECKIN_FORCE_ZA_DATE;
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) {
    // Use midday to avoid edge cases around timezone boundaries.
    return new Date(`${forced}T12:00:00+02:00`);
  }
  return new Date();
}

export function formatZaDateISO(date: Date = getZaNow()): string {
  // en-CA gives YYYY-MM-DD
  return date.toLocaleDateString("en-CA", { timeZone: ZA_TIME_ZONE });
}

export function formatZaMonthYear(date: Date = getZaNow()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZA_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).formatToParts(date);

  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${month} ${year}`.trim();
}

export function getZaDayOfMonth(date: Date = getZaNow()): number {
  const dayStr = new Intl.DateTimeFormat("en-US", {
    timeZone: ZA_TIME_ZONE,
    day: "2-digit",
  }).format(date);
  return Number(dayStr);
}

export function isZaMonday(date: Date = getZaNow()): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: ZA_TIME_ZONE,
    weekday: "long",
  }).format(date);
  return weekday === "Monday";
}

export function isZaFirstMonday(date: Date = getZaNow()): boolean {
  return isZaMonday(date) && getZaDayOfMonth(date) <= 7;
}
