import { NextRequest, NextResponse } from 'next/server';
import { validateWeekenderByName, validateWeekenderByOrderId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, surname, orderId } = body as {
      name?: string;
      surname?: string;
      orderId?: string;
    };

    // Validate by order ID if provided
    if (orderId) {
      const result = await validateWeekenderByOrderId(orderId);
      return NextResponse.json({
        valid: result.valid,
        method: 'orderId',
      });
    }

    // Validate by name and surname
    if (name && surname) {
      const result = await validateWeekenderByName(name, surname);
      return NextResponse.json({
        valid: result.valid,
        method: 'name',
      });
    }

    return NextResponse.json(
      { error: 'Either orderId or both name and surname are required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error validating weekender:', error);
    return NextResponse.json(
      { error: 'Failed to validate weekender registration' },
      { status: 500 }
    );
  }
}
