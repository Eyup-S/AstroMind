'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MindMapNode } from '@/lib/types';

interface NodeTooltipProps {
  node: MindMapNode;
  isVisible: boolean;
  position: { x: number; y: number };
}

export function NodeTooltip({ node, isVisible, position }: NodeTooltipProps) {
  if (!node.details && !node.shortNote) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y + 150, // Below the node
            zIndex: 1000,
          }}
          className="bg-slate-900/95 backdrop-blur-md border border-purple-500/50 rounded-lg shadow-xl max-w-xs"
        >
          <div className="p-4 space-y-2">
            {node.shortNote && (
              <p className="text-sm text-purple-200 font-medium">{node.shortNote}</p>
            )}
            {node.details && (
              <p className="text-xs text-purple-300/80 leading-relaxed">{node.details}</p>
            )}
          </div>
          {/* Arrow pointer */}
          <div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-900/95 border-l border-t border-purple-500/50 rotate-45"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
