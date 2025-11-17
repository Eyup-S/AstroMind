'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PRESET_COLORS } from './ui/ColorPicker';

interface EdgeColorPickerProps {
  isVisible: boolean;
  position: { x: number; y: number };
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export function EdgeColorPicker({
  isVisible,
  position,
  currentColor,
  onColorChange,
  onClose,
}: EdgeColorPickerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={onClose}
          />

          {/* Color picker modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 1000,
            }}
            className="bg-slate-900/95 backdrop-blur-md border border-purple-500/50 rounded-lg shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-medium text-purple-200 mb-3">Edge Color</h3>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onColorChange(color);
                    onClose();
                  }}
                  className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                    currentColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
