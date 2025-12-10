'use client';

import { useEffect, useRef, useState } from 'react';
import { MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';
import { Node } from './Node';
import { EdgeRenderer } from './EdgeRenderer';
import { NodeModal } from './NodeModal';
import { EdgeColorPicker } from './EdgeColorPicker';

interface CanvasProps {
  className?: string;
  onNodeEdit?: (node: MindMapNode) => void;
}

export function Canvas({ className, onNodeEdit }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [editingNode, setEditingNode] = useState<MindMapNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [edgeColorPicker, setEdgeColorPicker] = useState<{
    edgeId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [nodeDragOffsets, setNodeDragOffsets] = useState<Map<string, { x: number; y: number }>>(new Map());

  const { maps, currentMapId, addNode, setSelectedNode, connectionState, updateEdge } =
    useMindMapStore();
  const { defaultNodeColor } = useSettingsStore();

  const handleNodeDragUpdate = (nodeId: string, offset: { x: number; y: number }) => {
    setNodeDragOffsets(prev => {
      const next = new Map(prev);
      next.set(nodeId, offset);
      return next;
    });
  };

  const handleNodeDragEnd = (nodeId: string) => {
    setNodeDragOffsets(prev => {
      const next = new Map(prev);
      next.delete(nodeId);
      return next;
    });
  };

  const currentMap = maps.find((m) => m.id === currentMapId);

  // Handle zoom with mouse wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.3), 2));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-background')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate position relative to canvas
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      addNode({
        title: 'New Node',
        shortNote: '',
        details: '',
        color: defaultNodeColor,
        variant: 'default',
        position: { x: x - 70, y: y - 70 } // Center on click position
      });
    }
  };

  const handleCanvasClick = () => {
    // Deselect when clicking on empty canvas
    if (connectionState.mode === 'idle') {
      setSelectedNode(undefined);
    }
    // This will also close any open tooltips since nodes handle their own tooltip state
  };

  // Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan with middle mouse button or space + left click
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - pan
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        distance: 0
      });
    } else if (e.touches.length === 2) {
      // Two finger touch - zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStart({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isPanning) {
      // Single touch pan
      setPan({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    } else if (e.touches.length === 2 && touchStart) {
      // Two finger zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      const delta = (distance - touchStart.distance) * 0.01;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.3), 2));

      setTouchStart({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setTouchStart(null);
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
        className={`${className} relative overflow-hidden bg-transparent touch-none`}
        onDoubleClick={handleDoubleClick}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isPanning ? 'grabbing' : connectionState.mode !== 'idle' ? 'crosshair' : 'grab'
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

        {/* Canvas content with zoom and pan */}
        <div
          ref={constraintsRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
          }}
          className="relative"
        >
          {/* Canvas background */}
          <div className="canvas-background absolute inset-0 bg-transparent" />

          {/* Edges */}
          <EdgeRenderer
            edges={currentMap.edges}
            nodes={currentMap.nodes}
            camera={{ x: 0, y: 0, zoom }}
            nodeDragOffsets={nodeDragOffsets}
            onEdgeClick={(edgeId, position) => setEdgeColorPicker({ edgeId, position })}
          />

          {/* Nodes */}
          {currentMap.nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              onEdit={setEditingNode}
              camera={{ x: 0, y: 0, zoom }}
              dragConstraints={constraintsRef}
              onDragUpdate={handleNodeDragUpdate}
              onDragComplete={handleNodeDragEnd}
            />
          ))}
        </div>

        {/* Zoom and Pan indicators */}
        <div className="absolute bottom-4 right-4 space-y-2 z-50">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-2 text-purple-200 text-sm font-mono">
            Zoom: {Math.round(zoom * 100)}%
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-purple-300/70 text-xs hidden md:block">
            Shift+Drag or Middle Click to Pan
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-purple-300/70 text-xs md:hidden">
            Drag to Pan • Pinch to Zoom
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <NodeModal node={editingNode} onClose={() => setEditingNode(null)} />

      {/* Edge Color Picker */}
      {edgeColorPicker && (
        <EdgeColorPicker
          isVisible={true}
          position={edgeColorPicker.position}
          currentColor={currentMap?.edges.find(e => e.id === edgeColorPicker.edgeId)?.color || '#8b5cf6'}
          onColorChange={(color) => {
            updateEdge(edgeColorPicker.edgeId, { color });
          }}
          onClose={() => setEdgeColorPicker(null)}
        />
      )}
    </>
  );
}
