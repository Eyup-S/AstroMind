'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div
              className="bg-slate-900/95 backdrop-blur-md border rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              style={{
                borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
                boxShadow: `0 25px 50px -12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
              }}
            >
              {title && (
                <div
                  className="px-6 py-4 border-b"
                  style={{ borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }}
                >
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>
              )}
              <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
