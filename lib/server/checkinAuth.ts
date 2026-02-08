import { cookies } from "next/headers";
import { CHECKIN_AUTH_COOKIE_NAME } from "./checkinConfig";

export async function isCheckinAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(CHECKIN_AUTH_COOKIE_NAME)?.value === "1";
}
