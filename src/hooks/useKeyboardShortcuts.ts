import { useEffect } from 'react';
import useGraphStore from '../store/graphStore';
import { Node } from 'reactflow';
import { NodeData } from '../types/node';

export function useKeyboardShortcuts() {
  const { undo, redo, copy, paste, deselectAll } = useGraphStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore events from input elements
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle keyboard shortcuts
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            event.preventDefault();
            undo();
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
          case 'c':
            event.preventDefault();
            copy();
            break;
          case 'v':
            event.preventDefault();
            paste();
            break;
          case 'a':
            event.preventDefault();
            // Select all nodes
            const nodes = useGraphStore.getState().nodes;
            useGraphStore.getState().selectNodes(nodes.map((node: Node<NodeData>) => node.id));
            break;
          case 'escape':
            event.preventDefault();
            deselectAll();
            break;
        }
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        // Delete selected nodes
        const selectedNodes = useGraphStore.getState().selectedElements.nodes;
        selectedNodes.forEach((nodeId: string) => {
          useGraphStore.getState().removeNode(nodeId);
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, copy, paste, deselectAll]);
} 