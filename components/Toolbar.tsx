'use client';

import { useRef } from 'react';
import { useMindMapStore } from '@/lib/store';
import {
  exportMapAsJSON,
  importMapFromJSON
} from '@/lib/persistence';

export function Toolbar() {
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

  const handleExport = () => {
    if (!currentMap) return;
    exportMapAsJSON(currentMap);
  };

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

    // Add node near center of viewport
    const centerX = (window.innerWidth / 2 - camera.x) / camera.zoom;
    const centerY = (window.innerHeight / 2 - camera.y) / camera.zoom;

    addNode({
      title: 'New Node',
      shortNote: '',
      details: '',
      color: '#8b5cf6',
      variant: 'default',
      position: { x: centerX - 80, y: centerY - 30 }
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
          onClick={() => createNewMap('New Mind Map')}
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
          onClick={handleExport}
          disabled={!currentMap}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-purple-200 rounded-lg transition-colors border border-purple-500/20 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export JSON
        </button>

        <button
          onClick={handleImportClick}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-purple-200 rounded-lg transition-colors border border-purple-500/20 text-sm font-medium"
        >
          Import JSON
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
