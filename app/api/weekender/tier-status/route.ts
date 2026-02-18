import { NextResponse } from 'next/server';
import { isNowTierSoldOut } from '@/lib/db';

export async function GET() {
  try {
    const { soldOut, completedCount } = await isNowTierSoldOut();
    
    return NextResponse.json({
      nowTierSoldOut: soldOut,
      completedCount,
      currentTier: soldOut ? 'now-now' : 'now',
      currentPrice: {
        single: soldOut ? 1800 : 1600,
        couple: soldOut ? 3600 : 3200,
      },
    });
  } catch (error) {
    console.error('Error checking tier status:', error);
    // Default to "now" tier on error
    return NextResponse.json({
      nowTierSoldOut: false,
      completedCount: 0,
      currentTier: 'now',
      currentPrice: {
        single: 1600,
        couple: 3200,
      },
    });
  }
}
