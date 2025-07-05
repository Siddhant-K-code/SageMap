import { NextRequest, NextResponse } from 'next/server';

// Note: With client-side storage, beliefs are managed in localStorage
// These endpoints are kept for API compatibility but return empty data
// since all operations now happen client-side

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Client-side storage - return placeholder
      return NextResponse.json({ 
        message: 'Beliefs are now stored client-side. Use client-storage.ts functions.' 
      });
    }
    
    // Return empty array - client will use localStorage
    return NextResponse.json({ beliefs: [] });
  } catch (error) {
    console.error('Error in beliefs API:', error);
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}

export async function PUT() {
  try {
    // Client-side storage - operations happen in browser
    return NextResponse.json({ 
      message: 'Beliefs are now stored client-side. Use client-storage.ts functions.' 
    });
  } catch (error) {
    console.error('Error in beliefs API:', error);
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}
