import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Export is now handled client-side
    return NextResponse.json({ 
      message: 'Export is now handled client-side. Use client-storage.ts exportAllData() function.' 
    });
  } catch (error) {
    console.error('Error in export API:', error);
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}
