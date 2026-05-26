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

  const name = isNonEmptyString(data.name) ? data.name.trim().slice(0, 100) : "";
  const experience = isNonEmptyString(data.experience) ? data.experience.trim().slice(0, 100) : "";
  const comments = isNonEmptyString(data.comments) ? data.comments.trim().slice(0, 1000) : "";
  const timestamp = new Date().toISOString();

  const sheetId = process.env.SHEET_ID_PINELANDS_INTEREST;
  if (!sheetId) {
    return NextResponse.json({ error: "Sheet not configured" }, { status: 500 });
  }

  try {
    await appendToSheet(sheetId, "Sheet1!A:E", [
      [timestamp, name, email, experience, comments],
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pinelands interest signup error:", error);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
