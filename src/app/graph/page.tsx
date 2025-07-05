'use client';

import { useState } from 'react';
import { BeliefGraph } from '@/components/BeliefGraph';
import { SimpleBeliefList } from '@/components/SimpleBeliefList';
import { SimpleGraphVisualization } from '@/components/SimpleGraphVisualization';
import { Button } from '@/components/ui/button';
import { Network, List, Zap } from 'lucide-react';

export default function GraphPage() {
  const [viewMode, setViewMode] = useState<'simple' | 'advanced' | 'list'>('simple');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Belief Visualization</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'simple' ? 'default' : 'outline'}
              onClick={() => setViewMode('simple')}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Simple Graph
            </Button>
            <Button
              variant={viewMode === 'advanced' ? 'default' : 'outline'}
              onClick={() => setViewMode('advanced')}
              className="flex items-center gap-2"
            >
              <Network className="w-4 h-4" />
              Advanced Graph
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              List View
            </Button>
          </div>
        </div>
        
        {viewMode === 'simple' ? (
          <SimpleGraphVisualization />
        ) : viewMode === 'advanced' ? (
          <BeliefGraph />
        ) : (
          <SimpleBeliefList />
        )}
      </div>
    </div>
  );
}
