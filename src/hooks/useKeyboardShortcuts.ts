import { useEffect, useState } from 'react';
import { useGraphStore } from '../store/graphStore';
import { Node } from 'reactflow';
import { NodeData } from '../types/node';
import useProjectFile from './useProjectFile';
import { useTemplateStore } from '../store/templateStore';

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
  
  // Use the project file hook to access file operations
  const { 
    hasContent, 
    createNewProject, 
    saveProject 
  } = useProjectFile();
  
  // Use template store for template selection
  const { setActiveTemplate } = useTemplateStore();
  
  // State for template selection dialog
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

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
          case 'n':
            event.preventDefault();
            // Confirm with user if there are unsaved changes
            if (hasContent() && window.confirm('You have unsaved changes. Create new project anyway?')) {
              // Set default template and create new project
              setShowTemplateDialog(true);
            } else if (!hasContent()) {
              // Set default template and create new project
              setShowTemplateDialog(true);
            }
            break;
          case 'o':
            event.preventDefault();
            // Prompt for opening a file
            if (hasContent() && window.confirm('You have unsaved changes. Open another project anyway?')) {
              // Create and trigger a file input
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = '.json';
              fileInput.click();
            } else if (!hasContent()) {
              // Create and trigger a file input
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = '.json';
              fileInput.click();
            }
            break;
          case 's':
            event.preventDefault();
            // Save the current project
            if (hasContent()) {
              saveProject();
            }
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
  }, [
    undo, 
    redo, 
    copy, 
    paste, 
    deselectAll, 
    selectNodes, 
    removeNode, 
    nodes, 
    selectedElements,
    hasContent,
    createNewProject,
    saveProject,
    setActiveTemplate
  ]);
  
  // Return the template dialog state for use in components
  return {
    showTemplateDialog,
    setShowTemplateDialog
  };
} 