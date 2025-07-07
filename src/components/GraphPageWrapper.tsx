'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BeliefGraph } from '@/components/BeliefGraph';
import { SimpleBeliefList } from '@/components/SimpleBeliefList';
import { SimpleGraphVisualization } from '@/components/SimpleGraphVisualization';
import { Button } from '@/components/ui/button';
import { Network, List, Zap } from 'lucide-react';

export function GraphPageWrapper() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'simple' | 'advanced' | 'list'>('simple');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedNode(highlight);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Belief Visualization</h1>
            <p className="text-sm text-gray-600 mt-1">
              Explore how your beliefs connect, influence each other, and form patterns in your thinking
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Button
              variant={viewMode === 'simple' ? 'default' : 'outline'}
              onClick={() => setViewMode('simple')}
              className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Simple Graph</span>
              <span className="sm:hidden">Simple</span>
            </Button>
            <Button
              variant={viewMode === 'advanced' ? 'default' : 'outline'}
              onClick={() => setViewMode('advanced')}
              className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer"
            >
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Graph</span>
              <span className="sm:hidden">Advanced</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
              <span className="sm:hidden">List</span>
            </Button>
          </div>
        </div>

        {/* Graph Benefits Explanation */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-2">🧠 Why Visualize Your Beliefs?</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-gray-600">
            <div>
              <strong>• Discover Patterns:</strong> See which beliefs cluster together and which ones stand alone
            </div>
            <div>
              <strong>• Find Contradictions:</strong> Spot beliefs that might conflict with each other
            </div>
            <div>
              <strong>• Track Evolution:</strong> Watch how your thinking changes and develops over time
            </div>
          </div>
        </div>
        
        {viewMode === 'simple' ? (
          <SimpleGraphVisualization highlightedNode={highlightedNode} />
        ) : viewMode === 'advanced' ? (
          <BeliefGraph highlightedNode={highlightedNode} />
        ) : (
          <SimpleBeliefList highlightedNode={highlightedNode} />
        )}
      </div>
    </div>
  );
}
