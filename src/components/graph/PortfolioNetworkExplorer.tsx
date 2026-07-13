'use client';

import { useMemo, useState } from 'react';
import type { PortfolioSimilarityEdge } from '@/src/types/domain';

type PortfolioNode = {
  id: string;
  name: string;
  category: string;
};

function shortLabel(label: string, max = 13) {
  return label.length > max ? `${label.slice(0, max - 1)}...` : label;
}

function roundCoord(value: number) {
  return Math.round(value * 100) / 100;
}

function buildNodes(edges: PortfolioSimilarityEdge[]) {
  return Array.from(
    edges.reduce((map, edge) => {
      map.set(edge.fromBrandId, { id: edge.fromBrandId, name: edge.fromBrandName, category: edge.fromCategory });
      map.set(edge.toBrandId, { id: edge.toBrandId, name: edge.toBrandName, category: edge.toCategory });
      return map;
    }, new Map<string, PortfolioNode>())
      .values()
  );
}

function layoutNodes(nodes: PortfolioNode[]) {
  const center = { x: 450, y: 300 };
  return new Map(nodes.map((node, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) * index / Math.max(1, nodes.length));
    const radius = 150 + (index % 3) * 46;
    return [node.id, {
      ...node,
      x: roundCoord(center.x + Math.cos(angle) * radius),
      y: roundCoord(center.y + Math.sin(angle) * radius)
    }];
  }));
}

function edgeTouches(edge: PortfolioSimilarityEdge, nodeId: string) {
  return edge.fromBrandId === nodeId || edge.toBrandId === nodeId;
}

export default function PortfolioNetworkExplorer({ edges }: { edges: PortfolioSimilarityEdge[] }) {
  const displayedEdges = edges.slice(0, 18);
  const nodes = useMemo(() => buildNodes(displayedEdges), [displayedEdges]);
  const positions = useMemo(() => layoutNodes(nodes), [nodes]);
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(nodes[0]?.id ?? '');
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleNodeIds = useMemo(() => {
    const ids = new Set<string>();
    nodes.forEach((node) => {
      if (!normalizedQuery || node.name.toLowerCase().includes(normalizedQuery) || node.category.toLowerCase().includes(normalizedQuery)) {
        ids.add(node.id);
      }
    });
    if (!normalizedQuery) return ids;
    displayedEdges.forEach((edge) => {
      if (ids.has(edge.fromBrandId)) ids.add(edge.toBrandId);
      if (ids.has(edge.toBrandId)) ids.add(edge.fromBrandId);
    });
    return ids;
  }, [displayedEdges, nodes, normalizedQuery]);

  const visibleEdges = displayedEdges.filter((edge) => visibleNodeIds.has(edge.fromBrandId) && visibleNodeIds.has(edge.toBrandId));
  const selectedEdges = selectedNode ? displayedEdges.filter((edge) => edgeTouches(edge, selectedNode.id)) : [];
  const selectedNeighborIds = new Set(selectedEdges.flatMap((edge) => [edge.fromBrandId, edge.toBrandId]).filter((id) => id !== selectedNode?.id));

  return (
    <figure className="portfolio-network-map kg-explorer" aria-label="Cross-brand portfolio network explorer">
      <div className="kg-toolbar">
        <label>
          <span>Search brands</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find brand or category..." />
        </label>
        <div className="kg-zoom-controls" aria-label="Portfolio graph zoom controls">
          <button type="button" onClick={() => setZoom((value) => Math.max(.7, Number((value - .1).toFixed(1))))}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.5, Number((value + .1).toFixed(1))))}>+</button>
          <button type="button" onClick={() => { setQuery(''); setZoom(1); setSelectedNodeId(nodes[0]?.id ?? ''); }}>Reset</button>
        </div>
      </div>

      <div className="kg-canvas-shell">
        <svg viewBox="0 0 900 600" role="img">
          <title>Cross-brand portfolio network explorer</title>
          <g transform={`translate(${450 * (1 - zoom)} ${300 * (1 - zoom)}) scale(${zoom})`}>
            {visibleEdges.map((edge) => {
              const from = positions.get(edge.fromBrandId);
              const to = positions.get(edge.toBrandId);
              if (!from || !to) return null;
              const active = selectedNode ? edgeTouches(edge, selectedNode.id) : true;
              return (
                <line
                  className={active ? 'active' : ''}
                  key={`${edge.fromBrandId}-${edge.toBrandId}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={edge.fromCategory === edge.toCategory ? '#8bbcff' : '#ff9f43'}
                  strokeWidth={Math.max(1.5, Math.min(5.5, edge.score / 20))}
                />
              );
            })}
            {Array.from(positions.values()).filter((node) => visibleNodeIds.has(node.id)).map((node) => {
              const selected = selectedNode?.id === node.id;
              const neighbor = selectedNeighborIds.has(node.id);
              return (
                <g
                  className={`${selected ? 'selected' : ''} ${neighbor ? 'neighbor' : ''} ${selectedNode && !selected && !neighbor ? 'dimmed' : ''}`}
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setSelectedNodeId(node.id);
                  }}
                  role="button"
                  tabIndex={0}
                  transform={`translate(${node.x} ${node.y})`}
                >
                  <circle r={selected ? 32 : 28} />
                  <text textAnchor="middle" dominantBaseline="middle">{shortLabel(node.name)}</text>
                  <title>{`${node.name} · ${node.category}`}</title>
                </g>
              );
            })}
          </g>
        </svg>

        <aside className="kg-inspector" aria-label="Selected portfolio brand">
          {selectedNode ? (
            <>
              <span>{selectedNode.category}</span>
              <strong>{selectedNode.name}</strong>
              <h4>Strongest relationships</h4>
              <ul>
                {selectedEdges.map((edge) => {
                  const otherName = edge.fromBrandId === selectedNode.id ? edge.toBrandName : edge.fromBrandName;
                  return (
                    <li key={`${edge.fromBrandId}-${edge.toBrandId}`}>
                      <b>{edge.strength} similarity · {edge.score}</b>
                      <span>{otherName}</span>
                      <em>{edge.reasons.slice(0, 2).join(' ')}</em>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p>Select a brand node to inspect its strongest graph relationships.</p>
          )}
        </aside>
      </div>

      <figcaption>
        <strong>{visibleNodeIds.size} visible brands · {visibleEdges.length} visible edges</strong>
        <span>Orange links cross categories; blue links stay within category. Click a brand to focus its neighborhood.</span>
      </figcaption>
    </figure>
  );
}
