'use client';

import { useState, useEffect } from 'react';
import { MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';
import { Modal } from './ui/Modal';
import { ColorPicker } from './ui/ColorPicker';
import { VariantSelector } from './ui/VariantSelector';

interface NodeModalProps {
  node: MindMapNode | null;
  onClose: () => void;
}

export function NodeModal({ node, onClose }: NodeModalProps) {
  const { updateNode, deleteNode } = useMindMapStore();
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

  const [title, setTitle] = useState('');
  const [shortNote, setShortNote] = useState('');
  const [details, setDetails] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [variant, setVariant] = useState<MindMapNode['variant']>('default');

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setShortNote(node.shortNote || '');
      setDetails(node.details || '');
      setColor(node.color);
      setVariant(node.variant);
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;

    updateNode(node.id, {
      title,
      shortNote,
      details,
      color,
      variant
    });

    onClose();
  };

  const handleDelete = () => {
    if (!node) return;
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNode(node.id);
      onClose();
    }
  };

  if (!node) return null;

  return (
    <Modal isOpen={!!node} onClose={onClose} title="Edit Node">
      <div className="p-6 space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
              e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder="Node title..."
            autoFocus
          />
        </div>

        {/* Short Note Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
            Short Note
          </label>
          <input
            type="text"
            value={shortNote}
            onChange={(e) => setShortNote(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
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
            placeholder="Brief description..."
          />
        </div>

        {/* Details Textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
            Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none"
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
            placeholder="Additional details..."
          />
        </div>

        {/* Color Picker */}
        <ColorPicker value={color} onChange={setColor} />

        {/* Variant Selector */}
        <VariantSelector value={variant} onChange={setVariant} />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 text-white font-medium rounded-lg transition-colors shadow-lg"
            style={{
              backgroundColor: currentThemeColor,
              boxShadow: `0 10px 15px -3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
            }}
            onMouseEnter={(e) => {
              const darkenedRgb = { r: Math.max(0, rgb.r - 20), g: Math.max(0, rgb.g - 20), b: Math.max(0, rgb.b - 20) };
              e.currentTarget.style.backgroundColor = `rgb(${darkenedRgb.r}, ${darkenedRgb.g}, ${darkenedRgb.b})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = currentThemeColor;
            }}
          >
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors border border-red-500/30"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 font-medium rounded-lg transition-colors border"
            style={{
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
              color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
