import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
  if (!isNonEmptyString(data.email)) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const email = data.email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
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
    const sheetId = process.env.SHEET_ID_SKILLS_SIGNUPS;
    if (!sheetId) {
      throw new Error("Sheet ID not configured");
    }

    await appendToSheet(sheetId, "Sheet1!A:C", [
      [timestamp, email, sessionId || "unknown"]
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Skills signup error:", error);
    return NextResponse.json(
      { error: "Failed to signup" },
      { status: 500 }
    );
  }
}
