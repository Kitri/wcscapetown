import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { learning, events, email, timestamp, sessionId } = data;

    // Get IP address
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Save to Google Sheets
    const sheetId = process.env.SHEET_ID_POLL_RESPONSES;
    if (!sheetId) {
      throw new Error("Sheet ID not configured");
    }

    await appendToSheet(sheetId, "Sheet1!A:F", [
      [
        timestamp,
        learning.join(", "),
        events.join(", "),
        email || "(not provided)",
        sessionId || "unknown",
        ip,
      ],
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Poll submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
