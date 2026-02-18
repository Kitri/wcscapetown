import AdminClient from "./AdminClient";
import { isCheckinAuthed } from "@/lib/server/checkinAuth";

export default async function AdminPage() {
  const initialAuthed = await isCheckinAuthed();
  return <AdminClient initialAuthed={initialAuthed} />;
}
