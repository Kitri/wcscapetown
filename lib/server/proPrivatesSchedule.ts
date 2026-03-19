import {
  deleteSheetRowByNumber,
  getSheetValues,
  updateSheetValues,
} from "@/lib/googleSheets";
import { PRO_PRIVATES_SPREADSHEET_ID } from "./proPrivatesConfig";

export type ProId = "igor" | "fernanda" | "harold" | "kristen";
type Currency = "EUR" | "GBP";

type ProConfig = {
  id: ProId;
  name: string;
  currency: Currency;
  rate45: number;
};

type AvailabilityInterval = {
  proId: ProId;
  dateKey: string;
  startMinutes: number;
  endMinutes: number;
};

type ParsedBooking = {
  rowNumber: number;
  proId: ProId;
  dateKey: string;
  startMinutes: number;
  durationMinutes: number;
  studentName: string;
  partnerName: string;
  notes: string;
};

export type PrivateLessonBooking = {
  rowNumber: number;
  proId: ProId;
  proName: string;
  dateKey: string;
  dateLabel: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  durationMinutes: number;
  studentName: string;
  partnerName: string;
  notes: string;
  currency: Currency;
  amountOriginal: number;
  amountZar: number;
  amountZarRounded: number;
};
export type PrivateLessonWorkshop = {
  proId: ProId;
  proName: string;
  dateKey: string;
  dateLabel: string;
  startMinutes: number;
  endMinutes: number;
  timeLabel: string;
  title: string;
  location: string;
};

export type PrivateLessonSlot = {
  dateKey: string;
  dateLabel: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  label: string;
  durationMinutes: number;
  status: "available" | "booked";
  bookingSummary: string;
};

export type PrivateLessonDaySchedule = {
  dateKey: string;
  dateLabel: string;
  slotDurationMinutes: number;
  slots: PrivateLessonSlot[];
};

export type PrivateLessonProSchedule = {
  proId: ProId;
  proName: string;
  currency: Currency;
  rate45: number;
  rate45Zar: number;
  rate45ZarRounded: number;
  rate60: number;
  rate60Zar: number;
  rate60ZarRounded: number;
  workshops: PrivateLessonWorkshop[];
  days: PrivateLessonDaySchedule[];
  bookings: PrivateLessonBooking[];
  stats: {
    availableSlots: number;
    bookedSlots: number;
  };
};

export type PrivateLessonsExchangeRates = {
  EUR_ZAR: number;
  GBP_ZAR: number;
  source: string;
  fetchedAt: string | null;
  fallbackUsed: boolean;
};

export type PrivateLessonsDashboardData = {
  pros: Array<{
    proId: ProId;
    proName: string;
    currency: Currency;
    rate45: number;
    rate45Zar: number;
    rate45ZarRounded: number;
    rate60: number;
    rate60Zar: number;
    rate60ZarRounded: number;
  }>;
  exchangeRates: PrivateLessonsExchangeRates;
  schedules: Record<ProId, PrivateLessonProSchedule>;
};

type BookedColumnMap = {
  date: number;
  time: number;
  duration: number | null;
  pro: number;
  partner: number | null;
  student: number | null;
  notes: number | null;
  timestamp: number | null;
};

type BookedSheetInfo = {
  sheetName: string;
  rows: string[][];
  headerIndex: number;
  columns: BookedColumnMap;
};

const PROS: readonly ProConfig[] = [
  { id: "igor", name: "Igor", currency: "EUR", rate45: 110 },
  { id: "fernanda", name: "Fernanda", currency: "EUR", rate45: 100 },
  { id: "harold", name: "Harold", currency: "GBP", rate45: 45 },
  { id: "kristen", name: "Kristen", currency: "GBP", rate45: 45 },
] as const;

const PRO_BY_ID: Record<ProId, ProConfig> = PROS.reduce(
  (acc, pro) => ({ ...acc, [pro.id]: pro }),
  {} as Record<ProId, ProConfig>
);

const ALL_PRO_IDS: ProId[] = PROS.map((pro) => pro.id);

const PRO_ALIASES: Record<ProId, string[]> = {
  igor: ["igor", "igor pitangui"],
  fernanda: ["fernanda", "fernanda dubiel"],
  harold: ["harold", "harold baker"],
  kristen: ["kristen", "kristen wallace"],
};

const BOOKED_TAB_CANDIDATES = ["Booked", "booked", "Bookings", "Booking", "Sheet1"];
const AVAILABILITY_TAB_CANDIDATES = [
  "Availability",
  "availability",
  "Available",
  "Schedule",
  "Sheet2",
];

const DEFAULT_FALLBACK_RATES = {
  EUR_ZAR: 20.5,
  GBP_ZAR: 23.5,
};

const AVAILABILITY_TRUE_VALUES = new Set([
  "yes",
  "y",
  "true",
  "1",
  "x",
  "available",
  "all",
  "ok",
  "free",
]);

type WeekenderWorkshopTemplate = {
  dateKey: string;
  startTime: string;
  endTime: string;
  title: string;
  location: string;
  proIds: ProId[];
};
const WEEKENDER_WORKSHOPS: WeekenderWorkshopTemplate[] = [
  {
    dateKey: "2026-03-21",
    startTime: "12:00",
    endTime: "13:00",
    title: "Level 1",
    location: "Hellenic Community Centre (Side Hall)",
    proIds: ["igor", "fernanda"],
  },
  {
    dateKey: "2026-03-21",
    startTime: "13:15",
    endTime: "14:15",
    title: "Level 1",
    location: "Hellenic Community Centre (Side Hall)",
    proIds: ["igor", "fernanda"],
  },
  {
    dateKey: "2026-03-21",
    startTime: "15:45",
    endTime: "16:45",
    title: "Level 2",
    location: "Hellenic Community Centre (Main Hall)",
    proIds: ["igor", "fernanda"],
  },
  {
    dateKey: "2026-03-21",
    startTime: "17:00",
    endTime: "18:00",
    title: "Level 2",
    location: "Hellenic Community Centre (Main Hall)",
    proIds: ["igor", "fernanda"],
  },
  {
    dateKey: "2026-03-21",
    startTime: "19:30",
    endTime: "20:30",
    title: "Master Your Social Dance on the Floor",
    location: "Hellenic Community Centre (Main Hall)",
    proIds: ["igor", "fernanda"],
  },
  {
    dateKey: "2026-03-22",
    startTime: "10:45",
    endTime: "11:45",
    title: "Advanced Spinning Intensive (Add-on)",
    location: "Hellenic Community Centre (Main Hall)",
    proIds: ["igor", "fernanda"],
  },
  {
    dateKey: "2026-03-22",
    startTime: "12:00",
    endTime: "13:00",
    title: "Followers Intensive",
    location: "Hellenic Community Centre (Main Hall)",
    proIds: ["igor", "fernanda"],
  },
  {
    dateKey: "2026-03-22",
    startTime: "15:30",
    endTime: "16:30",
    title: "Level 1",
    location: "Hellenic Community Centre (Side Hall)",
    proIds: ["igor", "fernanda"],
  },
  {
    dateKey: "2026-03-22",
    startTime: "16:45",
    endTime: "17:45",
    title: "Level 2",
    location: "Hellenic Community Centre (Main Hall)",
    proIds: ["igor", "fernanda"],
  },
];

function normalizeCell(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeSheetName(name: string): string {
  return name.replace(/'/g, "''");
}

function isBlank(value: string | undefined): boolean {
  return !value || value.trim() === "";
}

export function isProId(value: string): value is ProId {
  return value === "igor" || value === "fernanda" || value === "harold" || value === "kristen";
}

function findProId(raw: string): ProId | null {
  const normalized = normalizeCell(raw);
  if (!normalized) return null;

  for (const proId of ALL_PRO_IDS) {
    for (const alias of PRO_ALIASES[proId]) {
      if (normalized === alias || normalized.includes(alias)) {
        return proId;
      }
    }
  }

  return null;
}

function findProIds(raw: string): ProId[] {
  const normalized = normalizeCell(raw);
  if (!normalized) return [];

  const found = new Set<ProId>();
  for (const proId of ALL_PRO_IDS) {
    for (const alias of PRO_ALIASES[proId]) {
      if (normalized.includes(alias)) {
        found.add(proId);
      }
    }
  }

  if (found.size > 0) return Array.from(found);

  if (AVAILABILITY_TRUE_VALUES.has(normalized)) {
    return [...ALL_PRO_IDS];
  }

  return [];
}

function toDateKey(year: number, month: number, day: number): string | null {
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const y = String(year).padStart(4, "0");
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeYear(rawYear: string | undefined): number {
  const currentYear = new Date().getFullYear();
  if (!rawYear) return currentYear;

  const parsed = Number(rawYear);
  if (!Number.isFinite(parsed)) return currentYear;
  if (parsed < 100) return 2000 + parsed;
  return parsed;
}

export function normalizeDateKey(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const iso = value.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    return toDateKey(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const dmy = value.match(/\b(\d{1,2})[\/.\-](\d{1,2})(?:[\/.\-](\d{2,4}))?\b/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = normalizeYear(dmy[3]);
    return toDateKey(year, month, day);
  }

  const monthNames: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };

  const dayMonthWord = value.match(
    /\b(\d{1,2})\s+([a-zA-Z]{3,9})(?:\s*,?\s*(\d{2,4}))?\b/
  );
  if (dayMonthWord) {
    const day = Number(dayMonthWord[1]);
    const month = monthNames[dayMonthWord[2].toLowerCase()];
    const year = normalizeYear(dayMonthWord[3]);
    if (month) return toDateKey(year, month, day);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return toDateKey(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth() + 1,
      parsed.getUTCDate()
    );
  }

  return null;
}

function parseTimeMinutesInternal(raw: string): number | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;

  const sanitized = value.replace(/\./g, ":");
  const ampm = sanitized.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (ampm) {
    let hour = Number(ampm[1]);
    const minute = Number(ampm[2] ?? "0");
    if (!Number.isFinite(hour) || !Number.isFinite(minute) || minute > 59) return null;

    if (hour === 12) {
      hour = ampm[3] === "am" ? 0 : 12;
    } else if (ampm[3] === "pm") {
      hour += 12;
    }

    if (hour < 0 || hour > 23) return null;
    return hour * 60 + minute;
  }

  const exact24 = sanitized.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (exact24) {
    const hour = Number(exact24[1]);
    const minute = Number(exact24[2] ?? "0");
    if (
      !Number.isFinite(hour) ||
      !Number.isFinite(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }
    return hour * 60 + minute;
  }

  const embedded24 = sanitized.match(/\b(\d{1,2}):(\d{2})\b/);
  if (embedded24) {
    const hour = Number(embedded24[1]);
    const minute = Number(embedded24[2]);
    if (
      !Number.isFinite(hour) ||
      !Number.isFinite(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }
    return hour * 60 + minute;
  }

  return null;
}

export function normalizeTimeHHMM(raw: string): string | null {
  const minutes = parseTimeMinutesInternal(raw);
  if (minutes === null) return null;
  return formatTime(minutes);
}

function parseTimeRange(raw: string): { start: number; end: number } | null {
  const value = raw.trim();
  if (!value) return null;

  const normalized = value
    .replace(/[–—]/g, "-")
    .replace(/\s+to\s+/gi, "-")
    .replace(/\s*-\s*/g, "-");

  const parts = normalized.split("-").filter((part) => part.trim().length > 0);
  if (parts.length < 2) return null;

  const start = parseTimeMinutesInternal(parts[0]);
  const end = parseTimeMinutesInternal(parts[1]);
  if (start === null || end === null) return null;
  if (end <= start) return null;

  return { start, end };
}

function parseDurationMinutes(raw: string): number | null {
  const match = raw.match(/(\d{2,3})/);
  if (!match) return null;
  const duration = Number(match[1]);
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return duration;
}

function formatTime(minutes: number): string {
  const safe = Math.max(0, Math.min(minutes, 24 * 60));
  const hour = Math.floor(safe / 60);
  const minute = safe % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "Africa/Johannesburg",
  });
}
function buildWeekenderWorkshopsForPro(proId: ProId): PrivateLessonWorkshop[] {
  const pro = PRO_BY_ID[proId];

  return WEEKENDER_WORKSHOPS.filter((entry) => entry.proIds.includes(proId))
    .map((entry) => {
      const startMinutes = parseTimeMinutesInternal(entry.startTime) ?? 0;
      const endMinutes = parseTimeMinutesInternal(entry.endTime) ?? 0;

      return {
        proId,
        proName: pro.name,
        dateKey: entry.dateKey,
        dateLabel: formatDateLabel(entry.dateKey),
        startMinutes,
        endMinutes,
        timeLabel: `${formatTime(startMinutes)}–${formatTime(endMinutes)}`,
        title: entry.title,
        location: entry.location,
      };
    })
    .sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? -1 : 1;
      return a.startMinutes - b.startMinutes;
    });
}
function formatBookedSheetDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayMonth = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Johannesburg",
  });
  const weekday = date.toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "Africa/Johannesburg",
  });
  return `${dayMonth} - ${weekday}`;
}

function isMarch45MinuteException(dateKey: string): boolean {
  const [, month, day] = dateKey.split("-").map((part) => Number(part));
  return month === 3 && (day === 21 || day === 22);
}

function slotDurationForDate(dateKey: string): number {
  return isMarch45MinuteException(dateKey) ? 45 : 60;
}

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function toColumnLetter(columnNumber: number): string {
  let n = columnNumber;
  let out = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    out = String.fromCharCode(65 + remainder) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out || "A";
}

function findHeaderIndex(rows: string[][], minScore = 2): number {
  const scanRows = Math.min(rows.length, 10);
  let bestIndex = 0;
  let bestScore = -1;

  for (let i = 0; i < scanRows; i += 1) {
    const row = rows[i] ?? [];
    const normalized = row.map((cell) => normalizeCell(cell));
    let score = 0;

    if (normalized.some((cell) => cell.includes("date") || cell.includes("day"))) score += 2;
    if (
      normalized.some(
        (cell) => cell.includes("time") || cell.includes("start") || cell.includes("slot")
      )
    ) {
      score += 2;
    }
    if (
      normalized.some(
        (cell) =>
          cell.includes("pro") ||
          cell.includes("coach") ||
          cell.includes("teacher") ||
          !!findProId(cell)
      )
    ) {
      score += 2;
    }
    if (normalized.some((cell) => cell.includes("duration") || cell.includes("min"))) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestScore >= minScore ? bestIndex : -1;
}

function findColumnByKeywords(header: string[], keywords: string[]): number | null {
  const normalized = header.map((cell) => normalizeCell(cell));
  for (let i = 0; i < normalized.length; i += 1) {
    if (!normalized[i]) continue;
    if (keywords.some((keyword) => normalized[i].includes(keyword))) {
      return i;
    }
  }
  return null;
}

function deriveBookedColumns(header: string[], hasHeader: boolean): BookedColumnMap {
  const defaultMap: BookedColumnMap = {
    date: 0,
    time: 1,
    duration: 4,
    pro: 2,
    partner: 5,
    student: 3,
    notes: 8,
    timestamp: null,
  };
  if (!hasHeader) return defaultMap;

  const normalizedHeader = header.map((cell) => normalizeCell(cell));
  const timeLikeIndices = normalizedHeader
    .map((cell, index) =>
      cell.includes("time") || cell.includes("start") || cell.includes("slot") ? index : -1
    )
    .filter((index) => index >= 0);
  const timeColumn = timeLikeIndices[0] ?? defaultMap.time;
  const durationColumnBySecondaryTime = timeLikeIndices.find((index) => index !== timeColumn) ?? null;

  const proFromName = normalizedHeader.findIndex((cell) => findProId(cell) !== null);
  const proColumn =
    findColumnByKeywords(normalizedHeader, ["pro", "coach", "teacher", "instructor"]) ??
    (proFromName >= 0 ? proFromName : null);

  return {
    date: findColumnByKeywords(normalizedHeader, ["date", "day"]) ?? defaultMap.date,
    time: timeColumn,
    duration:
      findColumnByKeywords(normalizedHeader, ["duration", "length", "mins", "minutes"]) ??
      durationColumnBySecondaryTime ??
      defaultMap.duration,
    pro: proColumn ?? defaultMap.pro,
    partner: findColumnByKeywords(normalizedHeader, ["partner"]) ?? defaultMap.partner,
    student:
      findColumnByKeywords(normalizedHeader, [
        "student",
        "client",
        "booked by",
        "name",
        "person",
        "dancer",
      ]) ??
      defaultMap.student,
    notes: findColumnByKeywords(normalizedHeader, ["note", "comment", "remarks"]) ?? defaultMap.notes,
    timestamp:
      findColumnByKeywords(normalizedHeader, ["timestamp", "created", "booked at"]) ??
      defaultMap.timestamp,
  };
}

async function readFirstMatchingTab(
  spreadsheetId: string,
  candidates: string[]
): Promise<{ sheetName: string; rows: string[][] }> {
  let lastError: unknown = null;

  for (const sheetName of candidates) {
    try {
      const range = `'${escapeSheetName(sheetName)}'!A:ZZ`;
      const rows = await getSheetValues(spreadsheetId, range);
      return { sheetName, rows };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw new Error(
      `Unable to read expected tabs (${candidates.join(", ")}): ${lastError.message}`
    );
  }
  throw new Error(`Unable to read expected tabs (${candidates.join(", ")})`);
}

async function loadBookedSheetInfo(): Promise<BookedSheetInfo> {
  const spreadsheetId = PRO_PRIVATES_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("SHEET_ID_WEEKEND_PRIVATES is not configured");
  }

  const { sheetName, rows } = await readFirstMatchingTab(spreadsheetId, BOOKED_TAB_CANDIDATES);
  const headerIndex = findHeaderIndex(rows);
  const hasHeader = headerIndex >= 0;
  const header = hasHeader ? rows[headerIndex] ?? [] : [];
  const columns = deriveBookedColumns(header, hasHeader);

  return { sheetName, rows, headerIndex, columns };
}

function parseBookedRows(info: BookedSheetInfo): ParsedBooking[] {
  const { rows, headerIndex, columns } = info;
  const startRow = headerIndex >= 0 ? headerIndex + 1 : 0;
  const parsed: ParsedBooking[] = [];

  for (let i = startRow; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    if (row.every((cell) => isBlank(cell))) continue;

    const proRaw = row[columns.pro] ?? row.join(" ");
    const proId = findProId(proRaw);
    if (!proId) continue;

    const dateRaw = row[columns.date] ?? "";
    const timeRaw = row[columns.time] ?? "";
    const dateKey = normalizeDateKey(dateRaw) ?? normalizeDateKey(`${dateRaw} ${timeRaw}`);
    if (!dateKey) continue;

    const parsedRange = parseTimeRange(timeRaw);
    const startMinutes = parsedRange?.start ?? parseTimeMinutesInternal(timeRaw);
    if (startMinutes === null) continue;

    const durationFromColumn =
      columns.duration !== null ? parseDurationMinutes(row[columns.duration] ?? "") : null;
    const durationMinutes =
      durationFromColumn ??
      (parsedRange ? parsedRange.end - parsedRange.start : slotDurationForDate(dateKey));

    const studentName =
      columns.student !== null && !isBlank(row[columns.student])
        ? row[columns.student].trim()
        : "Booked";
    const partnerName =
      columns.partner !== null && !isBlank(row[columns.partner]) ? row[columns.partner].trim() : "";
    const notes =
      columns.notes !== null && !isBlank(row[columns.notes]) ? row[columns.notes].trim() : "";

    parsed.push({
      rowNumber: i + 1,
      proId,
      dateKey,
      startMinutes,
      durationMinutes,
      studentName,
      partnerName,
      notes,
    });
  }

  return parsed;
}

function resolveInterval(
  dateKey: string,
  timeRaw: string,
  endRaw?: string
): { startMinutes: number; endMinutes: number } | null {
  const explicitRange = parseTimeRange(timeRaw);
  if (explicitRange) {
    return { startMinutes: explicitRange.start, endMinutes: explicitRange.end };
  }

  const start = parseTimeMinutesInternal(timeRaw);
  if (start === null) return null;

  const parsedEnd = endRaw ? parseTimeMinutesInternal(endRaw) : null;
  const duration = slotDurationForDate(dateKey);
  const end = parsedEnd !== null && parsedEnd > start ? parsedEnd : start + duration;
  return { startMinutes: start, endMinutes: end };
}

function parseAvailabilityWithProColumns(rows: string[][]): AvailabilityInterval[] {
  const headerIndex = findHeaderIndex(rows, 1);
  if (headerIndex < 0) return [];

  const header = rows[headerIndex] ?? [];
  const normalizedHeader = header.map((cell) => normalizeCell(cell));
  const dateColumn = findColumnByKeywords(normalizedHeader, ["date", "day"]);
  const timeColumn = findColumnByKeywords(normalizedHeader, ["time", "start", "slot"]);
  const endColumn = findColumnByKeywords(normalizedHeader, ["end", "finish"]);
  if (dateColumn === null || timeColumn === null) return [];

  const proColumns = new Map<ProId, number>();
  for (const proId of ALL_PRO_IDS) {
    for (let i = 0; i < normalizedHeader.length; i += 1) {
      if (!normalizedHeader[i]) continue;
      if (findProId(normalizedHeader[i]) === proId) {
        proColumns.set(proId, i);
        break;
      }
    }
  }
  if (proColumns.size === 0) return [];

  const intervals: AvailabilityInterval[] = [];
  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const dateKey = normalizeDateKey(row[dateColumn] ?? "");
    if (!dateKey) continue;

    const interval = resolveInterval(dateKey, row[timeColumn] ?? "", row[endColumn ?? -1]);
    if (!interval) continue;

    for (const [proId, col] of proColumns.entries()) {
      const cellValue = row[col] ?? "";
      if (isBlank(cellValue)) continue;
      intervals.push({
        proId,
        dateKey,
        startMinutes: interval.startMinutes,
        endMinutes: interval.endMinutes,
      });
    }
  }

  return intervals;
}

function parseAvailabilityMatrix(rows: string[][]): AvailabilityInterval[] {
  const scanRows = Math.min(rows.length, 10);
  let headerIndex = -1;
  let dateColumns: Array<{ index: number; dateKey: string }> = [];

  for (let i = 0; i < scanRows; i += 1) {
    const row = rows[i] ?? [];
    const matches: Array<{ index: number; dateKey: string }> = [];
    for (let c = 0; c < row.length; c += 1) {
      const dateKey = normalizeDateKey(row[c] ?? "");
      if (dateKey) {
        matches.push({ index: c, dateKey });
      }
    }
    if (matches.length >= 2) {
      headerIndex = i;
      dateColumns = matches;
      break;
    }
  }

  if (headerIndex < 0 || dateColumns.length < 1) return [];

  const firstDateColumn = Math.min(...dateColumns.map((dc) => dc.index));
  const proColumn = firstDateColumn > 0 ? firstDateColumn - 1 : 0;
  const intervals: AvailabilityInterval[] = [];

  for (let r = headerIndex + 1; r < rows.length; r += 1) {
    const row = rows[r] ?? [];
    const proId = findProId(row[proColumn] ?? "");
    if (!proId) continue;

    for (const dc of dateColumns) {
      const availabilityCell = row[dc.index] ?? "";
      if (isBlank(availabilityCell)) continue;

      const segments = availabilityCell
        .split(/[,;|]+/)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
      const ranges = segments
        .map((segment) => parseTimeRange(segment))
        .filter((range): range is { start: number; end: number } => range !== null);

      if (ranges.length === 0) {
        const start = parseTimeMinutesInternal(availabilityCell);
        if (start !== null) {
          ranges.push({ start, end: start + slotDurationForDate(dc.dateKey) });
        }
      }

      for (const range of ranges) {
        intervals.push({
          proId,
          dateKey: dc.dateKey,
          startMinutes: range.start,
          endMinutes: range.end,
        });
      }
    }
  }

  return intervals;
}

function parseAvailabilityRowWise(rows: string[][]): AvailabilityInterval[] {
  const headerIndex = findHeaderIndex(rows, 1);
  const hasHeader = headerIndex >= 0;
  const header = hasHeader ? rows[headerIndex] ?? [] : [];
  const normalizedHeader = header.map((cell) => normalizeCell(cell));

  const dateColumn = hasHeader
    ? findColumnByKeywords(normalizedHeader, ["date", "day"]) ?? 0
    : 0;
  const timeColumn = hasHeader
    ? findColumnByKeywords(normalizedHeader, ["time", "start", "slot"]) ?? 1
    : 1;
  const endColumn = hasHeader ? findColumnByKeywords(normalizedHeader, ["end", "finish"]) : null;
  const proColumn = hasHeader
    ? findColumnByKeywords(normalizedHeader, ["pro", "coach", "teacher", "instructor"]) ?? 2
    : 2;
  const availabilityColumn = hasHeader
    ? findColumnByKeywords(normalizedHeader, ["availability", "available", "status"])
    : null;

  const startRow = hasHeader ? headerIndex + 1 : 0;
  const intervals: AvailabilityInterval[] = [];

  for (let i = startRow; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const dateKey = normalizeDateKey(row[dateColumn] ?? "");
    if (!dateKey) continue;

    const interval = resolveInterval(dateKey, row[timeColumn] ?? "", row[endColumn ?? -1]);
    if (!interval) continue;

    const proIds = findProIds(row[proColumn] ?? "");
    if (proIds.length === 0) continue;

    if (availabilityColumn !== null && isBlank(row[availabilityColumn] ?? "")) {
      continue;
    }

    for (const proId of proIds) {
      intervals.push({
        proId,
        dateKey,
        startMinutes: interval.startMinutes,
        endMinutes: interval.endMinutes,
      });
    }
  }

  return intervals;
}

function dedupeIntervals(intervals: AvailabilityInterval[]): AvailabilityInterval[] {
  const seen = new Set<string>();
  const output: AvailabilityInterval[] = [];

  for (const interval of intervals) {
    if (interval.endMinutes <= interval.startMinutes) continue;
    const key = `${interval.proId}|${interval.dateKey}|${interval.startMinutes}|${interval.endMinutes}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(interval);
  }

  return output;
}

function parseAvailabilityRows(rows: string[][]): AvailabilityInterval[] {
  const fromProColumns = parseAvailabilityWithProColumns(rows);
  if (fromProColumns.length > 0) return dedupeIntervals(fromProColumns);

  const fromMatrix = parseAvailabilityMatrix(rows);
  if (fromMatrix.length > 0) return dedupeIntervals(fromMatrix);

  const fromRowWise = parseAvailabilityRowWise(rows);
  return dedupeIntervals(fromRowWise);
}

async function fetchSingleBaseRate(base: "EUR" | "GBP"): Promise<{
  rate: number;
  fetchedAt: string | null;
}> {
  const response = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Rate lookup failed for ${base}`);
  }

  const data = (await response.json()) as {
    rates?: Record<string, number>;
    time_last_update_utc?: string;
  };
  const zarRate = Number(data?.rates?.ZAR);
  if (!Number.isFinite(zarRate) || zarRate <= 0) {
    throw new Error(`Invalid ZAR rate for ${base}`);
  }

  return { rate: zarRate, fetchedAt: data.time_last_update_utc ?? null };
}

async function getExchangeRates(): Promise<PrivateLessonsExchangeRates> {
  const eurOverride = Number(process.env.EUR_TO_ZAR ?? "");
  const gbpOverride = Number(process.env.GBP_TO_ZAR ?? "");
  if (Number.isFinite(eurOverride) && Number.isFinite(gbpOverride) && eurOverride > 0 && gbpOverride > 0) {
    return {
      EUR_ZAR: eurOverride,
      GBP_ZAR: gbpOverride,
      source: "env_override",
      fetchedAt: null,
      fallbackUsed: false,
    };
  }

  try {
    const [eur, gbp] = await Promise.all([
      fetchSingleBaseRate("EUR"),
      fetchSingleBaseRate("GBP"),
    ]);

    return {
      EUR_ZAR: eur.rate,
      GBP_ZAR: gbp.rate,
      source: "open.er-api.com",
      fetchedAt: eur.fetchedAt ?? gbp.fetchedAt,
      fallbackUsed: false,
    };
  } catch {
    return {
      EUR_ZAR: DEFAULT_FALLBACK_RATES.EUR_ZAR,
      GBP_ZAR: DEFAULT_FALLBACK_RATES.GBP_ZAR,
      source: "fallback_static",
      fetchedAt: null,
      fallbackUsed: true,
    };
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
function roundToNearestHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

function bookingAmountOriginal(proId: ProId, durationMinutes: number): number {
  const pro = PRO_BY_ID[proId];
  const scaled = pro.rate45 * (durationMinutes / 45);
  return roundCurrency(scaled);
}

function bookingAmountZar(
  proId: ProId,
  durationMinutes: number,
  rates: PrivateLessonsExchangeRates
): number {
  const base = bookingAmountOriginal(proId, durationMinutes);
  const rate = PRO_BY_ID[proId].currency === "EUR" ? rates.EUR_ZAR : rates.GBP_ZAR;
  return roundCurrency(base * rate);
}

function withPricing(
  booking: ParsedBooking,
  rates: PrivateLessonsExchangeRates
): PrivateLessonBooking {
  const pro = PRO_BY_ID[booking.proId];
  const startTime = formatTime(booking.startMinutes);
  const endMinutes = booking.startMinutes + booking.durationMinutes;
  const amountOriginal = bookingAmountOriginal(booking.proId, booking.durationMinutes);
  const amountZar = bookingAmountZar(booking.proId, booking.durationMinutes, rates);
  return {
    rowNumber: booking.rowNumber,
    proId: booking.proId,
    proName: pro.name,
    dateKey: booking.dateKey,
    dateLabel: formatDateLabel(booking.dateKey),
    startMinutes: booking.startMinutes,
    endMinutes,
    startTime,
    durationMinutes: booking.durationMinutes,
    studentName: booking.studentName,
    partnerName: booking.partnerName,
    notes: booking.notes,
    currency: pro.currency,
    amountOriginal,
    amountZar,
    amountZarRounded: roundToNearestHundred(amountZar),
  };
}

function buildScheduleForPro(
  proId: ProId,
  intervals: AvailabilityInterval[],
  bookings: PrivateLessonBooking[]
): PrivateLessonDaySchedule[] {
  const intervalsByDate = new Map<string, Array<{ start: number; end: number }>>();
  for (const interval of intervals) {
    if (interval.proId !== proId) continue;
    const current = intervalsByDate.get(interval.dateKey) ?? [];
    current.push({ start: interval.startMinutes, end: interval.endMinutes });
    intervalsByDate.set(interval.dateKey, current);
  }

  const bookingsByDate = new Map<string, PrivateLessonBooking[]>();
  for (const booking of bookings) {
    const current = bookingsByDate.get(booking.dateKey) ?? [];
    current.push(booking);
    bookingsByDate.set(booking.dateKey, current);
  }

  const allDateKeys = new Set<string>([
    ...Array.from(intervalsByDate.keys()),
    ...Array.from(bookingsByDate.keys()),
  ]);

  const sortedDates = Array.from(allDateKeys).sort((a, b) => (a < b ? -1 : 1));
  const days: PrivateLessonDaySchedule[] = [];

  for (const dateKey of sortedDates) {
    const slotDuration = slotDurationForDate(dateKey);
    const slotMap = new Map<string, PrivateLessonSlot>();
    const dateLabel = formatDateLabel(dateKey);

    const dayIntervals = intervalsByDate.get(dateKey) ?? [];
    for (const interval of dayIntervals) {
      let start = interval.start;
      while (start + slotDuration <= interval.end) {
        const end = start + slotDuration;
        const key = `${start}-${end}`;
        if (!slotMap.has(key)) {
          slotMap.set(key, {
            dateKey,
            dateLabel,
            startMinutes: start,
            endMinutes: end,
            startTime: formatTime(start),
            endTime: formatTime(end),
            label: `${formatTime(start)}–${formatTime(end)}`,
            durationMinutes: slotDuration,
            status: "available",
            bookingSummary: "",
          });
        }
        start += slotDuration;
      }
    }

    const dayBookings = bookingsByDate.get(dateKey) ?? [];
    for (const booking of dayBookings) {
      const bookingStart = booking.startMinutes;
      const bookingEnd = booking.endMinutes;
      const bookingSummary = booking.partnerName
        ? `${booking.studentName} + ${booking.partnerName}`
        : booking.studentName;

      let matchedExisting = false;
      for (const slot of slotMap.values()) {
        if (intervalsOverlap(slot.startMinutes, slot.endMinutes, bookingStart, bookingEnd)) {
          slot.status = "booked";
          slot.bookingSummary = bookingSummary;
          matchedExisting = true;
        }
      }

      if (!matchedExisting) {
        const key = `${bookingStart}-${bookingEnd}`;
        if (!slotMap.has(key)) {
          slotMap.set(key, {
            dateKey,
            dateLabel,
            startMinutes: bookingStart,
            endMinutes: bookingEnd,
            startTime: formatTime(bookingStart),
            endTime: formatTime(bookingEnd),
            label: `${formatTime(bookingStart)}–${formatTime(bookingEnd)}`,
            durationMinutes: booking.durationMinutes,
            status: "booked",
            bookingSummary,
          });
        }
      }
    }

    const slots = Array.from(slotMap.values()).sort((a, b) => {
      if (a.startMinutes !== b.startMinutes) {
        return a.startMinutes - b.startMinutes;
      }
      if (a.status === b.status) return 0;
      return a.status === "booked" ? -1 : 1;
    });

    if (slots.length > 0) {
      days.push({
        dateKey,
        dateLabel,
        slotDurationMinutes: slotDuration,
        slots,
      });
    }
  }

  return days;
}

export async function buildPrivateLessonsDashboardData(): Promise<PrivateLessonsDashboardData> {
  const spreadsheetId = PRO_PRIVATES_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("SHEET_ID_WEEKEND_PRIVATES is not configured");
  }

  const [bookedSheet, availabilitySheet, exchangeRates] = await Promise.all([
    loadBookedSheetInfo(),
    readFirstMatchingTab(spreadsheetId, AVAILABILITY_TAB_CANDIDATES),
    getExchangeRates(),
  ]);

  const parsedBookings = parseBookedRows(bookedSheet);
  const bookings = parsedBookings.map((booking) => withPricing(booking, exchangeRates));
  const availabilityIntervals = parseAvailabilityRows(availabilitySheet.rows);

  const schedules = {} as Record<ProId, PrivateLessonProSchedule>;
  for (const pro of PROS) {
    const proBookings = bookings
      .filter((booking) => booking.proId === pro.id)
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? -1 : 1;
        return a.startMinutes - b.startMinutes;
      });

    const days = buildScheduleForPro(pro.id, availabilityIntervals, proBookings);
    const workshops = buildWeekenderWorkshopsForPro(pro.id);
    const availableSlots = days.reduce(
      (sum, day) => sum + day.slots.filter((slot) => slot.status === "available").length,
      0
    );
    const bookedSlots = days.reduce(
      (sum, day) => sum + day.slots.filter((slot) => slot.status === "booked").length,
      0
    );

    schedules[pro.id] = {
      proId: pro.id,
      proName: pro.name,
      currency: pro.currency,
      rate45: pro.rate45,
      rate45Zar: bookingAmountZar(pro.id, 45, exchangeRates),
      rate45ZarRounded: roundToNearestHundred(bookingAmountZar(pro.id, 45, exchangeRates)),
      rate60: bookingAmountOriginal(pro.id, 60),
      rate60Zar: bookingAmountZar(pro.id, 60, exchangeRates),
      rate60ZarRounded: roundToNearestHundred(bookingAmountZar(pro.id, 60, exchangeRates)),
      workshops,
      days,
      bookings: proBookings,
      stats: {
        availableSlots,
        bookedSlots,
      },
    };
  }

  return {
    pros: PROS.map((pro) => ({
      proId: pro.id,
      proName: pro.name,
      currency: pro.currency,
      rate45: pro.rate45,
      rate45Zar: bookingAmountZar(pro.id, 45, exchangeRates),
      rate45ZarRounded: roundToNearestHundred(bookingAmountZar(pro.id, 45, exchangeRates)),
      rate60: bookingAmountOriginal(pro.id, 60),
      rate60Zar: bookingAmountZar(pro.id, 60, exchangeRates),
      rate60ZarRounded: roundToNearestHundred(bookingAmountZar(pro.id, 60, exchangeRates)),
    })),
    exchangeRates,
    schedules,
  };
}

export type AppendPrivateLessonBookingInput = {
  proId: ProId;
  dateKey: string;
  startTime: string;
  durationMinutes: number;
  studentName: string;
  partnerName?: string;
  notes?: string;
};
export type UpdatePrivateLessonBookingInput = AppendPrivateLessonBookingInput & {
  rowNumber: number;
};

function buildBookedRow(
  baseRow: string[],
  columns: BookedColumnMap,
  input: AppendPrivateLessonBookingInput
): string[] {
  const row = [...baseRow];
  const pro = PRO_BY_ID[input.proId];
  const partnerName = input.partnerName?.trim() ?? "";
  const notes = input.notes?.trim() ?? "";

  row[columns.date] = formatBookedSheetDate(input.dateKey);
  row[columns.time] = input.startTime;
  if (columns.duration !== null) row[columns.duration] = `${input.durationMinutes} min`;
  row[columns.pro] = pro.name;
  if (columns.student !== null) row[columns.student] = input.studentName.trim();
  if (columns.partner !== null) row[columns.partner] = partnerName;
  if (columns.notes !== null) row[columns.notes] = notes;
  if (columns.timestamp !== null) row[columns.timestamp] = new Date().toISOString();

  return row;
}

async function writeRowAtNumber(
  spreadsheetId: string,
  sheetName: string,
  rowNumber: number,
  row: string[]
): Promise<void> {
  const endCol = toColumnLetter(row.length);
  const range = `'${escapeSheetName(sheetName)}'!A${rowNumber}:${endCol}${rowNumber}`;
  await updateSheetValues(spreadsheetId, range, [row]);
}

export async function appendPrivateLessonBooking(
  input: AppendPrivateLessonBookingInput
): Promise<void> {
  const spreadsheetId = PRO_PRIVATES_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("SHEET_ID_WEEKEND_PRIVATES is not configured");
  }

  const bookedSheet = await loadBookedSheetInfo();
  const { columns, rows, sheetName } = bookedSheet;

  const rowLength = Math.max((rows[bookedSheet.headerIndex] ?? []).length, 12, 9);
  const blankRow = Array.from({ length: rowLength }, () => "");
  const row = buildBookedRow(blankRow, columns, input);

  const nextRow = rows.length + 1;
  await writeRowAtNumber(spreadsheetId, sheetName, nextRow, row);
}

export async function updatePrivateLessonBooking(
  input: UpdatePrivateLessonBookingInput
): Promise<void> {
  const spreadsheetId = PRO_PRIVATES_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("SHEET_ID_WEEKEND_PRIVATES is not configured");
  }

  const bookedSheet = await loadBookedSheetInfo();
  const { columns, rows, sheetName, headerIndex } = bookedSheet;

  if (!Number.isFinite(input.rowNumber) || input.rowNumber <= Math.max(headerIndex + 1, 1)) {
    throw new Error("Invalid booking row number");
  }
  if (input.rowNumber > rows.length) {
    throw new Error("Booking row not found");
  }

  const existing = rows[input.rowNumber - 1] ?? [];
  const rowLength = Math.max((rows[headerIndex] ?? []).length, existing.length, 12, 9);
  const baseRow = Array.from({ length: rowLength }, (_, i) => existing[i] ?? "");
  const updatedRow = buildBookedRow(baseRow, columns, input);

  await writeRowAtNumber(spreadsheetId, sheetName, input.rowNumber, updatedRow);
}

export async function deletePrivateLessonBooking(rowNumber: number): Promise<void> {
  const spreadsheetId = PRO_PRIVATES_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("SHEET_ID_WEEKEND_PRIVATES is not configured");
  }

  const bookedSheet = await loadBookedSheetInfo();
  const minDataRow = Math.max(bookedSheet.headerIndex + 2, 2);
  if (!Number.isFinite(rowNumber) || rowNumber < minDataRow || rowNumber > bookedSheet.rows.length) {
    throw new Error("Invalid booking row number");
  }

  await deleteSheetRowByNumber(spreadsheetId, bookedSheet.sheetName, rowNumber);
}
