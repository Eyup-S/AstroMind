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
import { LandingPage } from '@/components/LandingPage';
import { HowToUseModal } from '@/components/HowToUseModal';
import { PasteJsonModal } from '@/components/PasteJsonModal';
import { GeneratePromptModal } from '@/components/GeneratePromptModal';
import { useMindMapStore } from '@/lib/store';
import { useSettingsStore } from '@/lib/settingsStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Home() {
  const { maps, createNewMap } = useMindMapStore();
  const { background, noneBackgroundColor, customBackgroundImage, loadSettings } = useSettingsStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNodesSidebarOpen, setIsNodesSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isPasteJsonOpen, setIsPasteJsonOpen] = useState(false);
  const [isGeneratePromptOpen, setIsGeneratePromptOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [showLandingPage, setShowLandingPage] = useState(true);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Check if user has visited before
  useEffect(() => {
    const hasVisited = localStorage.getItem('astro-mind-visited');
    if (hasVisited === 'true') {
      setShowLandingPage(false);
    }
  }, []);

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

  const handleStartApp = () => {
    localStorage.setItem('astro-mind-visited', 'true');
    setShowLandingPage(false);
  };

  // Get the editing node
  const currentMap = maps.find(m => m.id === useMindMapStore.getState().currentMapId);
  const editingNode = editingNodeId
    ? currentMap?.nodes.find(n => n.id === editingNodeId) || null
    : null;

  // Render appropriate background
  const renderBackground = () => {
    // If custom image is set, show it with the selected background overlay
    if (customBackgroundImage) {
      return (
        <>
          <div
            className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${customBackgroundImage})` }}
          />
          <div className="fixed inset-0 -z-10 bg-black/50" />
          {background !== 'none' && (
            <div className="fixed inset-0 -z-10 opacity-30">
              {background === 'space' && <SpaceBackground />}
              {background === 'gradient' && <GradientBackground />}
              {background === 'grid' && <GridBackground />}
              {background === 'particles' && <ParticlesBackground />}
            </div>
          )}
        </>
      );
    }

    // Regular backgrounds without custom image
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
        return (
          <div
            className="fixed inset-0 -z-10"
            style={{ backgroundColor: noneBackgroundColor }}
          />
        );
      default:
        return <SpaceBackground />;
    }
  };

  // Show landing page for first-time visitors
  if (showLandingPage) {
    return <LandingPage onStart={handleStartApp} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {renderBackground()}
      <Toolbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenNodesSidebar={() => setIsNodesSidebarOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowToUse={() => setIsHowToUseOpen(true)}
        onOpenPasteJson={() => setIsPasteJsonOpen(true)}
        onOpenGeneratePrompt={() => setIsGeneratePromptOpen(true)}
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
      <HowToUseModal isOpen={isHowToUseOpen} onClose={() => setIsHowToUseOpen(false)} />
      <PasteJsonModal isOpen={isPasteJsonOpen} onClose={() => setIsPasteJsonOpen(false)} />
      <GeneratePromptModal isOpen={isGeneratePromptOpen} onClose={() => setIsGeneratePromptOpen(false)} />
    </div>
  );
}
