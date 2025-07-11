'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Loader2, RotateCcw } from 'lucide-react';
import { getGraphData } from '@/lib/client-storage';

interface GraphNode {
  id: string;
  label: string;
  confidence: number;
  topics: string[];
  type: string;
  deprecated: boolean;
  created_at: string;
  x?: number;
  y?: number;
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

interface SimpleGraphVisualizationProps {
  highlightedNode?: string | null;
}

export function SimpleGraphVisualization({ highlightedNode }: SimpleGraphVisualizationProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchGraphData();
    
    // Listen for localStorage changes to refresh data
    const handleStorageChange = () => {
      fetchGraphData();
    };

    // Listen for window resize to reposition nodes on orientation change
    const handleResize = () => {
      // Re-fetch and reposition nodes on resize
      setTimeout(() => fetchGraphData(), 100);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleStorageChange);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-select highlighted node when provided
  useEffect(() => {
    if (highlightedNode && graphData.nodes.length > 0) {
      const nodeToHighlight = graphData.nodes.find(node => node.id === highlightedNode);
      if (nodeToHighlight) {
        setSelectedNode(nodeToHighlight);
      }
    }
  }, [highlightedNode, graphData.nodes]);

  const fetchGraphData = async () => {
    try {
      // Get data from localStorage instead of API
      const data = getGraphData();
      setGraphData(data);
      
      // Position nodes in a circle for simple visualization
      if (data.nodes.length > 0) {
        // Use responsive dimensions
        const canvasWidth = window.innerWidth < 640 ? Math.min(350, window.innerWidth - 40) : 500;
        const canvasHeight = 400;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.6;
        const radius = Math.min(maxRadius, 50 + data.nodes.length * 8);
        
        const positioned = data.nodes.map((node: GraphNode, index: number) => {
          const angle = (2 * Math.PI * index) / data.nodes.length;
          return {
            ...node,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          };
        });
        setGraphData(prev => ({ ...prev, nodes: positioned }));
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || !canvasRef.current || graphData.nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays for crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual canvas size for high DPI
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set display size
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Store display dimensions for interaction calculations
    canvas.dataset.displayWidth = rect.width.toString();
    canvas.dataset.displayHeight = rect.height.toString();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    graphData.edges.forEach(edge => {
      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
      const targetNode = graphData.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode && sourceNode.x && sourceNode.y && targetNode.x && targetNode.y) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        // Color edges by relation type
        switch (edge.relation) {
          case 'contradicts':
            ctx.strokeStyle = '#ef4444';
            break;
          case 'reinforces':
            ctx.strokeStyle = '#10b981';
            break;
          case 'evolved_from':
            ctx.strokeStyle = '#8b5cf6';
            break;
          default:
            ctx.strokeStyle = '#6b7280';
        }
        
        ctx.stroke();
      }
    });

    // Draw nodes
    graphData.nodes.forEach(node => {
      if (!node.x || !node.y) return;

      // Node color based on type
      let nodeColor = '#6b7280';
      switch (node.type) {
        case 'core':
          nodeColor = '#3b82f6';
          break;
        case 'assumption':
          nodeColor = '#f59e0b';
          break;
        case 'derived':
          nodeColor = '#10b981';
          break;
      }

      if (node.deprecated) {
        nodeColor = '#9ca3af';
      }

      // Draw node circle
      const radius = Math.max(8, node.confidence * 1.5);
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = selectedNode?.id === node.id ? '#000000' : '#ffffff';
      ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1;
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const truncatedLabel = node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label;
      ctx.fillText(truncatedLabel, node.x, node.y + radius + 15);
    });
  }, [graphData, selectedNode, mounted]);

  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Find clicked node
    const clickedNode = graphData.nodes.find(node => {
      if (!node.x || !node.y) return false;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      const radius = Math.max(8, node.confidence * 1.5);
      return distance <= radius;
    });

    setSelectedNode(clickedNode || null);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    handleCanvasInteraction(event.clientX, event.clientY);
  };

  const handleCanvasTouch = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault(); // Prevent scrolling
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      handleCanvasInteraction(touch.clientX, touch.clientY);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'assumption': return 'bg-yellow-100 text-yellow-800';
      case 'derived': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!mounted || loading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Belief Graph
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchGraphData} className="cursor-pointer">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Simple visualization of your beliefs and their relationships
          </p>
        </CardHeader>
        <CardContent>
          {graphData.nodes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No beliefs to display</p>
              <p className="text-sm">Add some journal entries to see your belief graph</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="border rounded-lg cursor-pointer bg-white w-full"
                  style={{ maxWidth: '100%', height: '400px' }}
                  onClick={handleCanvasClick}
                  onTouchStart={handleCanvasTouch}
                />
                
                {/* Legend - Desktop only */}
                <div className="hidden sm:block absolute top-2 right-2 bg-white p-3 rounded-lg shadow-md border">
                  <h4 className="text-sm font-medium mb-2">Legend</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Core Beliefs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Assumptions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Derived Beliefs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-red-500"></div>
                      <span>Contradicts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-green-500"></div>
                      <span>Reinforces</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-purple-500"></div>
                      <span>Evolved From</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend - Mobile only */}
              <div className="sm:hidden bg-white p-3 rounded-lg shadow-md border">
                <h4 className="text-sm font-medium mb-3">Legend</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span>Core Beliefs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
                    <span>Assumptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span>Derived Beliefs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500 flex-shrink-0"></div>
                    <span>Contradicts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-500 flex-shrink-0"></div>
                    <span>Reinforces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-purple-500 flex-shrink-0"></div>
                    <span>Evolved From</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Belief</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">{selectedNode.label}</p>
              <div className="flex items-center gap-2">
                <Badge className={getNodeColor(selectedNode.type)}>
                  {selectedNode.type}
                </Badge>
                <span className="text-sm text-gray-600">
                  Confidence: {selectedNode.confidence}/10
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(selectedNode.created_at).toLocaleDateString()}
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
