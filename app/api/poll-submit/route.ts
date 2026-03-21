import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseOptionalTimestamp(value: unknown): { ok: true; value: string } | { ok: false } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: new Date().toISOString() };
  }

  if (!isNonEmptyString(value)) {
    return { ok: false };
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return { ok: false };
  }

  return { ok: true, value: new Date(parsed).toISOString() };
}

function parseOptionalStringArray(value: unknown): { ok: true; value: string[] } | { ok: false } {
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
  const interest = isNonEmptyString(data.interest) ? data.interest.trim() : "";
  const learningResult = parseOptionalStringArray(data.learning);
  const eventsResult = parseOptionalStringArray(data.events);

  if (!learningResult.ok || !eventsResult.ok) {
    return NextResponse.json(
      { error: "Learning and events must be arrays of non-empty strings" },
      { status: 400 }
    );
  }

  const learning = learningResult.value;
  const events = eventsResult.value;

  if (!interest && learning.length === 0 && events.length === 0) {
    return NextResponse.json(
      { error: "Select at least one poll option before submitting" },
      { status: 400 }
    );
  }

  let email = "(not provided)";
  if (data.email !== undefined && data.email !== null && data.email !== "") {
    if (!isNonEmptyString(data.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    email = normalizedEmail;
  }

  const timestampResult = parseOptionalTimestamp(data.timestamp);
  if (!timestampResult.ok) {
    return NextResponse.json({ error: "Invalid timestamp format" }, { status: 400 });
  }

  const sessionId = isNonEmptyString(data.sessionId)
    ? data.sessionId.trim().slice(0, 128)
    : "unknown";
  try {

    // Save to Google Sheets
    const sheetId = process.env.SHEET_ID_POLL_RESPONSES;
    if (!sheetId) {
      throw new Error("Sheet ID not configured");
    }

    // If it's a weekender poll submission (has 'interest' field)
    if (interest) {
      await appendToSheet(sheetId, "Sheet1!A:D", [
        [
          timestampResult.value,
          interest,
          email,
          sessionId || "unknown",
        ],
      ]);
    } else {
      // Legacy poll format (learning + events)
      await appendToSheet(sheetId, "Sheet1!A:E", [
        [
          timestampResult.value,
          learning.join(", "),
          events.join(", "),
          email,
          sessionId || "unknown",
        ],
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Poll submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
