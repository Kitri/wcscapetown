import { NextRequest, NextResponse } from 'next/server';
import { isCheckinAuthed } from '@/lib/server/checkinAuth';
import { listWeekenderCheckIns } from '@/lib/weekenderCheckIn';

export async function GET(request: NextRequest) {
  if (!(await isCheckinAuthed())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const q = String(request.nextUrl.searchParams.get('q') ?? '').trim();
    const items = await listWeekenderCheckIns(q);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Weekender admin check-in list error:', error);
    return NextResponse.json(
      { error: 'Failed to load check-in list.' },
      { status: 500 }
    );
  }
}
