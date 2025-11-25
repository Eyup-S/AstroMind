'use client';

import { useEffect, useState } from 'react';
import { SpaceBackground } from '@/components/SpaceBackground';
import { GradientBackground } from '@/components/backgrounds/GradientBackground';
import { GridBackground } from '@/components/backgrounds/GridBackground';
import { ParticlesBackground } from '@/components/backgrounds/ParticlesBackground';
import { Toolbar } from '@/components/Toolbar';
import { Canvas } from '@/components/Canvas';
import { MindMapDrawer } from '@/components/MindMapDrawer';
import { NodesSidebar } from '@/components/NodesSidebar';
import { NodeModal } from '@/components/NodeModal';
import { SettingsModal } from '@/components/SettingsModal';
import { useMindMapStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Home() {
  const { maps, createNewMap } = useMindMapStore();
  const { background, loadSettings } = useSettingsStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNodesSidebarOpen, setIsNodesSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Create initial map with a centered node if none exists
  useEffect(() => {
    if (maps.length === 0) {
      createNewMap('My First Mind Map');
      // Wait for map to be created, then add initial node
      setTimeout(() => {
        const { addNode } = useMindMapStore.getState();
        addNode({
          title: 'Start Here',
          shortNote: 'Double-click to edit',
          details: '',
          color: '#8b5cf6',
          variant: 'default',
          position: {
            x: window.innerWidth / 2 - 70,
            y: (window.innerHeight - 64) / 2 - 70
          }
        });
      }, 100);
    }
  }, []);

  const handleEditNode = (nodeId: string) => {
    // Find the node and store it for editing
    const currentMap = maps.find(m => m.id === useMindMapStore.getState().currentMapId);
    const node = currentMap?.nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNodeId(nodeId);
    }
  };

  // Get the editing node
  const currentMap = maps.find(m => m.id === useMindMapStore.getState().currentMapId);
  const editingNode = editingNodeId
    ? currentMap?.nodes.find(n => n.id === editingNodeId) || null
    : null;

  // Render appropriate background
  const renderBackground = () => {
    switch (background) {
      case 'space':
        return <SpaceBackground />;
      case 'gradient':
        return <GradientBackground />;
      case 'grid':
        return <GridBackground />;
      case 'particles':
        return <ParticlesBackground />;
      case 'none':
        return <div className="fixed inset-0 bg-slate-950 -z-10" />;
      default:
        return <SpaceBackground />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {renderBackground()}
      <Toolbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenNodesSidebar={() => setIsNodesSidebarOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <Canvas className="flex-1" />
      <MindMapDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <NodesSidebar
        isOpen={isNodesSidebarOpen}
        onClose={() => setIsNodesSidebarOpen(false)}
        onEditNode={handleEditNode}
      />
      <NodeModal node={editingNode} onClose={() => setEditingNodeId(null)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
