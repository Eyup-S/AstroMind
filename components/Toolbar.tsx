'use client';

import { useRef, useState } from 'react';
import { useMindMapStore } from '@/lib/store';
import { importMapFromJSON } from '@/lib/persistence';
import { PRESET_COLORS } from './ui/ColorPicker';
import { randomInt } from 'node:crypto';
import { randInt } from 'three/src/math/MathUtils.js';

interface ToolbarProps {
  onOpenDrawer: () => void;
  onOpenNodesSidebar: () => void;
}

export function Toolbar({ onOpenDrawer, onOpenNodesSidebar }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    maps,
    currentMapId,
    createNewMap,
    addNode,
    startConnectionMode,
    connectionState,
    cancelConnection,
    camera
  } = useMindMapStore();

  const currentMap = maps.find((m) => m.id === currentMapId);

  const [defaultColor, setDefaultColor ] = useState(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importMapFromJSON(content);

      if (result.success) {
        useMindMapStore.getState().importMap(result.map);
        alert('Map imported successfully!');
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };

    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  const handleNewNode = () => {
    if (!currentMapId) return;

    // Add node at center of viewport
    const centerX = window.innerWidth / 2 - 70; // 70 = half of node width
    const centerY = (window.innerHeight - 64) / 2 - 70; // 64 = toolbar height, 70 = half of node height
    const storedColor = localStorage.getItem("defaultNodeColor");
    let color = storedColor != null ? storedColor : (PRESET_COLORS.at(randInt(0,PRESET_COLORS.length-1)) || "#f97316");
    addNode({
      title: 'New Node',
      shortNote: '',
      details: '',
      color: color,
      variant: 'default',
      position: { x: centerX, y: centerY }
    });
  };

  const handleToggleConnection = () => {
    if (connectionState.mode === 'idle') {
      startConnectionMode();
    } else {
      cancelConnection();
    }
  };

  return (
    <div className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Drawer Menu Button */}
        <button
          onClick={onOpenDrawer}
          className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          aria-label="Open mind maps menu"
          title="Mind Maps"
        >
          <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Astro Mind
        </h1>

        {currentMap && (
          <span className="text-purple-300 text-sm">
            {currentMap.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => createNewMap('My New Mind Map')}
          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 rounded-lg transition-colors border border-purple-500/30 text-sm font-medium"
        >
          New Map
        </button>

        <button
          onClick={handleNewNode}
          disabled={!currentMapId}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/30 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + New Node
        </button>

        <button
          onClick={handleToggleConnection}
          disabled={!currentMapId}
          className={`px-4 py-2 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            connectionState.mode !== 'idle'
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/30'
              : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/30'
          }`}
        >
          {connectionState.mode !== 'idle' ? 'Cancel Connection' : 'Connect Nodes'}
        </button>

        <div className="w-px h-8 bg-purple-500/30" />

        <button
          onClick={handleImportClick}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-purple-200 rounded-lg transition-colors border border-purple-500/20 text-sm font-medium"
        >
          Import JSON
        </button>

        <button
          onClick={onOpenNodesSidebar}
          className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          aria-label="Open nodes sidebar"
          title="Nodes & Settings"
        >
          <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  );
}
