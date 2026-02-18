import { NextRequest, NextResponse } from 'next/server';
import { checkTicketAvailability, TicketAvailability } from '@/lib/redis';
import { getCompletedNowTierMemberIds } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spotCount } = body as { spotCount: number };

    if (!spotCount || (spotCount !== 1 && spotCount !== 2)) {
      return NextResponse.json(
        { error: 'Invalid spot count' },
        { status: 400 }
      );
    }

    // Get completed "now" tier member IDs from database
    const completedMemberIds = await getCompletedNowTierMemberIds();
    
    // Check availability
    const availability: TicketAvailability = await checkTicketAvailability(spotCount, completedMemberIds);

    return NextResponse.json(availability);

  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
