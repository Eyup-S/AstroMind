'use client';

import { useRef, useState } from 'react';
import { useMindMapStore } from '@/lib/store';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';
import { importMapFromJSON } from '@/lib/persistence';

interface ToolbarProps {
  onOpenDrawer: () => void;
  onOpenNodesSidebar: () => void;
  onOpenSettings: () => void;
  onOpenHowToUse: () => void;
  onOpenPasteJson: () => void;
  onOpenGeneratePrompt: () => void;
}

export function Toolbar({
  onOpenDrawer,
  onOpenNodesSidebar,
  onOpenSettings,
  onOpenHowToUse,
  onOpenPasteJson,
  onOpenGeneratePrompt
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const {
    maps,
    currentMapId,
    createNewMap,
    addNode,
    startConnectionMode,
    connectionState,
    cancelConnection,
  } = useMindMapStore();

  const { themeColor, defaultNodeColor } = useSettingsStore();
  const currentThemeColor = getThemeColor(themeColor);

  const currentMap = maps.find((m) => m.id === currentMapId);

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
    addNode({
      title: 'New Node',
      shortNote: '',
      details: '',
      color: defaultNodeColor,
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

  return (
    <div
      className="h-16 md:h-16 bg-slate-900/80 backdrop-blur-md border-b flex items-center justify-between px-3 md:px-6 overflow-x-auto"
      style={{ borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
    >
      <div className="flex items-center gap-2 md:gap-4 min-w-0 shrink-0">
        {/* Drawer Menu Button */}
        <button
          onClick={onOpenDrawer}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Open mind maps menu"
          title="Mind Maps"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1
          className="text-xl md:text-2xl font-bold bg-clip-text text-transparent hidden sm:block"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7))`
          }}
        >
          Astro Mind
        </h1>

        {currentMap && (
          <span className="text-xs md:text-sm truncate max-w-[100px] md:max-w-none" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
            {currentMap.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        <button
          onClick={() => createNewMap('My New Mind Map')}
          className="px-2 md:px-4 py-2 rounded-lg transition-colors border text-xs md:text-sm font-medium"
          style={{
            backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
            borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
          }}
        >
          <span className="hidden sm:inline">New Map</span>
          <span className="sm:hidden">Map</span>
        </button>

        <button
          onClick={handleNewNode}
          disabled={!currentMapId}
          className="px-2 md:px-4 py-2 text-white rounded-lg transition-colors shadow-lg text-xs md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: currentThemeColor,
            boxShadow: `0 10px 15px -3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              const darkenedRgb = { r: Math.max(0, rgb.r - 20), g: Math.max(0, rgb.g - 20), b: Math.max(0, rgb.b - 20) };
              e.currentTarget.style.backgroundColor = `rgb(${darkenedRgb.r}, ${darkenedRgb.g}, ${darkenedRgb.b})`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = currentThemeColor;
          }}
        >
          <span className="hidden sm:inline">+ New Node</span>
          <span className="sm:hidden">+ Node</span>
        </button>

        <button
          onClick={handleToggleConnection}
          disabled={!currentMapId}
          className={`hidden lg:block px-4 py-2 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            connectionState.mode !== 'idle'
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/30'
              : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/30'
          }`}
        >
          {connectionState.mode !== 'idle' ? 'Cancel Connection' : 'Connect Nodes'}
        </button>

        <div
          className="w-px h-8 hidden md:block"
          style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
        />

        {/* Desktop buttons - hidden on mobile */}
        <button
          onClick={onOpenGeneratePrompt}
          className="hidden md:block px-2 md:px-4 py-2 bg-slate-800/50 rounded-lg transition-colors border text-xs md:text-sm font-medium"
          style={{
            borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.3)';
          }}
          title="Generate AI Prompt"
        >
          Generate Prompt
        </button>

        <button
          onClick={handleImportClick}
          className="hidden md:block px-2 md:px-4 py-2 bg-slate-800/50 rounded-lg transition-colors border text-xs md:text-sm font-medium"
          style={{
            borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.3)';
          }}
          title="Import mind map from JSON file"
        >
          Import JSON
        </button>

        <button
          onClick={onOpenPasteJson}
          className="hidden md:block px-2 md:px-4 py-2 bg-slate-800/50 rounded-lg transition-colors border text-xs md:text-sm font-medium"
          style={{
            borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.3)';
          }}
          title="Paste JSON directly"
        >
          Paste JSON
        </button>

        <button
          onClick={onOpenNodesSidebar}
          className="hidden md:block p-2 rounded-lg transition-colors"
          style={{
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Open nodes sidebar"
          title="Nodes & Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </button>

        <button
          onClick={onOpenHowToUse}
          className="hidden md:block p-2 rounded-lg transition-colors"
          style={{
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="How to use"
          title="How to Use"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          onClick={onOpenSettings}
          className="hidden md:block p-2 rounded-lg transition-colors"
          style={{
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Open settings"
          title="App Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Mobile menu button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{
            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="More options"
          title="More"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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

      {/* Mobile dropdown menu - rendered outside toolbar */}
      {showMobileMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-[9998] md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Menu */}
          <div
            className="fixed top-16 right-2 w-56 bg-slate-900/95 backdrop-blur-md rounded-lg shadow-2xl border overflow-hidden z-[9999] md:hidden"
            style={{
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
              boxShadow: `0 10px 25px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenGeneratePrompt();
                setShowMobileMenu(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3"
              style={{
                color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Prompt
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleImportClick();
                setShowMobileMenu(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3"
              style={{
                color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import JSON
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPasteJson();
                setShowMobileMenu(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3"
              style={{
                color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Paste JSON
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenNodesSidebar();
                setShowMobileMenu(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3"
              style={{
                color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Nodes & Settings
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenHowToUse();
                setShowMobileMenu(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3"
              style={{
                color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Use
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
                setShowMobileMenu(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3"
              style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              App Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}
