import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, GitBranch, Activity, Globe, MapPin, TrendingUp, Zap, ArrowRight, Search, Layers } from 'lucide-react';
import { buildCapitalGraph } from '../lib/neural';
import { cn } from '../lib/utils';

export function NeuralCapitalMap() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const graph = useMemo(() => buildCapitalGraph(), []);

  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return graph.nodes;
    return graph.nodes.filter(n => n.type === filterType);
  }, [graph.nodes, filterType]);

  const selectedNodeData = useMemo(() => {
    if (!selectedNode) return null;
    return graph.nodes.find(n => n.id === selectedNode);
  }, [selectedNode, graph.nodes]);

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return graph.edges.filter(e => e.sourceId === selectedNode || e.targetId === selectedNode);
  }, [selectedNode, graph.edges]);

  const nodeTypes = useMemo(() => {
    const types = new Set(graph.nodes.map(n => n.type));
    return ['all', ...Array.from(types)];
  }, [graph.nodes]);

  // Layout nodes in a force-directed-like circular arrangement
  const layoutNodes = useMemo(() => {
    const centerX = 400;
    const centerY = 300;
    const radius = 250;
    const cityRadius = 180;
    
    const countryNodes = filteredNodes.filter(n => n.type === 'country');
    const cityNodes = filteredNodes.filter(n => n.type === 'city');
    const otherNodes = filteredNodes.filter(n => n.type !== 'country' && n.type !== 'city');

    return filteredNodes.map((node, i) => {
      let x: number, y: number;
      
      if (node.type === 'country') {
        const angle = (2 * Math.PI * countryNodes.indexOf(node)) / Math.max(countryNodes.length, 1);
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else if (node.type === 'city') {
        const angle = (2 * Math.PI * cityNodes.indexOf(node)) / Math.max(cityNodes.length, 1);
        x = centerX + cityRadius * 0.6 * Math.cos(angle);
        y = centerY + cityRadius * 0.6 * Math.sin(angle);
      } else {
        const angle = (2 * Math.PI * otherNodes.indexOf(node)) / Math.max(otherNodes.length, 1);
        x = centerX + 100 * Math.cos(angle);
        y = centerY + 100 * Math.sin(angle);
      }

      const isSelected = selectedNode === node.id;
      return { ...node, x, y, isSelected };
    });
  }, [filteredNodes, selectedNode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Network className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Neural Capital Graph</h2>
            <p className="text-sm text-gray-500">{graph.nodes.length} nodes · {graph.edges.length} edges · {graph.hotspots.length} hotspots</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {nodeTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              filterType === type
                ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/30'
                : 'bg-white/5 text-gray-400 border-luxury-border hover:text-white hover:bg-white/10'
            )}
          >
            {type === 'all' ? 'All Nodes' : type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visualization */}
        <div className="lg:col-span-2 premium-card p-4">
          <svg viewBox="0 0 800 600" className="w-full h-auto">
            {/* Edges */}
            {graph.edges.slice(0, 200).map(edge => {
              const source = layoutNodes.find(n => n.id === edge.sourceId);
              const target = layoutNodes.find(n => n.id === edge.targetId);
              if (!source || !target) return null;
              const isConnected = selectedNode && (edge.sourceId === selectedNode || edge.targetId === selectedNode);
              return (
                <line
                  key={edge.id}
                  x1={source.x} y1={source.y}
                  x2={target.x} y2={target.y}
                  stroke={isConnected ? '#D4AF37' : '#1F2937'}
                  strokeWidth={isConnected ? 2 : Math.max(0.5, edge.weight * 2)}
                  opacity={isConnected ? 0.8 : 0.2}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Nodes */}
            {layoutNodes.map(node => (
              <g key={node.id} onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)} className="cursor-pointer">
                <circle
                  cx={node.x} cy={node.y}
                  r={node.isSelected ? node.size + 4 : node.size}
                  fill={node.isSelected ? '#D4AF37' : node.color}
                  opacity={node.isSelected ? 1 : 0.6}
                  className="transition-all duration-300"
                />
                {node.isSelected && (
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.size + 8}
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth={1.5}
                    opacity={0.5}
                  >
                    <animate attributeName="r" from={node.size + 8} to={node.size + 14} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <text
                  x={node.x} y={node.y + node.size + 12}
                  textAnchor="middle"
                  fill={node.isSelected ? '#D4AF37' : '#9CA3AF'}
                  fontSize="8"
                  className="pointer-events-none"
                >
                  {node.name.length > 12 ? node.name.slice(0, 12) + '…' : node.name}
                </text>
              </g>
            ))}

            {/* Capital flow labels */}
            {graph.capitalFlows.slice(0, 10).map((flow, i) => {
              const source = layoutNodes.find(n => n.id === flow.source);
              const target = layoutNodes.find(n => n.id === flow.target);
              if (!source || !target) return null;
              return (
                <text
                  key={`flow-${i}`}
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 8}
                  textAnchor="middle"
                  fill="#F59E0B"
                  fontSize="6"
                  opacity={0.6}
                >
                  {flow.label.length > 20 ? flow.label.slice(0, 20) + '…' : flow.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedNodeData ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: selectedNodeData.color + '30' }}>
                  <MapPin className="w-4 h-4 m-2" style={{ color: selectedNodeData.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selectedNodeData.name}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{selectedNodeData.type.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Confidence</span><span className="text-emerald-400">{selectedNodeData.confidence}%</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Opportunities</span><span className="text-luxury-gold-400">{selectedNodeData.opportunityCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Connections</span><span className="text-white">{connectedEdges.length}</span></div>
              </div>
              {connectedEdges.length > 0 && (
                <div className="mt-3 pt-3 border-t border-luxury-border">
                  <p className="text-[10px] text-gray-500 mb-2">Connected Nodes</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {connectedEdges.slice(0, 8).map(edge => {
                      const connectedId = edge.sourceId === selectedNode ? edge.targetId : edge.sourceId;
                      const connectedNode = graph.nodes.find(n => n.id === connectedId);
                      if (!connectedNode) return null;
                      return (
                        <div key={edge.id} className="flex items-center justify-between p-1.5 rounded bg-white/[0.02]">
                          <span className="text-[10px] text-gray-400">{connectedNode.name}</span>
                          <span className="text-[8px] text-gray-600">{edge.type.replace(/_/g, ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="premium-card p-6 text-center">
              <Network className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Select a node to view details</p>
              <p className="text-xs text-gray-600 mt-1">Click any circle on the graph to see its connections and data</p>
            </div>
          )}

          {/* Hotspots */}
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Hotspots</h3>
            </div>
            <div className="space-y-1.5">
              {graph.hotspots.slice(0, 5).map((h, i) => {
                const node = graph.nodes.find(n => n.id === h.nodeId);
                return (
                  <div key={h.nodeId} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                    onClick={() => setSelectedNode(h.nodeId)}
                  >
                    <span className="text-xs text-gray-300">{node?.name || 'Unknown'}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div className="h-full rounded-full bg-luxury-gold-500" style={{ width: `${h.intensity * 100}%` }} />
                      </div>
                      <span className="text-[9px] text-luxury-gold-400">{Math.round(h.intensity * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
