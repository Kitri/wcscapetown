import { NextResponse } from 'next/server';
import { isPartyPassSoldOut } from '@/lib/db';

export async function GET() {
  try {
    const result = await isPartyPassSoldOut();

    return NextResponse.json({
      soldOut: result.soldOut,
      completedCount: result.completedCount,
      limit: result.limit,
    });

  } catch (error) {
    console.error('Error checking party pass availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
