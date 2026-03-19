import { NextResponse } from "next/server";
import { isProPrivatesAdmin } from "@/lib/server/proPrivatesAuth";
import {
  appendPrivateLessonBooking,
  deletePrivateLessonBooking,
  isProId,
  normalizeDateKey,
  normalizeTimeHHMM,
  updatePrivateLessonBooking,
} from "@/lib/server/proPrivatesSchedule";

type Payload = {
  rowNumber?: number;
  proId?: string;
  dateKey?: string;
  startTime?: string;
  durationMinutes?: number;
  studentName?: string;
  partnerName?: string;
  notes?: string;
};

function isValidDuration(dateKey: string, durationMinutes: number): boolean {
  const [, month, day] = dateKey.split("-").map((part) => Number(part));
  const isException = month === 3 && (day === 21 || day === 22);

  if (isException) {
    return durationMinutes === 45 || durationMinutes === 60;
  }
  return durationMinutes === 60;
}
function parseAndValidatePayload(body: Payload) {
  const rawProId = String(body.proId ?? "").trim().toLowerCase();
  const dateKey = normalizeDateKey(String(body.dateKey ?? "").trim());
  const startTime = normalizeTimeHHMM(String(body.startTime ?? "").trim());
  const durationMinutes = Number(body.durationMinutes ?? NaN);
  const studentName = String(body.studentName ?? "").trim();
  const partnerName = String(body.partnerName ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (!isProId(rawProId)) {
    return { error: "Invalid pro selected." } as const;
  }
  if (!dateKey) {
    return { error: "Invalid booking date." } as const;
  }
  if (!startTime) {
    return { error: "Invalid booking start time." } as const;
  }
  if (!Number.isFinite(durationMinutes) || !isValidDuration(dateKey, durationMinutes)) {
    return { error: "Invalid booking duration for the selected date." } as const;
  }
  if (!studentName) {
    return { error: "Student name is required." } as const;
  }

  return {
    data: {
      proId: rawProId,
      dateKey,
      startTime,
      durationMinutes,
      studentName,
      partnerName,
      notes,
    },
  } as const;
}
function buildErrorMessage(error: unknown): string {
  if (error instanceof Error && /permission|forbidden|403/i.test(error.message)) {
    return "Google Sheet access denied. Please share the private lessons sheet with the configured service account.";
  }
  return error instanceof Error ? error.message : "Failed to save booking.";
}

export async function POST(request: Request) {
  try {
    if (!(await isProPrivatesAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Payload;
    const parsed = parseAndValidatePayload(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await appendPrivateLessonBooking(parsed.data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Private lessons booking error:", error);
    const message = buildErrorMessage(error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isProPrivatesAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Payload;
    const rowNumber = Number(body.rowNumber ?? NaN);
    if (!Number.isFinite(rowNumber) || rowNumber < 2) {
      return NextResponse.json({ error: "Invalid booking row number." }, { status: 400 });
    }

    const parsed = parseAndValidatePayload(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await updatePrivateLessonBooking({
      rowNumber,
      ...parsed.data,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Private lessons update error:", error);
    const message = buildErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isProPrivatesAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Payload;
    const rowNumber = Number(body.rowNumber ?? NaN);
    if (!Number.isFinite(rowNumber) || rowNumber < 2) {
      return NextResponse.json({ error: "Invalid booking row number." }, { status: 400 });
    }

    await deletePrivateLessonBooking(rowNumber);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Private lessons unbook error:", error);
    const message = buildErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
