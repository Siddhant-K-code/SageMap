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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Belief Visualization</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Button
              variant={viewMode === 'simple' ? 'default' : 'outline'}
              onClick={() => setViewMode('simple')}
              className="flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Simple Graph</span>
              <span className="sm:hidden">Simple</span>
            </Button>
            <Button
              variant={viewMode === 'advanced' ? 'default' : 'outline'}
              onClick={() => setViewMode('advanced')}
              className="flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Graph</span>
              <span className="sm:hidden">Advanced</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
              <span className="sm:hidden">List</span>
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
