'use client';

import { MindMapEdge, MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';

interface EdgeRendererProps {
  edges: MindMapEdge[];
  nodes: MindMapNode[];
  camera: { x: number; y: number; zoom: number };
}

export function EdgeRenderer({ edges, nodes, camera }: EdgeRendererProps) {
  const { selectedEdgeId, setSelectedEdge } = useMindMapStore();

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    // Approximate center of node (adjust based on node size)
    return {
      x: node.position.x + 100,
      y: node.position.y + 30
    };
  };

  const createCurvedPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): string => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Control points for quadratic curve
    const cx1 = x1 + dx * 0.3;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.7;
    const cy2 = y2;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible'
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#8b5cf6" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#ffffff" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}
      >
        {edges.map((edge) => {
          const from = getNodeCenter(edge.from);
          const to = getNodeCenter(edge.to);
          const isSelected = selectedEdgeId === edge.id;

          const path = createCurvedPath(from.x, from.y, to.x, to.y);

          return (
            <g key={edge.id}>
              {/* Invisible wider path for easier clicking */}
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEdge(edge.id);
                }}
              />

              {/* Visible edge */}
              <path
                d={path}
                fill="none"
                stroke={isSelected ? '#ffffff' : '#8b5cf6'}
                strokeWidth={isSelected ? 3 : 2}
                markerEnd={
                  isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'
                }
                filter={isSelected ? 'url(#glow)' : undefined}
                className="pointer-events-none transition-all duration-200"
                style={{
                  opacity: isSelected ? 1 : 0.6
                }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
