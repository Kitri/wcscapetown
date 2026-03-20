import { NextRequest, NextResponse } from 'next/server';
import { isCheckinAuthed } from '@/lib/server/checkinAuth';
import { listWeekenderPartyCheckIns } from '@/lib/weekenderCheckIn';

export async function GET(request: NextRequest) {
  if (!(await isCheckinAuthed())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const q = String(request.nextUrl.searchParams.get('q') ?? '').trim();
    const items = await listWeekenderPartyCheckIns(q);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Weekender admin party check-in list error:', error);
    return NextResponse.json(
      { error: 'Failed to load Friday party check-in list.' },
      { status: 500 }
    );
  }
}
