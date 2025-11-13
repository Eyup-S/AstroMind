'use client';

import { motion } from 'framer-motion';
import { MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NodeProps {
  node: MindMapNode;
  onEdit: (node: MindMapNode) => void;
  camera: { x: number; y: number; zoom: number };
}

export function Node({ node, onEdit, camera }: NodeProps) {
  const {
    selectedNodeId,
    setSelectedNode,
    updateNode,
    connectionState,
    setConnectionSource,
    completeConnection
  } = useMindMapStore();

  const isSelected = selectedNodeId === node.id;
  const isConnectionMode = connectionState.mode !== 'idle';
  const isSourceNode = connectionState.sourceNodeId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (connectionState.mode === 'selecting-source') {
      setConnectionSource(node.id);
    } else if (connectionState.mode === 'selecting-target') {
      completeConnection(node.id);
    } else {
      setSelectedNode(node.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnectionMode) {
      onEdit(node);
    }
  };

  const getVariantClasses = () => {
    const base = 'transition-all duration-200';

    switch (node.variant) {
      case 'rounded':
        return `${base} rounded-2xl`;
      case 'pill':
        return `${base} rounded-full`;
      case 'outline':
        return `${base} rounded-xl border-2 bg-transparent`;
      default:
        return `${base} rounded-xl`;
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={true}
      dragElastic={0.1}
      dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
      onDragEnd={(_, info) => {
        const newX = node.position.x + info.offset.x / camera.zoom;
        const newY = node.position.y + info.offset.y / camera.zoom;
        updateNode(node.id, {
          position: { x: newX, y: newY }
        });
      }}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        x: camera.x,
        y: camera.y,
        scale: camera.zoom
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'cursor-pointer px-6 py-4 min-w-[160px] max-w-[280px]',
        getVariantClasses(),
        isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-transparent',
        isSourceNode && 'ring-2 ring-yellow-400 ring-offset-2',
        isConnectionMode && 'cursor-crosshair'
      )}
      style={{
        backgroundColor: node.variant === 'outline' ? 'transparent' : node.color,
        borderColor: node.variant === 'outline' ? node.color : 'transparent',
        boxShadow: isSelected
          ? `0 0 30px ${node.color}80, 0 10px 30px rgba(0,0,0,0.5)`
          : `0 0 20px ${node.color}40, 0 5px 15px rgba(0,0,0,0.3)`
      }}
    >
      <div className="space-y-1">
        <h3 className="font-semibold text-white text-lg leading-tight">
          {node.title || 'Untitled'}
        </h3>
        {node.shortNote && (
          <p className="text-sm text-white/80 leading-tight">
            {node.shortNote}
          </p>
        )}
      </div>

      {/* Connection handle indicator */}
      {isConnectionMode && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
      )}
    </motion.div>
  );
}
