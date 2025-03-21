import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { styled } from '@mui/material/styles';

import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import NodePalette from '../palette/NodePalette';
import NodeConfiguration from '../configuration/NodeConfiguration';
import GraphErrorBoundary from '../error/GraphErrorBoundary';
import GraphCanvas from './components/GraphCanvas';
import GraphContextMenuHandler from './components/GraphContextMenuHandler';

// Main container for the graph editor
const GraphContainer = styled('div')({
  width: '100%',
  height: '100vh',
  display: 'flex',
});

/**
 * GraphEditorInner - Internal component that composes the graph editor
 * Wraps the main graph components and manages their interactions
 */
const GraphEditorInner: React.FC = () => {
  // Use keyboard shortcuts
  useKeyboardShortcuts();

  // This function will be passed to both the canvas and the context menu handler
  const handleContextMenu = (event: React.MouseEvent) => {
    // Additional context menu handling if needed
  };

  return (
    <GraphContainer data-testid="graph-container">
      <GraphErrorBoundary componentName="Node Palette">
        <NodePalette />
      </GraphErrorBoundary>
      
      <GraphContextMenuHandler onContextMenu={handleContextMenu} />
      
      <GraphCanvas onContextMenu={handleContextMenu} />
      
      <GraphErrorBoundary componentName="Node Configuration">
        <NodeConfiguration />
      </GraphErrorBoundary>
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