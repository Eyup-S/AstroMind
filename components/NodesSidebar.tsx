'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMindMapStore } from '@/lib/store';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';
import { PRESET_COLORS } from './ui/ColorPicker';
import { useState } from 'react';

interface NodesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onEditNode: (nodeId: string) => void;
}

export function NodesSidebar({ isOpen, onClose, onEditNode }: NodesSidebarProps) {
  const { maps, currentMapId, selectedNodeId, setSelectedNode, deleteNode } = useMindMapStore();
  const { themeColor, defaultEdgeColor, defaultNodeColor, setDefaultEdgeColor, setDefaultNodeColor } = useSettingsStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const currentMap = maps.find((m) => m.id === currentMapId);

  if (!currentMap) return null;

  const handleDeleteNode = (nodeId: string) => {
    if (deleteConfirm === nodeId) {
      deleteNode(nodeId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(nodeId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
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
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-md border-l shadow-2xl z-50 flex flex-col"
            style={{ borderLeftColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
          >
            {/* Header */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
            >
              <h2 className="text-lg font-semibold" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                Nodes & Settings
              </h2>
              <button
                onClick={onClose}
                className="transition-colors hover:text-white"
                style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}
                aria-label="Close sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Settings Section */}
            <div
              className="p-4 border-b space-y-4"
              style={{ borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }}
            >
              {/* Default Node Color */}
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                  Default Node Color
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setDefaultNodeColor(color)}
                      className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                        defaultNodeColor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Set default node color to ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Default Edge Color */}
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                  Default Connection Color
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setDefaultEdgeColor(color)}
                      className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                        defaultEdgeColor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Set default edge color to ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Nodes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h3 className="text-sm font-medium mb-3 sticky top-0 bg-slate-900/95 py-2" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                Nodes ({currentMap.nodes.length})
              </h3>

              {currentMap.nodes.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` }}>
                  No nodes yet
                </p>
              ) : (
                currentMap.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="group p-3 rounded-lg border transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: selectedNodeId === node.id ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : 'rgba(30, 41, 59, 0.5)',
                      borderColor: selectedNodeId === node.id ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)` : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                      boxShadow: selectedNodeId === node.id ? `0 10px 15px -3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedNodeId !== node.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
                        e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedNodeId !== node.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                        e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                      }
                    }}
                    onClick={() => handleNodeClick(node.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: node.color }}
                          />
                          <h4 className="text-sm font-medium text-white truncate">
                            {node.title || 'Untitled'}
                          </h4>
                        </div>
                        {node.shortNote && (
                          <p className="text-xs line-clamp-2" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)` }}>
                            {node.shortNote}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditNode(node.id);
                          }}
                          className="p-1.5 rounded transition-colors hover:text-white"
                          style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          aria-label="Edit node"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            deleteConfirm === node.id
                              ? 'bg-red-500/30 text-red-300'
                              : 'hover:bg-red-500/30 hover:text-red-300'
                          }`}
                          style={{ color: deleteConfirm === node.id ? undefined : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}
                          aria-label={deleteConfirm === node.id ? 'Confirm delete' : 'Delete node'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {deleteConfirm === node.id && (
                      <div className="mt-2 text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded">
                        Click again to confirm deletion
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
