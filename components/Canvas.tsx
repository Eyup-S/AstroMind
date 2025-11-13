'use client';

import { useEffect, useRef, useState } from 'react';
import { MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';
import { Node } from './Node';
import { EdgeRenderer } from './EdgeRenderer';
import { NodeModal } from './NodeModal';
import { usePanZoom } from '@/hooks/usePanZoom';

interface CanvasProps {
  className?: string;
}

export function Canvas({ className }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [editingNode, setEditingNode] = useState<MindMapNode | null>(null);

  const { maps, currentMapId, addNode, setSelectedNode, connectionState } =
    useMindMapStore();

  const currentMap = maps.find((m) => m.id === currentMapId);

  const { camera, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } =
    usePanZoom();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-background')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate position relative to canvas, accounting for camera transform
      const x = (e.clientX - rect.left - camera.x) / camera.zoom;
      const y = (e.clientY - rect.top - camera.y) / camera.zoom;

      addNode({
        title: 'New Node',
        shortNote: '',
        details: '',
        color: '#8b5cf6',
        variant: 'default',
        position: { x, y }
      });
    }
  };

  const handleCanvasClick = () => {
    // Deselect when clicking on empty canvas
    if (connectionState.mode === 'idle') {
      setSelectedNode(undefined);
    }
  };

  if (!currentMap) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-full text-purple-300">
          <div className="text-center space-y-4">
            <p className="text-2xl font-semibold">No map selected</p>
            <p className="text-purple-400">Create a new map to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={canvasRef}
        className={`${className} relative overflow-hidden`}
        onDoubleClick={handleDoubleClick}
        onClick={handleCanvasClick}
        style={{
          cursor: connectionState.mode !== 'idle' ? 'crosshair' : 'default'
        }}
      >
        {/* Connection mode indicator */}
        {connectionState.mode !== 'idle' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-black px-6 py-3 rounded-full font-semibold shadow-lg z-50 animate-pulse">
            {connectionState.mode === 'selecting-source'
              ? 'Click a node to start connection'
              : 'Click target node to complete connection'}
          </div>
        )}

        {/* Canvas background */}
        <div className="canvas-background absolute inset-0 bg-transparent" />

        {/* Edges */}
        <EdgeRenderer
          edges={currentMap.edges}
          nodes={currentMap.nodes}
          camera={camera}
        />

        {/* Nodes */}
        {currentMap.nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            onEdit={setEditingNode}
            camera={camera}
          />
        ))}

        {/* Zoom level indicator */}
        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-2 text-purple-200 text-sm font-mono">
          Zoom: {Math.round(camera.zoom * 100)}%
        </div>
      </div>

      {/* Edit Modal */}
      <NodeModal node={editingNode} onClose={() => setEditingNode(null)} />
    </>
  );
}
