'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Loader2, RotateCcw } from 'lucide-react';
import * as d3 from 'd3';
import { getGraphData } from '@/lib/client-storage';

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

interface D3Node extends GraphNode {
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  vx?: number;
  vy?: number;
}

interface D3Link {
  source: string | D3Node;
  target: string | D3Node;
  relation: string;
}

export function BeliefGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchGraphData();
    
    // Listen for localStorage changes to refresh data
    const handleStorageChange = () => {
      fetchGraphData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events when data is updated
    window.addEventListener('localStorageUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange);
    };
  }, []);

  const fetchGraphData = async () => {
    try {
      // Get data from localStorage instead of API
      const data = getGraphData();
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (node: GraphNode) => {
    if (node.deprecated) return '#9ca3af';
    switch (node.type) {
      case 'core': return '#3b82f6';
      case 'assumption': return '#f59e0b';
      case 'derived': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getNodeSize = (node: GraphNode) => {
    return Math.max(4, node.confidence * 0.8);
  };

  const getLinkColor = (edge: GraphEdge) => {
    switch (edge.relation) {
      case 'contradicts': return '#ef4444';
      case 'reinforces': return '#10b981';
      case 'evolved_from': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity
      );
    }
  };

  useEffect(() => {
    if (!mounted || !svgRef.current || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous graph

    const width = 800;
    const height = 400;

    // Create the simulation
    const simulation = d3.forceSimulation<D3Node>()
      .force('link', d3.forceLink<D3Node, D3Link>().id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create main group for all graph elements
    const g = svg.append('g');

    // Prepare data
    const nodes: D3Node[] = graphData.nodes.map(d => ({ ...d }));
    const nodeIds = new Set(nodes.map(n => n.id));
    
    // Filter out edges that reference non-existent nodes
    const validEdges = graphData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    const links: D3Link[] = validEdges.map(d => ({ ...d }));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2)
      .attr('stroke', d => getLinkColor({ source: '', target: '', relation: d.relation }));

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => getNodeSize(d))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<any, D3Node>() // eslint-disable-line @typescript-eslint/no-explicit-any
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Add labels
    const label = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label)
      .attr('font-size', 10)
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Add node tooltips
    node.append('title')
      .text(d => `${d.label} (${d.confidence}/10)`);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x || 0)
        .attr('y1', d => (d.source as D3Node).y || 0)
        .attr('x2', d => (d.target as D3Node).x || 0)
        .attr('y2', d => (d.target as D3Node).y || 0);

      node
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0);

      label
        .attr('x', d => d.x || 0)
        .attr('y', d => (d.y || 0) + getNodeSize(d) + 15);
    });

    // Start simulation
    simulation.nodes(nodes);
    simulation.force<d3.ForceLink<D3Node, D3Link>>('link')?.links(links);

    function dragstarted(event: any, d: D3Node) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: D3Node) { // eslint-disable-line @typescript-eslint/no-explicit-any
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: D3Node) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!event.active) simulation.alphaTarget(0);
      d.fx = undefined;
      d.fy = undefined;
    }

    return () => {
      simulation.stop();
    };
  }, [graphData, mounted]);

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
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Advanced D3.js visualization with drag and zoom interactions
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
            <div className="relative">
              <svg
                ref={svgRef}
                width={800}
                height={400}
                className="border rounded-lg bg-white"
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
              />
              
              {/* Legend */}
              <div className="absolute top-2 right-2 bg-white p-3 rounded-lg shadow-md border">
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
                <Badge className={
                  selectedNode.type === 'core' ? 'bg-blue-100 text-blue-800' :
                  selectedNode.type === 'assumption' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
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
