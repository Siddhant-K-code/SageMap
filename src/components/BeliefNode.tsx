'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Belief } from '@/lib/client-storage';
import { Calendar, Link2, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BeliefNodeProps {
  belief: Belief;
  onUpdate?: (id: string, updates: Partial<Belief>) => void;
  showDetails?: boolean;
  connectedBeliefs?: string[];
}

export function BeliefNode({ belief, onUpdate, showDetails = false, connectedBeliefs = [] }: BeliefNodeProps) {
  const router = useRouter();

  const handleConfidenceChange = (value: number[]) => {
    if (onUpdate) {
      onUpdate(belief.id, { confidence: value[0] });
    }
  };

  const handleViewInGraph = () => {
    router.push(`/graph?highlight=${belief.id}`);
  };

  const handleReflectMore = () => {
    // Pre-fill journal with a reflection prompt about this belief
    const reflectionPrompt = `I want to reflect more on my belief that "${belief.text}". `;
    router.push(`/journal?prompt=${encodeURIComponent(reflectionPrompt)}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'assumption': return 'bg-yellow-100 text-yellow-800';
      case 'derived': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 8) return 'text-green-600';
    if (confidence >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`w-full ${belief.deprecated ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium leading-tight">
            {belief.text}
          </CardTitle>
          {belief.deprecated && (
            <Badge variant="secondary" className="ml-2">
              Deprecated
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge className={getTypeColor(belief.belief_type)}>
            {belief.belief_type}
          </Badge>
          <span className={`text-sm font-medium ${getConfidenceColor(belief.confidence)}`}>
            {belief.confidence}/10
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Confidence Slider */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">
              Confidence Level
            </label>
            <Slider
              value={[belief.confidence]}
              onValueChange={handleConfidenceChange}
              max={10}
              min={1}
              step={1}
              className="w-full"
              disabled={!onUpdate}
            />
          </div>
          
          {/* Topics */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Topics</label>
            <div className="flex flex-wrap gap-1">
              {belief.topics.map((topic, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(belief.created_at).toLocaleDateString()}
            </div>
            {connectedBeliefs.length > 0 && (
              <div className="flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {connectedBeliefs.length} connected
              </div>
            )}
          </div>
          
          {/* Evolution indicator */}
          {belief.evolved_from && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <TrendingUp className="w-3 h-3" />
              Evolved from previous belief
            </div>
          )}
          
          {showDetails && (
            <div className="pt-2 border-t space-y-2">
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                💡 <strong>What you can do:</strong> Adjust confidence, explore connections in the graph, or reflect on how this belief impacts your decisions.
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 cursor-pointer"
                  onClick={handleViewInGraph}
                >
                  View in Graph
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 cursor-pointer"
                  onClick={handleReflectMore}
                >
                  Reflect More
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
