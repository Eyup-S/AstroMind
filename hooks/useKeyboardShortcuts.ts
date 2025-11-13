import { useEffect } from 'react';
import { useMindMapStore } from '@/lib/store';

export function useKeyboardShortcuts() {
  const {
    selectedNodeId,
    selectedEdgeId,
    deleteNode,
    deleteEdge,
    connectionState,
    cancelConnection
  } = useMindMapStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete key - remove selected node or edge
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId) {
          event.preventDefault();
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          event.preventDefault();
          deleteEdge(selectedEdgeId);
        }
      }

      // Escape key - cancel connection mode or deselect
      if (event.key === 'Escape') {
        if (connectionState.mode !== 'idle') {
          event.preventDefault();
          cancelConnection();
        }
      }

      // Ctrl+S or Cmd+S - show save toast (autosave already happening)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        // Could trigger a toast notification here
        console.log('State automatically saved to localStorage');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedNodeId,
    selectedEdgeId,
    deleteNode,
    deleteEdge,
    connectionState,
    cancelConnection
  ]);
}
