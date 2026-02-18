import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

// This endpoint initializes the database tables
// Run once manually or during deployment
export async function POST() {
  try {
    await initializeDatabase();
    
    console.log('✅ Database tables initialized');
    
    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}
