'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { BeliefNode } from './BeliefNode';
import { Loader2, PenTool, Brain, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getBeliefs, createJournalEntry, createBelief, createEdge } from '@/lib/client-storage';

interface ProcessedBelief {
  id: string;
  text: string;
  confidence: number;
  topics: string[];
  belief_type: 'core' | 'assumption' | 'derived';
  source: string;
  evolved_from?: string;
  created_at: string;
  deprecated?: boolean;
  contradiction?: {
    hasContradiction: boolean;
    contradictingBeliefs: string[];
    explanation: string;
  };
  evolution?: {
    hasEvolution: boolean;
    evolvedFromId?: string;
    explanation: string;
  };
}

export function Journal() {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBeliefs, setProcessedBeliefs] = useState<ProcessedBelief[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    // Get API key from localStorage (optional for Azure OpenAI version)
    const apiKey = localStorage.getItem('user_openai_key');

    // Get existing beliefs for contradiction/evolution checking
    const existingBeliefs = getBeliefs();

    setIsProcessing(true);
    setShowResults(false);

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          existingBeliefs,
          apiKey
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to process journal entry');
      }

      const result = await response.json();

      // Save the journal entry and beliefs to localStorage
      if (result.journalEntry) {
        createJournalEntry(result.journalEntry.content);
      }

      if (result.beliefs) {
        // First, create all beliefs and map their IDs
        const tempToRealIdMap = new Map();
        const createdBeliefs = [];
        
        for (const belief of result.beliefs) {
          const createdBelief = createBelief({
            text: belief.text,
            confidence: belief.confidence,
            topics: belief.topics,
            belief_type: belief.belief_type,
            source: belief.source,
            evolved_from: belief.evolved_from
          });
          
          tempToRealIdMap.set(belief.id, createdBelief.id);
          createdBeliefs.push({ ...belief, realId: createdBelief.id });
        }

        // Then create edges with correct IDs
        for (const belief of createdBeliefs) {
          if (belief.edges) {
            for (const edge of belief.edges) {
              const realSourceId = tempToRealIdMap.get(edge.source) || edge.source;
              const realTargetId = tempToRealIdMap.get(edge.target) || edge.target;
              
              createEdge({
                source: realSourceId,
                target: realTargetId,
                relation: edge.relation
              });
            }
          }
        }
      }

      setProcessedBeliefs(result.beliefs || []);
      setShowResults(true);
      setContent('');

      toast.success(result.message || 'Journal entry processed successfully');
      
      // Trigger update event for other components
      window.dispatchEvent(new CustomEvent('localStorageUpdate'));
    } catch (error) {
      console.error('Error processing journal entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process journal entry';

      if (errorMessage.includes('API key')) {
        toast.error('OpenAI API key issue. Please check your API key in Settings.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestedThoughts = [
    "Social media is ruining our ability to think critically",
    "Tech influencers are fake AF!!",
    "Most people are sheep following trends without thinking",
    "Money can absolutely buy happiness",
    "College is a scam for most people",
    "Networking is just using people for personal gain",
    "Cancel culture has gone too far",
    "Everyone is too sensitive these days",
    "Bashing Hustle culture is just a reason to be lazy",
    "Most people don't really care about your problems",
    "People only care about you as long as you're useful to them",
    "Success is more about inner peace than external recognition",
    "You can't trust anyone completely",
  ];

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Journal Entry
          </CardTitle>
          <p className="text-sm text-gray-600">
            Write about your thoughts, experiences, or reflect on your beliefs.
            AI will extract and analyze your belief statements.
          </p>
        </CardHeader>
        <CardContent>
          {/* API Key Status - Disabled for Azure OpenAI public version */}
          {/* {!hasApiKey && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">No API Key Configured</p>
                  <p className="mt-1">
                    Please add your own OpenAI API key in{' '}
                    <a href="/settings" className="font-medium underline hover:no-underline">
                      Settings
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          )} */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, experiences, or reflect on your beliefs..."
              className="min-h-[200px] resize-none"
              disabled={isProcessing}
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-sm text-gray-500">
                {content.length} characters
              </span>
              <Button
                type="submit"
                disabled={isProcessing || !content.trim()}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Extract Beliefs
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Suggested Prompts */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              Need inspiration? Try these:
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedThoughts.map((thought) => (
                <Button
                  key={thought}
                  variant="outline"
                  size="sm"
                  className="text-xs break-words"
                  onClick={() => setContent(`I think ${thought.toLowerCase()}. Here's why...`)}
                  disabled={isProcessing}
                >
                  {thought}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Extracted Beliefs ({processedBeliefs.length})
            </CardTitle>
            <p className="text-sm text-gray-600">
              Here are the beliefs extracted from your journal entry:
            </p>
          </CardHeader>
          <CardContent>
            {processedBeliefs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No clear beliefs were extracted from your entry.</p>
                <p className="text-sm">Try writing about your opinions, values, or experiences.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {processedBeliefs.map((belief) => (
                  <div key={belief.id} className="space-y-2">
                    <BeliefNode
                      belief={belief}
                      showDetails={true}
                    />

                    {/* Contradiction Alert */}
                    {belief.contradiction?.hasContradiction && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Potential Contradiction Detected
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              {belief.contradiction.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Evolution Alert */}
                    {belief.evolution?.hasEvolution && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Belief Evolution Detected
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              {belief.evolution.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
