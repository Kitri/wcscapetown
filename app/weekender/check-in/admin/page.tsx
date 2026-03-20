import { isCheckinAuthed } from '@/lib/server/checkinAuth';
import WeekenderCheckInAdminClient from './WeekenderCheckInAdminClient';

export default async function WeekenderCheckInAdminPage() {
  const initialAuthed = await isCheckinAuthed();
  return <WeekenderCheckInAdminClient initialAuthed={initialAuthed} />;
}
