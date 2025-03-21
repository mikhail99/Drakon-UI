import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';
import { Node } from 'reactflow';
import { NodeData } from '../types/node';

export function useKeyboardShortcuts() {
  const graphStore = useGraphStore();
  const { 
    undo, 
    redo, 
    copy, 
    paste, 
    deselectAll, 
    selectNodes, 
    removeNode, 
    nodes, 
    selectedElements 
  } = graphStore;

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
            selectNodes(nodes.map((node: Node<NodeData>) => node.id));
            break;
          case 'escape':
            event.preventDefault();
            deselectAll();
            break;
        }
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        // Delete selected nodes
        const nodesToDelete = selectedElements.nodes;
        nodesToDelete.forEach((nodeId: string) => {
          removeNode(nodeId);
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, copy, paste, deselectAll, selectNodes, removeNode, nodes, selectedElements]);
} 