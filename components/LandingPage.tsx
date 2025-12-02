'use client';

import { motion } from 'framer-motion';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
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

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
      ),
      title: 'Visual Mind Mapping',
      description: 'Create beautiful, interactive mind maps with customizable nodes and connections'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      title: 'Fully Customizable',
      description: 'Choose from multiple themes, backgrounds, and node styles to match your preference'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      title: 'Import & Export',
      description: 'Save your mind maps locally and share them as JSON files'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Fast & Intuitive',
      description: 'Smooth interactions with drag & drop, zoom, pan, and keyboard shortcuts'
    }
  ];

  const instructions = [
    {
      step: '1',
      title: 'Create Nodes',
      description: 'Click "New Node" button or double-click anywhere on the canvas to create a new node'
    },
    {
      step: '2',
      title: 'Edit Nodes',
      description: 'Click a node to select it, then use the gear icon to edit or trash icon to delete'
    },
    {
      step: '3',
      title: 'Connect Nodes',
      description: 'Click "Connect Nodes", select a source node, then click the target node to create a connection'
    },
    {
      step: '4',
      title: 'Organize',
      description: 'Drag nodes to reposition, use mouse wheel to zoom, and Shift+Drag to pan the canvas'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-y-auto">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3), transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2), transparent 50%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1
            className="text-6xl font-bold mb-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6))`
            }}
          >
            Astro Mind
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Transform Your Ideas into Visual Connections
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A beautiful, intuitive mind mapping tool that helps you organize thoughts,
            plan projects, and visualize complex ideas with ease.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}
          >
            Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-xl backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
                }}
              >
                <div
                  className="mb-4"
                  style={{ color: currentThemeColor }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How to Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}
          >
            How to Use
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {instructions.map((instruction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="flex gap-4"
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: currentThemeColor }}
                >
                  {instruction.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {instruction.title}
                  </h3>
                  <p className="text-slate-400">
                    {instruction.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={onStart}
            className="px-12 py-4 text-white text-xl font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: currentThemeColor,
              boxShadow: `0 20px 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
            }}
            onMouseEnter={(e) => {
              const darkenedRgb = { r: Math.max(0, rgb.r - 20), g: Math.max(0, rgb.g - 20), b: Math.max(0, rgb.b - 20) };
              e.currentTarget.style.backgroundColor = `rgb(${darkenedRgb.r}, ${darkenedRgb.g}, ${darkenedRgb.b})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = currentThemeColor;
            }}
          >
            Start Creating
          </button>
          <p className="mt-4 text-slate-500 text-sm">
            No sign-up required • Works offline • Free forever
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="mt-16 text-center text-slate-500 text-sm"
        >
          <p>Press the Help button in the app anytime to see these instructions again</p>
        </motion.div>
      </div>
    </div>
  );
}
