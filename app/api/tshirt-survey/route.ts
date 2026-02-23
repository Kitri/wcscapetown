import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";

type ShirtTypeKey = "ladies_active" | "polycotton_ladies" | "unisex";

type RequestBody = {
  timestamp: string;
  submissionId: string;
  sessionId?: string | null;
  name: string;
  email?: string | null;
  notes?: string | null;
  items: Array<{
    typeKey: ShirtTypeKey;
    colorKey: string;
    size: string;
    quantity: number;
  }>;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (
      !isNonEmptyString(body.timestamp) ||
      !isNonEmptyString(body.submissionId) ||
      !isNonEmptyString(body.name)
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const sheetId = process.env.SHEET_ID_TSHIRT_SURVEY;
    if (!sheetId) {
      throw new Error("Sheet ID not configured (SHEET_ID_TSHIRT_SURVEY)");
    }

    const name = body.name.trim();
    const email = isNonEmptyString(body.email) ? body.email.trim() : "(not provided)";
    const sessionId = isNonEmptyString(body.sessionId) ? body.sessionId : "unknown";
    const notes = isNonEmptyString(body.notes) ? body.notes.trim() : "";

    // One row per item, with a shared submissionId so you can group items together.
    // Columns (recommended):
    // Timestamp | Submission ID | Name | Email | Session ID | Type | Color | Size | Qty | Notes
    const rows: (string | number)[][] = body.items.map((item) => {
      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty < 1) {
        throw new Error("Invalid quantity");
      }

      return [
        body.timestamp,
        body.submissionId,
        name,
        email,
        sessionId,
        item.typeKey,
        item.colorKey,
        item.size,
        qty,
        notes,
      ];
    });

    await appendToSheet(sheetId, "Sheet1!A:J", rows);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tshirt survey submission error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
