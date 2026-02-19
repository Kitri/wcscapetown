import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationByOrderId } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const registration = await getRegistrationByOrderId(orderId);

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ registration });
  } catch (error) {
    console.error('Error fetching registration details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration details' },
      { status: 500 }
    );
  }
}
