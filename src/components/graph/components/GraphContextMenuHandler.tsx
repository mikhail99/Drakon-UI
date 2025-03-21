import React, { useState, useCallback } from 'react';
import ContextMenu, { ContextMenuPosition } from '../../menu/ContextMenu';
import { useGraphStore } from '../../../store/graphStore';

interface GraphContextMenuHandlerProps {
  onContextMenu: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
}

/**
 * GraphContextMenuHandler - Manages the graph context menu
 * Handles opening, closing, and actions for the right-click context menu
 */
const GraphContextMenuHandler: React.FC<GraphContextMenuHandlerProps> = ({ 
  onContextMenu,
  children 
}) => {
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    position: ContextMenuPosition;
  }>({
    open: false,
    position: { x: 0, y: 0 },
  });
  
  const { selectedElements, clipboard } = useGraphStore();
  
  // Detect if there's content in the clipboard
  const hasClipboardContent = clipboard != null && 
    ((clipboard.nodes != null && clipboard.nodes.length > 0) || 
     (clipboard.edges != null && clipboard.edges.length > 0));

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, open: false });
  };
  
  // Handle context menu open
  const handleContextMenu = (event: React.MouseEvent) => {
    // Prevent default context menu
    event.preventDefault();
    
    // Get mouse position
    setContextMenu({
      open: true,
      position: { x: event.clientX, y: event.clientY },
    });
    
    // Call the passed onContextMenu handler
    onContextMenu(event);
  };
  
  // Allow drag events to pass through
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // Don't stop propagation - let the event bubble to inner components
  };
  
  // Handle delete action from context menu
  const handleDelete = useCallback(() => {
    try {
      const { selectedElements, onNodesChange, onEdgesChange } = useGraphStore.getState();
      
      // Delete selected nodes
      if (selectedElements.nodes.length > 0) {
        const nodeChanges = selectedElements.nodes.map((id: string) => ({
          id,
          type: 'remove' as const,
        }));
        onNodesChange(nodeChanges);
      }
      
      // Delete selected edges
      if (selectedElements.edges.length > 0) {
        const edgeChanges = selectedElements.edges.map((id: string) => ({
          id,
          type: 'remove' as const,
        }));
        onEdgesChange(edgeChanges);
      }
    } catch (error) {
      console.error('Error deleting elements:', error);
    }
  }, []);

  // Handle copy and paste actions
  const handleCopy = useCallback(() => {
    try {
      useGraphStore().copySelectedElements();
    } catch (error) {
      console.error('Error copying elements:', error);
    }
  }, []);

  const handlePaste = useCallback(() => {
    try {
      useGraphStore().pasteElements();
    } catch (error) {
      console.error('Error pasting elements:', error);
    }
  }, []);

  return (
    <div 
      onContextMenu={handleContextMenu} 
      onDragOver={handleDragOver}
      style={{ 
        display: 'flex', 
        flex: 1, 
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      {children}
      <ContextMenu
        open={contextMenu.open}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onDelete={handleDelete}
        hasSelection={selectedElements.nodes.length > 0 || selectedElements.edges.length > 0}
        hasClipboard={hasClipboardContent}
      />
    </div>
  );
};

export default GraphContextMenuHandler; 