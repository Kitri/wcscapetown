import { NextResponse } from "next/server";
import {
  PRO_PRIVATES_AUTH_COOKIE_NAME,
  PRO_PRIVATES_HAROLD_PASSCODE,
  PRO_PRIVATES_IF_PASSCODE,
  PRO_PRIVATES_KRISTEN_PASSCODE,
  PRO_PRIVATES_PASSCODE,
  PRO_PRIVATES_PRO_SESSION_MAX_AGE,
} from "@/lib/server/proPrivatesConfig";
import {
  ProViewerScope,
  serializeSessionCookie,
} from "@/lib/server/proPrivatesAuth";

type LoginPayload = {
  passcode?: string;
  user?: string;
};

export async function POST(request: Request) {
  try {
    const { passcode, user } = (await request.json()) as LoginPayload;
    const normalizedUser = String(user ?? "admin").trim().toLowerCase();

    if (!passcode) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    let session:
      | { role: "admin" }
      | { role: "pro"; scope: ProViewerScope };

    if (normalizedUser === "admin") {
      if (passcode !== PRO_PRIVATES_PASSCODE) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
      session = { role: "admin" };
    } else if (normalizedUser === "if") {
      if (passcode !== PRO_PRIVATES_IF_PASSCODE) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
      session = { role: "pro", scope: "if" };
    } else if (normalizedUser === "harold") {
      if (passcode !== PRO_PRIVATES_HAROLD_PASSCODE) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
      session = { role: "pro", scope: "harold" };
    } else if (normalizedUser === "kristen") {
      if (passcode !== PRO_PRIVATES_KRISTEN_PASSCODE) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
      session = { role: "pro", scope: "kristen" };
    } else {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true, session });
    res.cookies.set({
      name: PRO_PRIVATES_AUTH_COOKIE_NAME,
      value: serializeSessionCookie(session),
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: session.role === "admin" ? 60 * 60 * 12 : PRO_PRIVATES_PRO_SESSION_MAX_AGE,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Private lessons auth error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
