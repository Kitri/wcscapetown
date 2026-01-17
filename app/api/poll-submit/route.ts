import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { interest, learning, events, email, timestamp, sessionId } = data;

    // Save to Google Sheets
    const sheetId = process.env.SHEET_ID_POLL_RESPONSES;
    if (!sheetId) {
      throw new Error("Sheet ID not configured");
    }

    // If it's a weekender poll submission (has 'interest' field)
    if (interest) {
      await appendToSheet(sheetId, "Sheet1!A:D", [
        [
          timestamp,
          interest,
          email || "(not provided)",
          sessionId || "unknown",
        ],
      ]);
    } else {
      // Legacy poll format (learning + events)
      await appendToSheet(sheetId, "Sheet1!A:E", [
        [
          timestamp,
          learning.join(", "),
          events.join(", "),
          email || "(not provided)",
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
