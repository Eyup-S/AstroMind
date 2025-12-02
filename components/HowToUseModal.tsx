'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToUseModal({ isOpen, onClose }: HowToUseModalProps) {
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

  const instructions = [
    {
      category: 'Creating Nodes',
      items: [
        'Click the "New Node" button in the toolbar to create a node at the center',
        'Double-click anywhere on the canvas to create a node at that location',
        'New nodes use the default color you set in the Nodes sidebar'
      ]
    },
    {
      category: 'Editing Nodes',
      items: [
        'Click a node to select it',
        'Click the gear icon that appears to open the edit modal',
        'Edit the title, short note, details, color, and style',
        'Double-click a node as a shortcut to edit it'
      ]
    },
    {
      category: 'Deleting Nodes',
      items: [
        'Click a node to select it',
        'Click the trash icon that appears',
        'Click again to confirm deletion (auto-cancels after 3 seconds)'
      ]
    },
    {
      category: 'Moving Nodes',
      items: [
        'Click and drag any node to reposition it',
        'Nodes can be freely moved anywhere on the canvas',
        'Position is automatically saved'
      ]
    },
    {
      category: 'Connecting Nodes',
      items: [
        'Click the "Connect Nodes" button in the toolbar',
        'Click on the source node (where the connection starts)',
        'Click on the target node (where the connection ends)',
        'Click "Cancel Connection" or press Escape to cancel'
      ]
    },
    {
      category: 'Editing Connections',
      items: [
        'Click on any connection line to change its color',
        'A color picker will appear at the click location',
        'Connections are automatically saved'
      ]
    },
    {
      category: 'Canvas Navigation',
      items: [
        'Use mouse wheel to zoom in/out (30% - 200%)',
        'Hold Shift + Drag to pan the canvas',
        'Or use middle mouse button to pan'
      ]
    },
    {
      category: 'Managing Mind Maps',
      items: [
        'Click the menu icon (☰) to open the mind maps drawer',
        'Create multiple mind maps with the "New Map" button',
        'Switch between maps by clicking on them',
        'Export maps as JSON files to share or backup'
      ]
    },
    {
      category: 'Customization',
      items: [
        'Click the settings icon to customize the app',
        'Choose from 5 theme colors',
        'Select from 5 background styles (Space, Gradient, Grid, Particles, None)',
        'Customize gradient colors, background color, or upload a custom image',
        'Set default colors for new nodes and connections'
      ]
    }
  ];

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
              boxShadow: `0 25px 50px -12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
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
                How to Use Astro Mind
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
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {instructions.map((section, index) => (
                  <div key={index}>
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}
                    >
                      {section.category}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start gap-3 text-slate-300"
                        >
                          <span
                            className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                            style={{ backgroundColor: currentThemeColor }}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div
                className="mt-8 p-4 rounded-xl"
                style={{
                  backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                }}
              >
                <h4
                  className="font-semibold mb-2 flex items-center gap-2"
                  style={{ color: currentThemeColor }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pro Tips
                </h4>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li>• All your data is stored locally in your browser</li>
                  <li>• Export your maps regularly to back them up</li>
                  <li>• Use different colors to categorize related nodes</li>
                  <li>• Experiment with different background styles to reduce eye strain</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t"
              style={{ borderTopColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }}
            >
              <button
                onClick={onClose}
                className="w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200"
                style={{ backgroundColor: currentThemeColor }}
                onMouseEnter={(e) => {
                  const darkenedRgb = { r: Math.max(0, rgb.r - 20), g: Math.max(0, rgb.g - 20), b: Math.max(0, rgb.b - 20) };
                  e.currentTarget.style.backgroundColor = `rgb(${darkenedRgb.r}, ${darkenedRgb.g}, ${darkenedRgb.b})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentThemeColor;
                }}
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
