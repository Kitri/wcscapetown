import { NextResponse } from "next/server";
import { appendToSheet, getSheetValues } from "@/lib/googleSheets";
import { formatZaDateISO, parseZaDateISO } from "@/lib/zaDate";
import { CHECKIN_EVENT_NAME, CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

type Member = {
  member_id: number;
  first_name: string;
  surname: string;
  full_name: string;
  role: string;
  level: string;
  pensionerStudent: string;
};

let membersCache: { ts: number; members: Member[] } | null = null;
const MEMBERS_CACHE_TTL_MS = 5 * 60 * 1000;

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function mapLevel(raw: string): string {
  const v = raw.trim();
  if (!v) return "Unknown";
  return v;
}

function parseMemberRow(row: string[]): Member | null {
  const idRaw = row[0] ?? "";
  const firstName = row[1] ?? "";
  const surname = row[2] ?? "";
  const role = row[3] ?? "";
  const level = row[4] ?? "";
  const pensionerStudent = row[5] ?? ""; // between level and first_date (column F)

  const member_id = parseMemberId(idRaw);
  if (!Number.isFinite(member_id)) return null;
  if (!firstName && !surname) return null;

  const full_name = `${firstName.trim()} ${surname.trim()}`.trim();

  return {
    member_id,
    first_name: firstName.trim(),
    surname: surname.trim(),
    full_name,
    role: role.trim(),
    level: mapLevel(level),
    pensionerStudent: pensionerStudent.trim(),
  };
}

async function loadMembers(): Promise<Member[]> {
  if (membersCache && Date.now() - membersCache.ts < MEMBERS_CACHE_TTL_MS) {
    return membersCache.members;
  }

  // Read enough columns to include pensioner/student (column O)
  const rows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "All_members!A:O");
  const members = rows
    .filter((r) => (r[0] ?? "").trim().toLowerCase() !== "member_id")
    .map(parseMemberRow)
    .filter(Boolean) as Member[];

  membersCache = { ts: Date.now(), members };
  return members;
}

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const id = Number(digits);
  return Number.isFinite(id) ? id : NaN;
}

async function getNextMemberId(): Promise<number> {
  const col = await getSheetValues(CHECKIN_SPREADSHEET_ID, "All_members!A:A");

  // Find last numeric id (skip header row etc)
  let lastId = 0;
  for (const [cell] of col) {
    if (!cell) continue;
    if (cell.trim().toLowerCase() === "member_id") continue;
    const id = parseMemberId(cell);
    if (Number.isFinite(id)) lastId = id;
  }

  return lastId + 1;
}

function mapRoleToSheet(role: string): string {
  switch (role) {
    case "Lead":
      return "L";
    case "Follow":
      return "F";
    case "I don't know":
      return "";
    default:
      return "";
  }
}

function mapLevelToSheet(level: string): string {
  switch (level) {
    case "first timer":
      return "First timer";
    case "1":
      return "Level 1";
    case "2":
      return "Level 2";
    default:
      return "Level 1";
  }
}

export async function GET(request: Request) {
  try {
    if (!(await isCheckinAuthed())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";

    if (q.trim().length < 3) {
      return NextResponse.json({ results: [] });
    }

    const query = normalize(q);
    const members = await loadMembers();

    const results = members
      .filter((m) => {
        const a = normalize(m.full_name);
        const b = normalize(`${m.surname} ${m.first_name}`);
        return a.includes(query) || b.includes(query);
      })
      .slice(0, 20);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Member search error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

type NewMemberPayload = {
  firstName?: string;
  surname?: string;
  contactNumber?: string;
  email?: string;
  feedbackConsent?: boolean;
  role?: "Lead" | "Follow" | "I don't know";
  level?: "first timer" | "1" | "2";
  level2Reason?: "International experience" | "Teacher approval received";
  howFoundUs?: string;
  visitor?: boolean;
  date?: string; // YYYY-MM-DD (Cape Town)
  event?: string;
};

export async function POST(request: Request) {
  try {
    if (!(await isCheckinAuthed())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as NewMemberPayload;
    const firstName = (body.firstName ?? "").trim();
    const surname = (body.surname ?? "").trim();

    if (!firstName || !surname) {
      return NextResponse.json(
        { error: "First name and surname are required" },
        { status: 400 }
      );
    }

    const contactNumber = (body.contactNumber ?? "").trim();
    const email = (body.email ?? "").trim();

    function isValidEmail(v: string): boolean {
      if (!v) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    function isValidPhone(v: string): boolean {
      if (!v) return true;
      const digits = v.replace(/[^0-9]/g, "");
      return digits.length >= 9 && digits.length <= 15;
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!isValidPhone(contactNumber)) {
      return NextResponse.json({ error: "Invalid contact number" }, { status: 400 });
    }

    if ((contactNumber || email) && !body.feedbackConsent) {
      return NextResponse.json(
        { error: "Consent is required if contact details are provided" },
        { status: 400 }
      );
    }

    const nextId = await getNextMemberId();

    const dateISOParam = (body.date ?? "").trim();
    const date = dateISOParam ? parseZaDateISO(dateISOParam) : null;

    if (dateISOParam && !date) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const event = (body.event ?? "").trim() || CHECKIN_EVENT_NAME;
    if (event.length > 80) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const today = dateISOParam || formatZaDateISO(date ?? undefined);

    const role = mapRoleToSheet(body.role ?? "I don't know");
    const level = mapLevelToSheet(body.level ?? "1");

    // Keep the original columns intact, then add extra intake columns to the right.
    // Column order now includes pensioner/student between level and first_date.
    const row: (string | number)[] = [
      nextId,
      firstName,
      surname,
      role,
      level,
      "", // pensioner/student (leave blank)
      today, // first_date
      "", // last_date (leave blank on creation)
      event,
      contactNumber,
      email,
      body.feedbackConsent ? "Yes" : "",
      (body.howFoundUs ?? "").trim(),
      body.visitor ? "Yes" : "",
      (body.level2Reason ?? "").trim(),
    ];

    await appendToSheet(CHECKIN_SPREADSHEET_ID, "All_members!A:O", [row]);
    membersCache = null;

    const created: Member = {
      member_id: nextId,
      first_name: firstName,
      surname,
      full_name: `${firstName} ${surname}`.trim(),
      role,
      level,
      pensionerStudent: "",
    };

    return NextResponse.json({ member: created });
  } catch (error) {
    console.error("Add member error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
