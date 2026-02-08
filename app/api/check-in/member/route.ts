import { NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { CHECKIN_SPREADSHEET_ID } from "@/lib/server/checkinConfig";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

function parseMemberId(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  const id = Number(digits);
  return Number.isFinite(id) ? id : NaN;
}

export async function GET(request: Request) {
  try {
    if (!(await isCheckinAuthed())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberIdRaw = searchParams.get("member_id") ?? "";
    const member_id = parseMemberId(memberIdRaw);

    if (!Number.isFinite(member_id)) {
      return NextResponse.json({ error: "Invalid member_id" }, { status: 400 });
    }

    const rows = await getSheetValues(CHECKIN_SPREADSHEET_ID, "All_members!A:O");

    for (const row of rows) {
      const firstCell = (row[0] ?? "").trim().toLowerCase();
      if (!firstCell || firstCell === "member_id") continue;

      const id = parseMemberId(row[0] ?? "");
      if (!Number.isFinite(id) || id !== member_id) continue;

      const first_name = (row[1] ?? "").trim();
      const surname = (row[2] ?? "").trim();
      const role = (row[3] ?? "").trim();
      const level = (row[4] ?? "").trim();
      const pensionerStudent = (row[5] ?? "").trim();

      return NextResponse.json({
        member: {
          member_id: id,
          first_name,
          surname,
          full_name: `${first_name} ${surname}`.trim(),
          role,
          level,
          pensionerStudent,
        },
      });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Member lookup error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
