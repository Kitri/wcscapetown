const ZA_TIME_ZONE = "Africa/Johannesburg";

// "2026-10-12 19:42:05" in Cape Town time. Written as plain text so it sorts and
// matches against Yoco's transaction times without spreadsheet date conversion.
export function formatZaTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}
