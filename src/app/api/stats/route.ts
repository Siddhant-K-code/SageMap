import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Stats are now calculated client-side
    return NextResponse.json({
      totalBeliefs: 0,
      totalJournalEntries: 0,
      totalConnections: 0,
      details: {
        beliefTypes: {
          core: 0,
          assumption: 0,
          derived: 0,
        },
        connectionTypes: {
          contradicts: 0,
          reinforces: 0,
          evolved_from: 0,
        }
      }
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}
