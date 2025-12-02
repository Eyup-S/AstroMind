'use client';

import { MindMapEdge, MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';

interface EdgeRendererProps {
  edges: MindMapEdge[];
  nodes: MindMapNode[];
  camera: { x: number; y: number; zoom: number };
  onEdgeClick?: (edgeId: string, position: { x: number; y: number }) => void;
}

export function EdgeRenderer({ edges, nodes, camera, onEdgeClick }: EdgeRendererProps) {
  const { selectedEdgeId, setSelectedEdge } = useMindMapStore();

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    // Center of circular node (140x140, so center is at +70, +70)
    return {
      x: node.position.x + 70,
      y: node.position.y + 70
    };
  };

  // CURVED LINE CODE - COMMENTED OUT FOR NOW
 const createCurvedPath = (
   x1: number,
   y1: number,
   x2: number,
   y2: number
 ): string => {
   const dx = x2 - x1;
   const dy = y2 - y1;

  //Control points for smooth Bezier curve
   const cx1 = x1 + dx * 0.3;
   const cy1 = y1;
   const cx2 = x1 + dx * 0.7;
   const cy2 = y2;

   return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
 };

  // Straight line between two points
  const createStraightPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): string => {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        zIndex: 0
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

      <g>
        {edges.map((edge) => {
          const fromCenter = getNodeCenter(edge.from);
          const toCenter = getNodeCenter(edge.to);
          //console.log("from to", fromCenter, toCenter)

          const isSelected = selectedEdgeId === edge.id;
          const path = createCurvedPath(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y);
          const edgeColor = edge.color || '#8b5cf6';

          // Calculate midpoint for color picker placement
          const midX = (fromCenter.x + toCenter.x) / 2;
          const midY = (fromCenter.y + toCenter.y) / 2;

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
                  // Call the onEdgeClick callback
                  if (onEdgeClick) {
                    onEdgeClick(edge.id, { x: e.clientX, y: e.clientY });
                  }
                }}
              />

              {/* Visible edge */}
              <path
                d={path}
                fill="none"
                stroke={isSelected ? '#ffffff' : edgeColor}
                strokeWidth={isSelected ? 3 : 2}
                //markerEnd={ isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'}
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
