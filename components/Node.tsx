'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { NodeTooltip } from './NodeTooltip';

interface NodeProps {
  node: MindMapNode;
  onEdit: (node: MindMapNode) => void;
  camera: { x: number; y: number; zoom: number };
  dragConstraints?: React.RefObject<HTMLDivElement | null>;
}

export function Node({ node, onEdit, camera, dragConstraints }: NodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  // Close tooltip when node is deselected
  useEffect(() => {
    if (!isSelected) {
      setShowTooltip(false);
    }
  }, [isSelected]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (connectionState.mode === 'selecting-source') {
      setConnectionSource(node.id);
      setShowTooltip(false);
    } else if (connectionState.mode === 'selecting-target') {
      completeConnection(node.id);
      setShowTooltip(false);
    } else {
      setSelectedNode(node.id);
      // Show tooltip only if not dragging and has content to show
      if (!isDragging && (node.details || node.shortNote)) {
        setShowTooltip(true);
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnectionMode) {
      onEdit(node);
    }
  };

  const getVariantClasses = () => {
    switch (node.variant) {
      case 'rounded':
        return 'rounded-2xl';
      case 'pill':
        return 'rounded-full';
      case 'outline':
        return 'rounded-full border-2';
      default:
        return 'rounded-full'; // Default is now circular
    }
  };

  // Calculate background color with transparency
  const bgColor = node.variant === 'outline'
    ? 'transparent'
    : `${node.color}40`; // 40 = 25% opacity in hex

  const borderColor = node.variant === 'outline' ? node.color : 'transparent';

  return (
    <>
      <motion.div
        drag={!isConnectionMode} // Disable drag when in connection mode
        dragMomentum={false}
        dragElastic={0}
        dragSnapToOrigin={true}
        dragConstraints={dragConstraints}
        onDragStart={() => {
          setIsDragging(true);
          setShowTooltip(false);
        }}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          // Update position after drag ends
          // offset is in screen pixels, need to account for zoom
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
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: node.variant === 'outline' ? '2px' : '1px',
        borderStyle: 'solid',
        boxShadow: isSelected
          ? `0 0 30px ${node.color}, 0 10px 30px rgba(0,0,0,0.5)`
          : `0 0 15px ${node.color}60, 0 5px 15px rgba(0,0,0,0.3)`,
        zIndex: 10,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ scale: 1.05, cursor:"grab" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'px-8 py-6 min-w-[140px] min-h-[140px] max-w-[200px] flex items-center justify-center backdrop-blur-sm',
        getVariantClasses(),
        isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-transparent',
        isSourceNode && 'ring-2 ring-yellow-400 ring-offset-2',
        isConnectionMode ? 'cursor-crosshair' : 'cursor-move'
      )}
    >
      <div className="space-y-1 text-center">
        <h3 className="font-semibold text-white text-base leading-tight">
          {node.title || 'Untitled'}
        </h3>
        {node.shortNote && (
          <p className="text-xs text-white/80 leading-tight">
            {node.shortNote}
          </p>
        )}
      </div>

      {/* Connection handle indicator */}
      {isConnectionMode && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
      )}
    </motion.div>

    {/* Tooltip for node details */}
    <NodeTooltip
      node={node}
      isVisible={showTooltip && !isConnectionMode}
      position={{ x: node.position.x, y: node.position.y }}
    />
  </>
  );
}
