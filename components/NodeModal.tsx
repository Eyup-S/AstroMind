'use client';

import { useState, useEffect } from 'react';
import { MindMapNode } from '@/lib/types';
import { useMindMapStore } from '@/lib/store';
import { Modal } from './ui/Modal';
import { ColorPicker } from './ui/ColorPicker';
import { VariantSelector } from './ui/VariantSelector';

interface NodeModalProps {
  node: MindMapNode | null;
  onClose: () => void;
}

export function NodeModal({ node, onClose }: NodeModalProps) {
  const { updateNode, deleteNode } = useMindMapStore();

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
          <label className="block text-sm font-medium text-purple-300">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="Node title..."
            autoFocus
          />
        </div>

        {/* Short Note Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-300">
            Short Note
          </label>
          <input
            type="text"
            value={shortNote}
            onChange={(e) => setShortNote(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="Brief description..."
          />
        </div>

        {/* Details Textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-300">
            Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
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
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-purple-500/30"
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
            className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-purple-200 font-medium rounded-lg transition-colors border border-purple-500/20"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
