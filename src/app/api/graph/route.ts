import { NextRequest, NextResponse } from 'next/server';
import { generateReflectionQuestions } from '@/lib/gpt';

export async function GET() {
  try {
    // Graph data is now stored client-side
    return NextResponse.json({ nodes: [], edges: [] });
  } catch (error) {
    console.error('Error in graph API:', error);
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { beliefs, apiKey } = await request.json();
    const questions = await generateReflectionQuestions(beliefs || [], apiKey);
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating reflection questions:', error);
    return NextResponse.json({ error: 'Failed to generate reflection questions' }, { status: 500 });
  }
}
