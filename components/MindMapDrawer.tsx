'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMindMapStore } from '@/lib/store';
import { exportMapAsJSON } from '@/lib/persistence';

interface MindMapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MindMapDrawer({ isOpen, onClose }: MindMapDrawerProps) {
  const { maps, currentMapId, setCurrentMap, deleteMap, updateMapName } = useMindMapStore();

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
            className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-md border-r border-purple-500/30 z-50 shadow-2xl shadow-purple-500/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-purple-500/30">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Mind Maps
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                  aria-label="Close drawer"
                >
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-purple-300 mt-2">
                {maps.length} {maps.length === 1 ? 'map' : 'maps'}
              </p>
            </div>

            {/* Map List */}
            <div className="overflow-y-auto h-[calc(100vh-120px)] p-4 space-y-2">
              {maps.length === 0 ? (
                <div className="text-center text-purple-300 py-8">
                  <p>No mind maps yet</p>
                  <p className="text-sm text-purple-400 mt-2">Create one to get started!</p>
                </div>
              ) : (
                maps.map((map) => {
                  const isActive = map.id === currentMapId;
                  const nodeCount = map.nodes.length;
                  const edgeCount = map.edges.length;

                  return (
                    <div
                      key={map.id}
                      className={`
                        p-4 rounded-lg border transition-all duration-200
                        ${isActive
                          ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                          : 'bg-slate-800/50 border-purple-500/20 hover:bg-slate-800/80 hover:border-purple-500/40'
                        }
                      `}
                    >
                      {/* Map Info */}
                      <div
                        className="cursor-pointer mb-3"
                        onClick={() => handleSelectMap(map.id)}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className={`font-semibold text-lg leading-tight ${isActive ? 'text-white' : 'text-purple-200'}`}>
                            {map.name}
                          </h3>
                          {isActive && (
                            <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-purple-300">
                          <span>{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
                          <span>{edgeCount} connection{edgeCount !== 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-xs text-purple-400 mt-1">
                          Updated {new Date(map.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRenameMap(map.id, map.name)}
                          className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-purple-200 text-sm rounded transition-colors"
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
