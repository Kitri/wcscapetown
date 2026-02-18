import { NextResponse } from 'next/server';

// First 10 "Now" tickets are sold out - hardcoded for performance
export async function GET() {
  return NextResponse.json({
    nowTierSoldOut: true,
    completedCount: 10,
    currentTier: 'now-now',
    currentPrice: {
      single: 1800,
      couple: 3600,
    },
  });
}
