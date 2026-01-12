import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const { email, timestamp, sessionId } = await request.json();

    // Get IP address
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Save to Google Sheets
    const sheetId = process.env.SHEET_ID_SKILLS_SIGNUPS;
    if (!sheetId) {
      throw new Error("Sheet ID not configured");
    }

    await appendToSheet(sheetId, "Sheet1!A:D", [
      [timestamp, email, sessionId || "unknown", ip]
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
