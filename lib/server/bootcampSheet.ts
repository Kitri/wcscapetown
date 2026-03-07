import { getSheetValues } from "@/lib/googleSheets";

const BOOTCAMP_SHEET_NAME = "Bootcamp";
const BOOTCAMP_ID_OFFSET = 900000;
const CACHE_TTL_MS = 60 * 1000;

export type BootcampAttendee = {
  member_id: number;
  first_name: string;
  surname: string;
  full_name: string;
};

let attendeesCache: { ts: number; attendees: BootcampAttendee[] } | null = null;

function normalize(value: string): string {
  return (value ?? "").trim().toLowerCase();
}

function parseNameFromRow(row: string[]): { first_name: string; surname: string; full_name: string } | null {
  const colA = (row[0] ?? "").trim();
  const colB = (row[1] ?? "").trim();
  const colC = (row[2] ?? "").trim();

  const maybeHeader =
    normalize(colA).includes("name") ||
    normalize(colB).includes("surname") ||
    normalize(colB).includes("last") ||
    normalize(colC).includes("name");

  if (maybeHeader) return null;

  if (colA && colB) {
    const first_name = colA;
    const surname = colB;
    return {
      first_name,
      surname,
      full_name: `${first_name} ${surname}`.trim(),
    };
  }

  if (colA && !colB) {
    const parts = colA.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return null;
    if (parts.length === 1) {
      return {
        first_name: parts[0],
        surname: "",
        full_name: parts[0],
      };
    }
    return {
      first_name: parts.slice(0, -1).join(" "),
      surname: parts[parts.length - 1],
      full_name: colA,
    };
  }

  return null;
}

export function isBootcampEvent(eventName: string): boolean {
  return normalize(eventName).includes("bootcamp");
}

export async function loadBootcampAttendees(spreadsheetId: string): Promise<BootcampAttendee[]> {
  if (attendeesCache && Date.now() - attendeesCache.ts < CACHE_TTL_MS) {
    return attendeesCache.attendees;
  }

  const rows = await getSheetValues(spreadsheetId, `${BOOTCAMP_SHEET_NAME}!A:Z`);
  const attendees: BootcampAttendee[] = [];

  for (let idx = 0; idx < rows.length; idx++) {
    const parsed = parseNameFromRow(rows[idx] ?? []);
    if (!parsed) continue;

    attendees.push({
      member_id: BOOTCAMP_ID_OFFSET + idx + 1,
      first_name: parsed.first_name,
      surname: parsed.surname,
      full_name: parsed.full_name,
    });
  }

  attendeesCache = { ts: Date.now(), attendees };
  return attendees;
}
