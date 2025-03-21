import { useEffect } from 'react';
import useGraphStore from '../store/graphStore';

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
};

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.altKey === !!shortcut.altKey
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

export const useCommonKeyboardShortcuts = () => {
  const { undo, redo, copySelectedElements, pasteElements } = useGraphStore();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'z',
      ctrlKey: true,
      action: undo,
    },
    {
      key: 'y',
      ctrlKey: true,
      action: redo,
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: redo,
    },
    {
      key: 'c',
      ctrlKey: true,
      action: copySelectedElements,
    },
    {
      key: 'v',
      ctrlKey: true,
      action: pasteElements,
    },
    {
      key: 'Delete',
      action: () => {
        const { nodes, edges, selectedElements, onNodesChange, onEdgesChange } = useGraphStore.getState();
        
        // Delete selected nodes
        if (selectedElements.nodes.length > 0) {
          const nodeChanges = selectedElements.nodes.map(id => ({
            id,
            type: 'remove' as const,
          }));
          onNodesChange(nodeChanges);
        }
        
        // Delete selected edges
        if (selectedElements.edges.length > 0) {
          const edgeChanges = selectedElements.edges.map(id => ({
            id,
            type: 'remove' as const,
          }));
          onEdgesChange(edgeChanges);
        }
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
}; 