'use client';

import { useEffect } from 'react';
import { SpaceBackground } from '@/components/SpaceBackground';
import { Toolbar } from '@/components/Toolbar';
import { Canvas } from '@/components/Canvas';
import { useMindMapStore } from '@/lib/store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Home() {
  const { maps, createNewMap } = useMindMapStore();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Create initial map if none exists
  useEffect(() => {
    if (maps.length === 0) {
      createNewMap('My First Mind Map');
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <SpaceBackground />
      <Toolbar />
      <Canvas className="flex-1" />
    </div>
  );
}
