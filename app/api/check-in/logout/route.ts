import { NextResponse } from "next/server";
import { CHECKIN_AUTH_COOKIE_NAME } from "@/lib/server/checkinConfig";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set({
    name: CHECKIN_AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return res;
}
