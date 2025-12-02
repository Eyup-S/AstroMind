'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';
import { useMindMapStore } from '@/lib/store';
import { importMapFromJSON } from '@/lib/persistence';

interface PasteJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasteJsonModal({ isOpen, onClose }: PasteJsonModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleImport = () => {
    setError('');
    setSuccess(false);

    // Sanitize and validate input
    const sanitizedInput = jsonInput.trim();

    if (!sanitizedInput) {
      setError('Please paste JSON content');
      return;
    }

    try {
      // Parse JSON to validate it
      JSON.parse(sanitizedInput);
    } catch (e) {
      setError('Invalid JSON format. Please check your input.');
      return;
    }

    // Import the map
    const result = importMapFromJSON(sanitizedInput);

    if (result.success) {
      useMindMapStore.getState().importMap(result.map);
      setSuccess(true);
      setJsonInput('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } else {
      setError(`Import failed: ${result.error}`);
    }
  };

  const handleClose = () => {
    setJsonInput('');
    setError('');
    setSuccess(false);
    onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
              boxShadow: `0 25px 50px -12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
              zIndex: 9999
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }}
            >
              <h2
                className="text-2xl font-bold"
                style={{ color: currentThemeColor }}
              >
                Paste JSON
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-slate-300 mb-4">
                Paste your mind map JSON content below:
              </p>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"id": "...", "name": "My Mind Map", "nodes": [...], "edges": [...]}'
                className="w-full h-64 px-4 py-3 bg-slate-800/50 border rounded-xl text-white font-mono text-sm resize-none focus:outline-none"
                style={{
                  borderColor: error ? 'rgb(220, 38, 38)' : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              />

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Success message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
                >
                  Map imported successfully!
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t flex gap-3 justify-end"
              style={{ borderTopColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }}
            >
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-lg transition-all duration-200 border text-slate-300"
                style={{
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
                  backgroundColor: 'rgba(30, 41, 59, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!jsonInput.trim() || success}
                className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: currentThemeColor }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    const darkenedRgb = { r: Math.max(0, rgb.r - 20), g: Math.max(0, rgb.g - 20), b: Math.max(0, rgb.b - 20) };
                    e.currentTarget.style.backgroundColor = `rgb(${darkenedRgb.r}, ${darkenedRgb.g}, ${darkenedRgb.b})`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = currentThemeColor;
                  }
                }}
              >
                Import
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
