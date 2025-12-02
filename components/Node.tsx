'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';
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
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const {
    selectedNodeId,
    setSelectedNode,
    updateNode,
    deleteNode,
    connectionState,
    setConnectionSource,
    completeConnection
  } = useMindMapStore();

  const { themeColor } = useSettingsStore();
  const currentThemeColor = getThemeColor(themeColor);

  const isSelected = selectedNodeId === node.id;
  const isConnectionMode = connectionState.mode !== 'idle';
  const isSourceNode = connectionState.sourceNodeId === node.id;

  // Convert hex to RGB for dynamic styling
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 92, b: 246 };
  };

  const rgb = hexToRgb(currentThemeColor);

  // Close tooltip and reset delete confirm when node is deselected
  useEffect(() => {
    if (!isSelected) {
      setShowTooltip(false);
      setDeleteConfirm(false);
    }
  }, [isSelected]);

  // Auto-reset delete confirmation after 3 seconds
  useEffect(() => {
    if (deleteConfirm) {
      const timer = setTimeout(() => setDeleteConfirm(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteConfirm]);

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(node);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm) {
      deleteNode(node.id);
    } else {
      setDeleteConfirm(true);
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
        dragConstraints={dragConstraints}
        dragSnapToOrigin={true}
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

    {/* Action popup */}
    <AnimatePresence>
      {isSelected && !isConnectionMode && !isDragging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            left: node.position.x + 180,
            top: node.position.y - 20,
            zIndex: 50,
          }}
          className="flex gap-2"
        >
          {/* Edit button */}
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg backdrop-blur-md shadow-lg transition-all duration-200"
            style={{
              backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
              boxShadow: `0 4px 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
            }}
            onMouseEnter={(e) => {
              const darkenedRgb = { r: Math.max(0, rgb.r - 20), g: Math.max(0, rgb.g - 20), b: Math.max(0, rgb.b - 20) };
              e.currentTarget.style.backgroundColor = `rgb(${darkenedRgb.r}, ${darkenedRgb.g}, ${darkenedRgb.b})`;
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Edit node"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg backdrop-blur-md shadow-lg transition-all duration-200 ${
              deleteConfirm ? 'ring-2 ring-red-300 ring-offset-2 ring-offset-transparent' : ''
            }`}
            style={{
              backgroundColor: deleteConfirm ? 'rgb(220, 38, 38)' : 'rgba(220, 38, 38, 0.8)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
              transform: deleteConfirm ? 'scale(1.1)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              if (!deleteConfirm) {
                e.currentTarget.style.backgroundColor = 'rgb(185, 28, 28)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleteConfirm) {
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            title={deleteConfirm ? 'Click again to confirm deletion' : 'Delete node'}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}
