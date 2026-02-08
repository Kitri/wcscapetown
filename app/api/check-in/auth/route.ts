import { NextResponse } from "next/server";
import {
  CHECKIN_AUTH_COOKIE_NAME,
  CHECKIN_PASSCODE,
} from "@/lib/server/checkinConfig";

export async function POST(request: Request) {
  try {
    const { passcode } = (await request.json()) as { passcode?: string };

    if (!passcode || passcode !== CHECKIN_PASSCODE) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: CHECKIN_AUTH_COOKIE_NAME,
      value: "1",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Check-in auth error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
