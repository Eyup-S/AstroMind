'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';

interface GeneratePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GeneratePromptModal({ isOpen, onClose }: GeneratePromptModalProps) {
  const [userInput, setUserInput] = useState('');
  const [copied, setCopied] = useState(false);

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

  const generatePrompt = () => {
    const systemPrompt = `I'm using Astro Mind, a visual mind mapping application. I need you to generate a mind map in JSON format.

**About Astro Mind:**
- A mind mapping tool for organizing thoughts and visualizing ideas
- Supports customizable nodes with titles, notes, details, colors, and styles
- Nodes can be connected with edges to show relationships
- Each node has a position (x, y coordinates) for visual placement

**JSON Format Structure:**
{
  "id": "unique-map-id",
  "name": "Mind Map Name",
  "nodes": [
    {
      "id": "unique-node-id",
      "title": "Node Title",
      "shortNote": "Brief note (optional)",
      "details": "Detailed content (optional)",
      "color": "#hexcolor",
      "variant": "default|rounded|pill|outline",
      "position": { "x": number, "y": number }
    }
  ],
  "edges": [
    {
      "id": "unique-edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "color": "#hexcolor"
    }
  ]
}

**Requirements:**
- All IDs must be unique UUIDs or timestamp-based strings
- Colors must be valid hex codes (e.g., "#8b5cf6", "#3b82f6", "#10b981")
- Available node variants: "default", "rounded", "pill", "outline"
- Position coordinates should be spread out (e.g., x: 100-800, y: 100-600)
- Connect related nodes with edges to show relationships
- Use shortNote for brief descriptions and details for comprehensive content

**My Request:**
${userInput}

**IMPORTANT:** Return ONLY the JSON object, no explanations, no markdown code blocks, just pure JSON.`;

    return systemPrompt;
  };

  const handleGenerate = async () => {
    if (!userInput.trim()) return;

    const prompt = generatePrompt();

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setUserInput('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleClose = () => {
    setUserInput('');
    setCopied(false);
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
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: currentThemeColor }}
                >
                  Generate AI Prompt
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Create a prompt for AI chatbots to generate mind maps
                </p>
              </div>
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
                Describe what kind of mind map you want to create:
              </p>

              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Example: Create a mind map about project planning with phases like research, design, development, testing, and deployment. Include connections between related tasks."
                className="w-full h-48 px-4 py-3 bg-slate-800/50 border rounded-xl text-white resize-none focus:outline-none"
                style={{
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              {/* Info box */}
              <div
                className="mt-4 p-4 rounded-xl"
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
                  How it works
                </h4>
                <p className="text-sm text-slate-400">
                  The generated prompt will include our app's JSON format, instructions, and your request. Copy and paste it into ChatGPT, Claude, or any AI chatbot to get a ready-to-import mind map!
                </p>
              </div>

              {/* Success message */}
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Prompt copied to clipboard!
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
                onClick={handleGenerate}
                disabled={!userInput.trim() || copied}
                className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Generate & Copy
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
