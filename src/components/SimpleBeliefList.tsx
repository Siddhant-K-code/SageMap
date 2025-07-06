'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BeliefNode } from './BeliefNode';

import { Network, List, Loader2 } from 'lucide-react';
import { getBeliefs, updateBelief } from '@/lib/client-storage';

interface Belief {
  id: string;
  text: string;
  confidence: number;
  topics: string[];
  belief_type: 'core' | 'assumption' | 'derived';
  source: string;
  evolved_from?: string;
  created_at: string;
  deprecated?: boolean;
}

export function SimpleBeliefList() {
  const [beliefs, setBeliefs] = useState<Belief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeliefs();
  }, []);

  const fetchBeliefs = async () => {
    try {
      // Get beliefs from localStorage instead of API
      const beliefs = getBeliefs();
      setBeliefs(beliefs);
    } catch (error) {
      console.error('Error fetching beliefs:', error);
      // Could add a toast here if needed
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBelief = async (id: string, updates: Partial<Belief>) => {
    try {
      // Update belief in localStorage instead of API
      updateBelief(id, updates);
      fetchBeliefs(); // Refresh the list
    } catch (error) {
      console.error('Error updating belief:', error);
    }
  };

  const groupedBeliefs = beliefs.reduce((acc, belief) => {
    if (!acc[belief.belief_type]) {
      acc[belief.belief_type] = [];
    }
    acc[belief.belief_type].push(belief);
    return acc;
  }, {} as Record<string, Belief[]>);

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Your Beliefs ({beliefs.length})
          </CardTitle>
          <p className="text-sm text-gray-600">
            All your beliefs organized by type. Click on beliefs to explore connections.
          </p>
        </CardHeader>
        <CardContent>
          {beliefs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No beliefs yet</p>
              <p className="text-sm">Add some journal entries to see your beliefs here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedBeliefs).map(([type, typeBeliefs]) => (
                <div key={type} className="space-y-3">
                  <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'core' ? 'bg-blue-500' :
                      type === 'assumption' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    {type} Beliefs ({typeBeliefs.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {typeBeliefs.map((belief) => (
                      <BeliefNode
                        key={belief.id}
                        belief={belief}
                        onUpdate={handleUpdateBelief}
                        showDetails={true}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
