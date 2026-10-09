import { getSheetValues } from "@/lib/googleSheets";
import {
  CHECKIN_SPREADSHEET_ID,
  ROSTER_SHEET_TAB,
  ROSTER_SPREADSHEET_ID,
} from "@/lib/server/checkinConfig";

export type TeacherRole = "teacher" | "newcomer teacher";

const TEACHERS_TTL_MS = 60 * 1000;
const ROSTER_TTL_MS = 30 * 1000; // roster changes on the day, keep this short

type TeacherDirectory = {
  // member_id -> normalised roster names for that person
  byMember: Map<number, Set<string>>;
  // every name listed in the Teachers tab (incl. rows with no member_id, e.g. guests)
  known: Set<string>;
};

let teachersCache: { ts: number; value: TeacherDirectory } | null = null;
let rosterCache: { ts: number; rows: string[][] } | null = null;

export function clearTeacherRosterCache(): void {
  teachersCache = null;
  rosterCache = null;
}

// "Michael E", "MichaelE" and " michael e " all normalise to "michaele".
export function normalizeRosterName(raw: string): string {
  return (raw ?? "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z]/g, "");
}

// Split a roster cell into names: "Elaine, Michael R", "Elaine and Priyanka",
// "Priyanka (Co-teaching)". "None"/blank cells give no names.
export function splitRosterCell(raw: string): string[] {
  const cleaned = (raw ?? "").replace(/\([^)]*\)/g, " ");
  return cleaned
    .split(/,|&|\/|\band\b/i)
    .map((t) => t.trim())
    .filter((t) => t && !/^(none|n\/a|-+|—+)$/i.test(t));
}

async function loadTeacherDirectory(): Promise<TeacherDirectory> {
  if (teachersCache && Date.now() - teachersCache.ts < TEACHERS_TTL_MS) {
    return teachersCache.value;
  }

  // Teachers tab in the check-in DB: A = member_id, B = roster name(s) (comma separated)
  const rows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "Teachers!A:B");
  const byMember = new Map<number, Set<string>>();
  const known = new Set<string>();

  for (const row of rows) {
    const idRaw = (row[0] ?? "").trim();
    if (idRaw.toLowerCase() === "member_id") continue;

    const names = (row[1] ?? "")
      .split(",")
      .map(normalizeRosterName)
      .filter(Boolean);
    if (names.length === 0) continue;
    names.forEach((n) => known.add(n));

    const id = Number(idRaw.replace(/[^0-9]/g, ""));
    if (!idRaw || !Number.isFinite(id)) continue;

    const set = byMember.get(id) ?? new Set<string>();
    names.forEach((n) => set.add(n));
    byMember.set(id, set);
  }

  const value = { byMember, known };
  teachersCache = { ts: Date.now(), value };
  return value;
}

async function loadRosterRows(): Promise<string[][]> {
  if (rosterCache && Date.now() - rosterCache.ts < ROSTER_TTL_MS) {
    return rosterCache.rows;
  }
  const rows = await getSheetValues(
    ROSTER_SPREADSHEET_ID,
    `'${ROSTER_SHEET_TAB}'!A:G`
  );
  rosterCache = { ts: Date.now(), rows };
  return rows;
}

// Names in a cell, or null if the cell contains anything that is not a known
// teacher name (a note, a guest teacher, ...). We never guess: an unrecognised
// cell grants nobody free entry.
function parseCell(raw: string, known: Set<string>): Set<string> | null {
  const out = new Set<string>();
  for (const token of splitRosterCell(raw)) {
    const n = normalizeRosterName(token);
    if (!n || !known.has(n)) return null;
    out.add(n);
  }
  return out;
}

/**
 * Is this member teaching on the given date, according to the live roster?
 * Cheap for everyone else: members not listed in the Teachers tab never
 * trigger a roster read.
 */
export async function getTeacherRoleForDate(
  memberId: number,
  dateISO: string
): Promise<TeacherRole | null> {
  const directory = await loadTeacherDirectory();
  const myNames = directory.byMember.get(memberId);
  if (!myNames) return null;

  const rows = await loadRosterRows();
  let role: TeacherRole | null = null;

  for (const row of rows) {
    if ((row[0] ?? "").trim() !== dateISO) continue;

    // C-F: class teachers (level 1/2 primary + assistant); G: newcomer teacher
    for (let col = 2; col <= 6; col++) {
      const names = parseCell(row[col] ?? "", directory.known);
      if (names === null) {
        console.warn(
          `Teaching roster ${dateISO}: ignoring unrecognised cell in column ${col + 1}`
        );
        continue;
      }
      if ([...names].some((n) => myNames.has(n))) {
        if (col === 6) return "newcomer teacher";
        role = "teacher";
      }
    }
  }

  return role;
}
