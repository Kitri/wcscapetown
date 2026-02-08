import CheckInClient from "./CheckInClient";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

export default async function CheckInPage() {
  const initialAuthed = await isCheckinAuthed();
  return <CheckInClient initialAuthed={initialAuthed} />;
}
