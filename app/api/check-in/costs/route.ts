import { NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { isZaFirstMonday, formatZaDateISO } from "@/lib/zaDate";
import { CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

const ALLOWED_TYPE_CANONICAL: Record<string, string> = {
  "standard entry": "Standard entry",
  pensioner: "Pensioner",
  student: "Student",
  monthly: "Monthly",
  "pensioner monthly": "Pensioner monthly",
  "student monthly": "Student monthly",
};

function normalizeType(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function parsePrice(raw: string): number {
  // supports "100", "R100", "R 100", "100.00"
  const cleaned = raw.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  try {
    if (!(await isCheckinAuthed())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read full columns (includes header row); skip any header-like rows ourselves.
    const values = await getSheetValues(CHECKIN_SPREADSHEET_ID, "Costs!A:B");

    const costs: Record<string, number> = {};
    for (const [typeRaw, priceRaw] of values) {
      const typeNorm = normalizeType(typeRaw ?? "");
      if (!typeNorm || typeNorm === "type") continue;

      const canonical = ALLOWED_TYPE_CANONICAL[typeNorm];
      if (!canonical) continue;

      costs[canonical] = parsePrice(priceRaw ?? "");
    }

    return NextResponse.json({
      today: formatZaDateISO(),
      isFirstMonday: isZaFirstMonday(),
      costs,
    });
  } catch (error) {
    console.error("Check-in costs error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
