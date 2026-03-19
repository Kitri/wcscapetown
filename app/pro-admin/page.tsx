import ProAdminClient from "./ProAdminClient";
import { isProPrivatesAuthed } from "@/lib/server/proPrivatesAuth";

export default async function ProAdminPage() {
  const initialAuthed = await isProPrivatesAuthed();
  return <ProAdminClient initialAuthed={initialAuthed} />;
}
