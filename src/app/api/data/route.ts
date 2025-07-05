import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    // Data deletion is now handled client-side
    return NextResponse.json({ 
      message: 'Data deletion is now handled client-side. Use client-storage.ts clearAllData() function.' 
    });
  } catch (error) {
    console.error('Error in data API:', error);
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}
