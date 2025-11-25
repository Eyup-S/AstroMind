'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMindMapStore } from '@/lib/store';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';
import { exportMapAsJSON } from '@/lib/persistence';

interface MindMapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MindMapDrawer({ isOpen, onClose }: MindMapDrawerProps) {
  const { maps, currentMapId, setCurrentMap, deleteMap, updateMapName } = useMindMapStore();
  const { themeColor } = useSettingsStore();
  const currentThemeColor = getThemeColor(themeColor);

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

  const handleSelectMap = (mapId: string) => {
    setCurrentMap(mapId);
    onClose();
  };

  const handleDeleteMap = (mapId: string, mapName: string) => {
    if (confirm(`Are you sure you want to delete "${mapName}"?`)) {
      deleteMap(mapId);
      if (maps.length <= 1) {
        onClose();
      }
    }
  };

  const handleExportMap = (mapId: string) => {
    const map = maps.find(m => m.id === mapId);
    if (map) {
      exportMapAsJSON(map);
    }
  };

  const handleRenameMap = (mapId: string, currentName: string) => {
    const newName = prompt('Enter new name for the mind map:', currentName);
    if (newName && newName.trim() && newName !== currentName) {
      updateMapName(mapId, newName.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-md border-r z-50 shadow-2xl"
            style={{
              borderRightColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
              boxShadow: `0 25px 50px -12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
            }}
          >
            {/* Header */}
            <div
              className="p-6 border-b"
              style={{ borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7))`
                  }}
                >
                  Mind Maps
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Close drawer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm mt-2" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                {maps.length} {maps.length === 1 ? 'map' : 'maps'}
              </p>
            </div>

            {/* Map List */}
            <div className="overflow-y-auto h-[calc(100vh-120px)] p-4 space-y-2">
              {maps.length === 0 ? (
                <div className="text-center py-8" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                  <p>No mind maps yet</p>
                  <p className="text-sm mt-2" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` }}>
                    Create one to get started!
                  </p>
                </div>
              ) : (
                maps.map((map) => {
                  const isActive = map.id === currentMapId;
                  const nodeCount = map.nodes.length;
                  const edgeCount = map.edges.length;

                  return (
                    <div
                      key={map.id}
                      className="p-4 rounded-lg border transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : 'rgba(30, 41, 59, 0.5)',
                        borderColor: isActive ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)` : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                        boxShadow: isActive ? `0 10px 15px -3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
                          e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                          e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                        }
                      }}
                    >
                      {/* Map Info */}
                      <div
                        className="cursor-pointer mb-3"
                        onClick={() => handleSelectMap(map.id)}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg leading-tight" style={{ color: isActive ? 'white' : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                            {map.name}
                          </h3>
                          {isActive && (
                            <span
                              className="text-xs text-white px-2 py-1 rounded-full"
                              style={{ backgroundColor: currentThemeColor }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                          <span>{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
                          <span>{edgeCount} connection{edgeCount !== 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` }}>
                          Updated {new Date(map.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRenameMap(map.id, map.name)}
                          className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-sm rounded transition-colors"
                          style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}
                          title="Rename"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleExportMap(map.id)}
                          className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 text-sm rounded transition-colors border border-blue-500/30"
                          title="Export as JSON"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => handleDeleteMap(map.id, map.name)}
                          className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded transition-colors border border-red-500/30"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
