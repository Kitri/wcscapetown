import { NextResponse } from 'next/server';

// First 10 "Now" tickets are sold out and "Now-Now" has ended - hardcoded for performance
export async function GET() {
  return NextResponse.json({
    nowTierSoldOut: true,
    completedCount: 10,
    currentTier: 'just-now',
    currentPrice: {
      single: 2200,
      couple: 4400,
    },
  });
}
