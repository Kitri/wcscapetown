import { NextResponse } from 'next/server';

// First 10 "Now" tickets are sold out and "Now-Now" has ended - everyone gets "Just-now" pricing
export async function POST() {
  return NextResponse.json({
    tier: 'just-now',
    spotsRemaining: 0,
    message: '',
    canProceed: true,
  });
}
