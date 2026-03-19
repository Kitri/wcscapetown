import { cookies } from "next/headers";
import { PRO_PRIVATES_AUTH_COOKIE_NAME } from "./proPrivatesConfig";
export type ProViewerId = "igor" | "fernanda" | "harold" | "kristen";
export type ProViewerScope = "if" | "harold" | "kristen";
export type ProPrivatesSession =
  | { role: "admin" }
  | { role: "pro"; scope: ProViewerScope };

function parseSessionCookie(raw: string | undefined): ProPrivatesSession | null {
  if (!raw) return null;
  if (raw === "admin") return { role: "admin" };
  if (raw === "pro:if") return { role: "pro", scope: "if" };
  if (raw === "pro:harold") return { role: "pro", scope: "harold" };
  if (raw === "pro:kristen") return { role: "pro", scope: "kristen" };
  if (raw === "pro:igor" || raw === "pro:fernanda") return { role: "pro", scope: "if" }; // backwards compatibility
  if (raw === "1") return { role: "admin" }; // backwards compatibility
  return null;
}

export function serializeSessionCookie(session: ProPrivatesSession): string {
  if (session.role === "admin") return "admin";
  return `pro:${session.scope}`;
}

export function getProIdsForSession(session: ProPrivatesSession): ProViewerId[] {
  if (session.role === "admin") {
    return ["igor", "fernanda", "harold", "kristen"];
  }
  if (session.scope === "if") {
    return ["igor", "fernanda"];
  }
  return [session.scope];
}

export async function getProPrivatesSession(): Promise<ProPrivatesSession | null> {
  const jar = await cookies();
  return parseSessionCookie(jar.get(PRO_PRIVATES_AUTH_COOKIE_NAME)?.value);
}

export async function isProPrivatesAuthed(): Promise<boolean> {
  return (await getProPrivatesSession()) !== null;
}

export async function isProPrivatesAdmin(): Promise<boolean> {
  const session = await getProPrivatesSession();
  return session?.role === "admin";
}
