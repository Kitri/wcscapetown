import { NextResponse } from "next/server";
import {
  getProIdsForSession,
  getProPrivatesSession,
} from "@/lib/server/proPrivatesAuth";
import {
  buildPrivateLessonsDashboardData,
  ProId,
} from "@/lib/server/proPrivatesSchedule";

export async function GET() {
  try {
    const session = await getProPrivatesSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await buildPrivateLessonsDashboardData();
    if (session.role === "admin") {
      return NextResponse.json({ ...data, viewer: session });
    }
    const proIds = getProIdsForSession(session) as ProId[];
    const schedules = proIds.reduce(
      (acc, proId) => ({
        ...acc,
        [proId]: data.schedules[proId],
      }),
      {} as Partial<Record<ProId, (typeof data.schedules)[ProId]>>
    );
    return NextResponse.json({
      ...data,
      viewer: { ...session, proIds },
      pros: data.pros.filter((pro) => proIds.includes(pro.proId)),
      schedules,
    });
  } catch (error) {
    console.error("Private lessons schedule error:", error);
    const message =
      error instanceof Error && /permission|forbidden|403/i.test(error.message)
        ? "Google Sheet access denied. Please share the private lessons sheet with the configured service account."
        : "Failed to load private lessons schedule.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
