'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Flexible type to accept both full and partial streaming objects
interface PartialNode {
  id?: string;
  title?: string;
  shortNote?: string;
  details?: string;
  color?: string;
  variant?: string;
  position?: { x?: number; y?: number };
}

interface PartialEdge {
  id?: string;
  from?: string;
  to?: string;
  color?: string;
}

interface PartialMindMap {
  id?: string;
  name?: string;
  nodes?: (PartialNode | undefined)[];
  edges?: (PartialEdge | undefined)[];
}

interface MindMapPreviewProps {
  mindMap: PartialMindMap | undefined;
  isLoading?: boolean;
}

export function MindMapPreview({ mindMap, isLoading }: MindMapPreviewProps) {
  const nodes = mindMap?.nodes || [];
  const edges = mindMap?.edges || [];

  // Calculate bounds and scale to fit preview
  const { scale, offsetX, offsetY } = useMemo(() => {
    if (nodes.length === 0) return { scale: 1, offsetX: 0, offsetY: 0 };

    const positions = nodes
      .filter((n): n is PartialNode & { position: { x: number; y: number } } => 
        n?.position?.x !== undefined && n?.position?.y !== undefined
      )
      .map((n) => n.position);

    if (positions.length === 0) return { scale: 1, offsetX: 0, offsetY: 0 };

    const minX = Math.min(...positions.map((p) => p.x));
    const maxX = Math.max(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxY = Math.max(...positions.map((p) => p.y));

    const width = maxX - minX + 200; // Add padding for node width
    const height = maxY - minY + 100; // Add padding for node height

    const previewWidth = 700;
    const previewHeight = 450;

    const scaleX = previewWidth / Math.max(width, 1);
    const scaleY = previewHeight / Math.max(height, 1);
    const s = Math.min(scaleX, scaleY, 1) * 0.85;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return {
      scale: s,
      offsetX: previewWidth / 2 - centerX * s,
      offsetY: previewHeight / 2 - centerY * s,
    };
  }, [nodes]);

  // Estimated node dimensions for center calculation (preview only)
  const nodeWidth = 120;
  const nodeHeight = 40;

  // Build node position map for edges (center of each node)
  const nodePositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node) => {
      if (node?.id && node?.position?.x !== undefined && node?.position?.y !== undefined) {
        // Calculate the center of the node
        const nodeScale = Math.max(scale, 0.6);
        map[node.id] = {
          x: node.position.x * scale + offsetX + (nodeWidth * nodeScale) / 2,
          y: node.position.y * scale + offsetY + (nodeHeight * nodeScale) / 2,
        };
      }
    });
    return map;
  }, [nodes, scale, offsetX, offsetY]);

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'rounded':
        return 'rounded-xl';
      case 'pill':
        return 'rounded-full';
      case 'outline':
        return 'bg-transparent border-2';
      default:
        return 'rounded-lg';
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900/50 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(#fff 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Loading/Empty state */}
      <AnimatePresence>
        {isLoading && nodes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 animate-pulse" />
              <div className="absolute -right-6 top-1/2 w-6 h-0.5 bg-slate-800/50 animate-pulse delay-75" />
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 animate-pulse delay-100" />
              </div>
            </div>
            <div className="text-slate-500 text-sm font-medium animate-pulse">Structuring thoughts...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG for edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map((edge) => {
          if (!edge?.id || !edge?.from || !edge?.to) return null;
          const fromPos = nodePositions[edge.from];
          const toPos = nodePositions[edge.to];
          if (!fromPos || !toPos) return null;

          return (
            <motion.line
              key={edge.id}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={edge.color || '#94a3b8'}
              strokeWidth={Math.max(1, 1.5 * scale)}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      <AnimatePresence>
        {nodes.map((node, index) => {
          if (node?.position?.x === undefined || node?.position?.y === undefined) return null;

          const x = node.position.x * scale + offsetX;
          const y = node.position.y * scale + offsetY;

          const nodeScale = Math.max(scale, 0.7);

          return (
            <motion.div
              key={node.id || index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: nodeScale }}
              className={`absolute px-4 py-2 text-white text-sm font-medium shadow-lg backdrop-blur-sm ${getVariantClasses(node.variant)}`}
              style={{
                left: x,
                top: y,
                backgroundColor: node.variant === 'outline' ? 'rgba(30, 41, 59, 0.4)' : (node.color || '#8b5cf6'),
                borderColor: node.color || '#8b5cf6',
                maxWidth: 160 * nodeScale + 40,
                transformOrigin: 'top left',
                boxShadow: `0 4px 12px -2px rgba(0,0,0,0.3)`,
              }}
            >
              <div className="truncate opacity-90">{node.title || ''}</div>
              {!node.title && <div className="h-4 w-12 bg-white/20 rounded animate-pulse" />}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Stats overlay */}
      <AnimatePresence>
        {(nodes.length > 0 || isLoading) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg text-xs font-medium text-slate-400 flex items-center gap-3 shadow-lg"
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span>{nodes.length} nodes</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <span>{edges.length} edges</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
