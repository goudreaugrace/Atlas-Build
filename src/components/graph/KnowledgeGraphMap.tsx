'use client';

import { useMemo, useState } from 'react';
import type { KnowledgeGraph, KnowledgeGraphEdge, KnowledgeGraphNode } from '@/src/types/domain';

const nodeTypeTone: Record<KnowledgeGraphNode['type'], { fill: string; stroke: string; text: string }> = {
  brand: { fill: '#0b4aa2', stroke: '#08336f', text: '#ffffff' },
  metric: { fill: '#eef6ff', stroke: '#8bbcff', text: '#082d5c' },
  diagnosis: { fill: '#051b33', stroke: '#051b33', text: '#ffffff' },
  treatment: { fill: '#fff4e8', stroke: '#ff9f43', text: '#5f3200' },
  category: { fill: '#edf8f1', stroke: '#6fcf97', text: '#174f2e' },
  period: { fill: '#f4f7fb', stroke: '#c6d3e1', text: '#24364a' },
  evidence_gap: { fill: '#fff2f0', stroke: '#ff7a59', text: '#6b1d0c' },
  portfolio_pattern: { fill: '#f5f0ff', stroke: '#9b7cff', text: '#321b72' }
};

const nodeTypeRank: Record<KnowledgeGraphNode['type'], number> = {
  brand: 0,
  diagnosis: 1,
  portfolio_pattern: 2,
  evidence_gap: 3,
  treatment: 4,
  metric: 5,
  category: 6,
  period: 7
};

const edgeTone: Record<KnowledgeGraphEdge['type'], string> = {
  has_metric: '#9fb3c8',
  has_diagnosis: '#061d35',
  linked_treatment: '#ff9f43',
  similar_to: '#0b73d9',
  matches_pattern: '#8b67f6',
  has_evidence_gap: '#e85d3f',
  observed_in: '#7aa17e'
};

function shortLabel(label: string, max = 24) {
  return label.length > max ? `${label.slice(0, max - 1)}...` : label;
}

function nodeRadius(type: KnowledgeGraphNode['type']) {
  if (type === 'brand') return 34;
  if (type === 'diagnosis' || type === 'portfolio_pattern') return 28;
  if (type === 'evidence_gap' || type === 'treatment') return 24;
  return 21;
}

function roundCoord(value: number) {
  return Math.round(value * 100) / 100;
}

function layoutNodes(graph: KnowledgeGraph) {
  const center = { x: 450, y: 310 };
  const sorted = [...graph.nodes].sort((a, b) => nodeTypeRank[a.type] - nodeTypeRank[b.type] || a.label.localeCompare(b.label));
  const brand = sorted.find((node) => node.type === 'brand') ?? sorted[0];
  const satellites = sorted.filter((node) => node.id !== brand?.id);

  const positionById = new Map<string, { x: number; y: number; node: KnowledgeGraphNode }>();
  if (brand) positionById.set(brand.id, { ...center, node: brand });

  satellites.forEach((node, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) * index / Math.max(1, satellites.length));
    const rankOffset = nodeTypeRank[node.type] % 4;
    const radius = 150 + rankOffset * 42;
    positionById.set(node.id, {
      x: roundCoord(center.x + Math.cos(angle) * radius),
      y: roundCoord(center.y + Math.sin(angle) * radius),
      node
    });
  });

  return positionById;
}

function edgeTouches(edge: KnowledgeGraphEdge, nodeId: string) {
  return edge.from === nodeId || edge.to === nodeId;
}

function relatedNodeIds(graph: KnowledgeGraph, nodeId: string) {
  return new Set(graph.edges.flatMap((edge) => {
    if (edge.from === nodeId) return [edge.to];
    if (edge.to === nodeId) return [edge.from];
    return [];
  }));
}

export default function KnowledgeGraphMap({ graph, title = 'Knowledge graph explorer' }: { graph: KnowledgeGraph; title?: string }) {
  const nodeTypes = useMemo(
    () => Array.from(new Set(graph.nodes.map((node) => node.type))).sort((a, b) => nodeTypeRank[a] - nodeTypeRank[b]),
    [graph.nodes]
  );
  const brandNode = graph.nodes.find((node) => node.type === 'brand') ?? graph.nodes[0];
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [enabledTypes, setEnabledTypes] = useState<Set<KnowledgeGraphNode['type']>>(() => new Set(nodeTypes));
  const [selectedNodeId, setSelectedNodeId] = useState(brandNode?.id ?? graph.nodes[0]?.id ?? '');

  const positions = useMemo(() => layoutNodes(graph), [graph]);
  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? brandNode ?? graph.nodes[0];
  const selectedNeighbors = selectedNode ? relatedNodeIds(graph, selectedNode.id) : new Set<string>();
  const normalizedQuery = query.trim().toLowerCase();

  const visibleNodeIds = useMemo(() => {
    const matchingIds = new Set<string>();
    graph.nodes.forEach((node) => {
      if (!enabledTypes.has(node.type)) return;
      const matchesQuery = !normalizedQuery
        || node.label.toLowerCase().includes(normalizedQuery)
        || node.type.toLowerCase().includes(normalizedQuery)
        || node.id.toLowerCase().includes(normalizedQuery);
      if (matchesQuery) matchingIds.add(node.id);
    });

    if (!normalizedQuery) return matchingIds;
    graph.edges.forEach((edge) => {
      if (matchingIds.has(edge.from) && enabledTypes.has(graph.nodes.find((node) => node.id === edge.to)?.type ?? 'brand')) matchingIds.add(edge.to);
      if (matchingIds.has(edge.to) && enabledTypes.has(graph.nodes.find((node) => node.id === edge.from)?.type ?? 'brand')) matchingIds.add(edge.from);
    });
    return matchingIds;
  }, [enabledTypes, graph.edges, graph.nodes, normalizedQuery]);

  const visibleEdges = graph.edges.filter((edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to));
  const connectedEdges = selectedNode ? graph.edges.filter((edge) => edgeTouches(edge, selectedNode.id)) : [];

  function toggleType(type: KnowledgeGraphNode['type']) {
    setEnabledTypes((current) => {
      const next = new Set(current);
      if (next.has(type) && next.size > 1) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function resetView() {
    setQuery('');
    setZoom(1);
    setEnabledTypes(new Set(nodeTypes));
    setSelectedNodeId(brandNode?.id ?? graph.nodes[0]?.id ?? '');
  }

  return (
    <figure className="knowledge-graph-map kg-explorer" aria-label={title}>
      <div className="kg-toolbar">
        <label>
          <span>Search graph</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find brand, diagnosis, gap, treatment..." />
        </label>
        <div className="kg-zoom-controls" aria-label="Graph zoom controls">
          <button type="button" onClick={() => setZoom((value) => Math.max(.7, Number((value - .1).toFixed(1))))}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.5, Number((value + .1).toFixed(1))))}>+</button>
          <button type="button" onClick={resetView}>Reset</button>
        </div>
      </div>

      <div className="knowledge-graph-legend" aria-label="Graph node filters">
        {nodeTypes.map((type) => (
          <button className={enabledTypes.has(type) ? 'active' : ''} key={type} type="button" onClick={() => toggleType(type)}>
            <i style={{ background: nodeTypeTone[type].fill, borderColor: nodeTypeTone[type].stroke }} />
            {type.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      <div className="kg-canvas-shell">
        <svg viewBox="0 0 900 620" role="img">
          <title>{title}</title>
          <g transform={`translate(${450 * (1 - zoom)} ${310 * (1 - zoom)}) scale(${zoom})`}>
            <g className="kg-edges">
              {visibleEdges.map((edge) => {
                const from = positions.get(edge.from);
                const to = positions.get(edge.to);
                if (!from || !to) return null;
                const isActive = selectedNode ? edgeTouches(edge, selectedNode.id) : true;
                return (
                  <line
                    className={isActive ? 'active' : ''}
                    key={`${edge.from}-${edge.type}-${edge.to}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={edgeTone[edge.type]}
                    strokeWidth={edge.weight ? Math.max(1.5, Math.min(5.5, edge.weight / 20)) : 1.8}
                  />
                );
              })}
            </g>
            <g className="kg-nodes">
              {Array.from(positions.values()).filter(({ node }) => visibleNodeIds.has(node.id)).map(({ node, x, y }) => {
                const tone = nodeTypeTone[node.type];
                const radius = nodeRadius(node.type);
                const isSelected = selectedNode?.id === node.id;
                const isNeighbor = selectedNeighbors.has(node.id);
                const isDimmed = selectedNode && !isSelected && !isNeighbor && node.type !== 'brand';
                return (
                  <g
                    className={`${isSelected ? 'selected' : ''} ${isNeighbor ? 'neighbor' : ''} ${isDimmed ? 'dimmed' : ''}`}
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') setSelectedNodeId(node.id);
                    }}
                    role="button"
                    tabIndex={0}
                    transform={`translate(${x} ${y})`}
                  >
                    <circle r={radius} fill={tone.fill} stroke={tone.stroke} strokeWidth={isSelected ? 4 : 2} />
                    <text fill={tone.text} textAnchor="middle" dominantBaseline="middle">
                      {shortLabel(node.label, node.type === 'brand' ? 18 : 14)}
                    </text>
                    <title>{`${node.label} (${node.type.replaceAll('_', ' ')})`}</title>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        <aside className="kg-inspector" aria-label="Selected graph node">
          {selectedNode ? (
            <>
              <span>{selectedNode.type.replaceAll('_', ' ')}</span>
              <strong>{selectedNode.label}</strong>
              <dl>
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
              <h4>Connected relationships</h4>
              <ul>
                {connectedEdges.map((edge) => {
                  const otherId = edge.from === selectedNode.id ? edge.to : edge.from;
                  const otherNode = graph.nodes.find((node) => node.id === otherId);
                  return (
                    <li key={`${edge.from}-${edge.type}-${edge.to}`}>
                      <b>{edge.type.replaceAll('_', ' ')}</b>
                      <span>{otherNode?.label ?? otherId}{edge.weight ? ` · weight ${edge.weight}` : ''}</span>
                      {!!edge.evidence?.length && <em>{edge.evidence.slice(0, 2).join(' ')}</em>}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p>Select a node to inspect relationships and evidence.</p>
          )}
        </aside>
      </div>

      <figcaption>
        <strong>{visibleNodeIds.size} visible nodes · {visibleEdges.length} visible edges</strong>
        <span>Click a node to focus its neighborhood. Use search and filters to turn the graph into a readable evidence map.</span>
      </figcaption>
    </figure>
  );
}
