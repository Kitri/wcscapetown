import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseStringArray(value: unknown): { ok: true; value: string[] } | { ok: false } {
  if (value === undefined || value === null) {
    return { ok: true, value: [] };
  }

  if (!Array.isArray(value)) {
    return { ok: false };
  }

  const parsed: string[] = [];
  for (const entry of value) {
    if (!isNonEmptyString(entry)) {
      return { ok: false };
    }
    parsed.push(entry.trim());
  }

  return { ok: true, value: parsed };
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;
  const zonesResult = parseStringArray(data.zones);
  const formatsResult = parseStringArray(data.formats);

  if (!zonesResult.ok || !formatsResult.ok) {
    return NextResponse.json(
      { error: "Zones and formats must be arrays of non-empty strings" },
      { status: 400 }
    );
  }

  const zones = zonesResult.value;
  const formats = formatsResult.value;

  if (zones.length === 0 && formats.length === 0) {
    return NextResponse.json(
      { error: "Select at least one zone or learning format" },
      { status: 400 }
    );
  }

  let timestamp = new Date().toISOString();
  if (data.timestamp !== undefined && data.timestamp !== null && data.timestamp !== "") {
    if (!isNonEmptyString(data.timestamp)) {
      return NextResponse.json({ error: "Invalid timestamp format" }, { status: 400 });
    }

    const parsed = Date.parse(data.timestamp);
    if (Number.isNaN(parsed)) {
      return NextResponse.json({ error: "Invalid timestamp format" }, { status: 400 });
    }

    timestamp = new Date(parsed).toISOString();
  }

  const sessionId = isNonEmptyString(data.sessionId)
    ? data.sessionId.trim().slice(0, 128)
    : "unknown";
  try {

    // Save to Google Sheets
    const sheetId = process.env.SHEET_ID_MAP_VOTES;
    if (!sheetId) {
      throw new Error("Sheet ID not configured");
    }

    await appendToSheet(sheetId, "Sheet1!A:D", [
      [timestamp, zones.join(", "), formats.join(", "), sessionId || "unknown"]
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Map vote error:", error);
    return NextResponse.json(
      { error: "Failed to log vote" },
      { status: 500 }
    );
  }
}
