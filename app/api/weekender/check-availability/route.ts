import { NextResponse } from 'next/server';

// First 10 "Now" tickets are sold out - everyone gets "Now-Now" pricing
export async function POST() {
  return NextResponse.json({
    tier: 'now-now',
    spotsRemaining: 0,
    message: '',
    canProceed: true,
  });
}
