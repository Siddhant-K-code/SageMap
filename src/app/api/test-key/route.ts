import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ valid: false, error: 'API key is required' }, { status: 400 });
    }

    // Test the API key by making a simple request
    const openai = new OpenAI({ apiKey });
    
    try {
      await openai.models.list();
      return NextResponse.json({ valid: true, message: 'API key is valid' });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('API key test failed:', error);
      
      if (error.status === 401) {
        return NextResponse.json({ valid: false, error: 'Invalid API key' });
      } else if (error.status === 429) {
        return NextResponse.json({ valid: false, error: 'Rate limit exceeded' });
      } else {
        return NextResponse.json({ valid: false, error: 'API key test failed' });
      }
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    return NextResponse.json({ valid: false, error: 'Failed to test API key' }, { status: 500 });
  }
}
