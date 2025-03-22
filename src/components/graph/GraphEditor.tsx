import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css'; // Ensure styles are imported
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import NodePalette from '../palette/NodePalette';
import NodeTreeView from '../nodes/NodeTreeView';
import GraphErrorBoundary from '../error/GraphErrorBoundary';
import GraphCanvas from './components/GraphCanvas';
import GraphContextMenuHandler from './components/GraphContextMenuHandler';
import TemplateSelectionDialog from '../dialogs/TemplateSelectionDialog';
import NodeConfigurationDialog from '../configuration/NodeConfigurationDialog';
import { useTemplateStore } from '../../store/templateStore';
import { useGraphStore } from '../../store/graphStore';
import { useNodeOrganizationStore } from '../../store/nodeOrganizationStore';
import { NodeType } from '../../types/node';
import { createNewNode } from '../../utils/nodeUtils';

// Main container for the graph editor
const GraphContainer = styled('div')({
  width: '100%',
  height: '100vh',
  display: 'flex',
});

// Container for the canvas area
const CanvasContainer = styled('div')({
  flex: 1,
  position: 'relative',
  display: 'flex',
});

/**
 * GraphEditorInner - Internal component that composes the graph editor
 * Wraps the main graph components and manages their interactions
 */
const GraphEditorInner: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const { addNode, nodes, viewport } = useGraphStore();
  const { setActiveTemplate } = useTemplateStore();
  const { addNodeToFolder } = useNodeOrganizationStore();

  // Use keyboard shortcuts and get template dialog state
  const { showTemplateDialog, setShowTemplateDialog } = useKeyboardShortcuts();
  
  // This function will be passed to both the canvas and the context menu handler
  const handleContextMenu = (event: React.MouseEvent) => {
    // Prevent default browser context menu
    event.preventDefault();
    // Set context menu position
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX, mouseY: event.clientY }
        : null,
    );
  };
  
  // Handle node double-click to open configuration
  const handleNodeDoubleClick = (nodeId: string) => {
    setConfigNodeId(nodeId);
  };
  
  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplate(templateId);
    setShowTemplateDialog(false);
  };

  // Close the configuration dialog
  const handleCloseConfigDialog = () => {
    setConfigNodeId(null);
  };
  
  // Handle adding a node from the tree view
  const handleAddNode = (nodeType: NodeType) => {
    if (!nodeType || !addNode) return;
    
    // Get current viewport state for positioning
    const viewportX = viewport?.x ?? 0;
    const viewportY = viewport?.y ?? 0;
    const zoom = viewport?.zoom ?? 1;
    
    // Calculate position in the center of the viewport
    const posX = -viewportX / zoom + window.innerWidth / 2 / zoom;
    const posY = -viewportY / zoom + window.innerHeight / 2 / zoom;
    
    // Use the centralized node creation function
    const newNode = createNewNode(nodeType, { x: posX, y: posY });
    console.log('Creating new node:', newNode);
    
    // Add the node to the graph
    addNode(newNode);
    
    // Add the node to the default folder
    addNodeToFolder(newNode.id, 'default');
    
    // Automatically open the configuration dialog for the new node
    setConfigNodeId(newNode.id);
  };
  
  // Handle configuring a node from the tree view
  const handleConfigureNode = (nodeId: string) => {
    // Find the node in the current nodes array
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setConfigNodeId(node.id);
    }
  };

  return (
    <GraphContainer data-testid="graph-container">
      <NodePalette />
      <CanvasContainer>
        <GraphErrorBoundary>
          <GraphContextMenuHandler onContextMenu={handleContextMenu}>
            <GraphCanvas 
              onContextMenu={handleContextMenu} 
              onNodeDoubleClick={handleNodeDoubleClick}
            />
          </GraphContextMenuHandler>
        </GraphErrorBoundary>
      </CanvasContainer>
      <NodeTreeView 
        onAddNode={handleAddNode} 
        onConfigureNode={handleConfigureNode}
      />
      
      {/* Template Selection Dialog */}
      <TemplateSelectionDialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      
      {/* Node Configuration Dialog */}
      <NodeConfigurationDialog
        open={configNodeId !== null}
        nodeId={configNodeId}
        onClose={handleCloseConfigDialog}
      />
    </GraphContainer>
  );
};

/**
 * GraphEditor - Main component for the graph editor
 * Provides the ReactFlow context and error boundary
 */
const GraphEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <GraphErrorBoundary componentName="Graph Editor">
        <GraphEditorInner />
      </GraphErrorBoundary>
    </ReactFlowProvider>
  );
};

export default GraphEditor; 