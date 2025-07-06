'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GraphNode {
  id: string;
  label: string;
  confidence: number;
  topics: string[];
  type: string;
  deprecated: boolean;
  created_at: string;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface SimpleBeliefGraphProps {
  onNodeClick?: (node: GraphNode) => void;
}

export function SimpleBeliefGraph({ onNodeClick }: SimpleBeliefGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/graph');
      if (!response.ok) throw new Error('Failed to fetch graph data');
      
      const data = await response.json();
      setGraphData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching graph data:', err);
      setError('Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-500';
      case 'assumption': return 'bg-yellow-500';
      case 'derived': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRelationColor = (relation: string) => {
    switch (relation) {
      case 'contradicts': return 'border-red-500';
      case 'reinforces': return 'border-green-500';
      case 'evolved_from': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading belief graph...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={fetchGraphData} variant="outline" size="sm" className="cursor-pointer">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Belief Network
            </CardTitle>
            <Button onClick={fetchGraphData} variant="outline" size="sm" className="cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Your beliefs organized by topic and type. Click on any belief to explore connections.
          </p>
        </CardHeader>
        
        <CardContent>
          {graphData.nodes.length === 0 ? (
            <div className="text-center py-8">
              <Network className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No beliefs found</p>
              <p className="text-sm text-gray-400 mt-2">
                Start by adding a journal entry to see your belief network
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Belief Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {graphData.nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
                    } ${node.deprecated ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(node.type)} flex-shrink-0 mt-1`}></div>
                      <div className="flex-1 ml-2">
                        <p className="text-sm font-medium line-clamp-2">{node.label}</p>
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {node.confidence}/10
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {node.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {node.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{node.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {new Date(node.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connections Summary */}
              {graphData.edges.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Connections ({graphData.edges.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {graphData.edges.map((edge, index) => {
                      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
                      const targetNode = graphData.nodes.find(n => n.id === edge.target);
                      
                      if (!sourceNode || !targetNode) return null;
                      
                      return (
                        <div key={index} className={`p-2 border rounded text-xs ${getRelationColor(edge.relation)}`}>
                          <div className="font-medium text-gray-600 mb-1">{edge.relation}</div>
                          <div className="text-gray-500">
                            {sourceNode.label.slice(0, 30)}...
                            <br />
                            ↓
                            <br />
                            {targetNode.label.slice(0, 30)}...
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Belief Types</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs">Core Beliefs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Assumptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Derived Beliefs</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Relationships</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-t-2 border-red-500"></div>
                  <span className="text-xs">Contradicts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-t-2 border-green-500"></div>
                  <span className="text-xs">Reinforces</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-t-2 border-purple-500"></div>
                  <span className="text-xs">Evolved From</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Belief</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{selectedNode.label}</p>
              <div className="flex items-center gap-2">
                <Badge className={`${
                  selectedNode.type === 'core' ? 'bg-blue-100 text-blue-800' :
                  selectedNode.type === 'assumption' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedNode.type}
                </Badge>
                <span className="text-sm text-gray-600">
                  Confidence: {selectedNode.confidence}/10
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedNode.topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
