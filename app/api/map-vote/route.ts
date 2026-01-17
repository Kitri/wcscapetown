import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const { zones, formats, timestamp, sessionId } = await request.json();

    // Save to Google Sheets
    const sheetId = process.env.SHEET_ID_MAP_VOTES;
    if (!sheetId) {
      throw new Error("Sheet ID not configured");
    }

    await appendToSheet(sheetId, "Sheet1!A:D", [
      [timestamp, zones.join(", "), formats?.join(", ") || "", sessionId || "unknown"]
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
