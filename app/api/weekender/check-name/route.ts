import { NextRequest, NextResponse } from 'next/server';
import { hasWeekenderRegistration } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, surname } = body;

    if (!name || !surname) {
      return NextResponse.json(
        { error: 'Name and surname are required' },
        { status: 400 }
      );
    }

    const isRegistered = await hasWeekenderRegistration(name.trim(), surname.trim());

    return NextResponse.json({
      isRegistered,
      name: name.trim(),
      surname: surname.trim(),
    });

  } catch (error) {
    console.error('Error checking name:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
}
