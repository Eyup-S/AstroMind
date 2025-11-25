'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, BackgroundType, ThemeColor } from '@/lib/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BACKGROUND_OPTIONS: Array<{ value: BackgroundType; label: string; description: string }> = [
  { value: 'space', label: 'Space', description: 'Animated starfield' },
  { value: 'gradient', label: 'Gradient', description: 'Smooth color gradients' },
  { value: 'grid', label: 'Grid', description: 'Minimal grid pattern' },
  { value: 'particles', label: 'Particles', description: 'Floating particles with connections' },
  { value: 'none', label: 'None', description: 'Solid dark background' },
];

const THEME_OPTIONS: Array<{ value: ThemeColor; label: string; color: string }> = [
  { value: 'purple', label: 'Purple', color: '#8b5cf6' },
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'green', label: 'Green', color: '#10b981' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'pink', label: 'Pink', color: '#ec4899' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { background, themeColor, setBackground, setThemeColor } = useSettingsStore();

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
            className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900/95 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl z-[101] max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-purple-500/30 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-purple-200">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-purple-300 hover:text-white"
                aria-label="Close settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Theme Color Section */}
              <div>
                <h3 className="text-lg font-semibold text-purple-200 mb-4">Theme Color</h3>
                <div className="grid grid-cols-5 gap-3">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setThemeColor(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        themeColor === option.value
                          ? 'border-white bg-white/10 scale-105'
                          : 'border-purple-500/30 hover:border-purple-400/50 hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded-lg mb-2"
                        style={{ backgroundColor: option.color }}
                      />
                      <p className="text-sm text-purple-200 font-medium text-center">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Section */}
              <div>
                <h3 className="text-lg font-semibold text-purple-200 mb-4">Background</h3>
                <div className="grid grid-cols-1 gap-3">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBackground(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        background === option.value
                          ? 'border-white bg-white/10'
                          : 'border-purple-500/30 hover:border-purple-400/50 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 font-medium">{option.label}</p>
                          <p className="text-sm text-purple-400/70">{option.description}</p>
                        </div>
                        {background === option.value && (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-purple-300">
                  Settings are saved automatically and will persist across sessions.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
