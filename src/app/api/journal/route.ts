import { NextRequest, NextResponse } from 'next/server';
import { extractBeliefsFromText, checkForContradictions, checkForEvolution } from '@/lib/gpt';

export async function POST(request: NextRequest) {
  try {
    const { content, existingBeliefs, apiKey } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    // Generate IDs for client-side storage
    const journalEntryId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Extract beliefs using GPT
    let extractedBeliefs;
    try {
      extractedBeliefs = await extractBeliefsFromText(content, apiKey);
    } catch (error: unknown) {
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Failed to process journal entry with AI',
        journalEntry: {
          id: journalEntryId,
          content,
          created_at: new Date().toISOString(),
          processed: false
        }
      }, { status: 400 });
    }
    
    const processedBeliefs = [];
    
    for (const extractedBelief of extractedBeliefs) {
      // Check for contradictions
      const contradictionResult = await checkForContradictions(extractedBelief, existingBeliefs || [], apiKey);
      
      // Check for evolution
      const evolutionResult = await checkForEvolution(extractedBelief, existingBeliefs || [], apiKey);
      
      // Create belief data for client-side storage
      const beliefId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const belief = {
        id: beliefId,
        text: extractedBelief.text,
        confidence: extractedBelief.confidence,
        topics: extractedBelief.topics,
        belief_type: extractedBelief.belief_type,
        source: journalEntryId,
        evolved_from: evolutionResult.evolvedFromId,
        created_at: new Date().toISOString(),
        deprecated: false
      };
      
      // Create edges data for client-side storage
      const edges = [];
      
      // Create edges for contradictions
      if (contradictionResult.hasContradiction) {
        for (const contradictingId of contradictionResult.contradictingBeliefs) {
          edges.push({
            source: belief.id,
            target: contradictingId,
            relation: 'contradicts'
          });
        }
      }
      
      // Create evolution edge
      if (evolutionResult.hasEvolution && evolutionResult.evolvedFromId) {
        edges.push({
          source: belief.id,
          target: evolutionResult.evolvedFromId,
          relation: 'evolved_from'
        });
      }
      
      processedBeliefs.push({
        ...belief,
        edges,
        contradiction: contradictionResult,
        evolution: evolutionResult
      });
    }
    
    return NextResponse.json({
      journalEntry: {
        id: journalEntryId,
        content,
        created_at: new Date().toISOString(),
        processed: true
      },
      beliefs: processedBeliefs,
      message: `Extracted ${processedBeliefs.length} beliefs from your journal entry`
    });
    
  } catch (error) {
    console.error('Error processing journal entry:', error);
    return NextResponse.json({ error: 'Failed to process journal entry' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Journal entries are now stored client-side
    return NextResponse.json({ entries: [] });
  } catch (error) {
    console.error('Error in journal API:', error);
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}
