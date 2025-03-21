import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { styled } from '@mui/material/styles';

import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import NodePalette from '../palette/NodePalette';
import ResultsPanel from '../results/ResultsPanel';
import GraphErrorBoundary from '../error/GraphErrorBoundary';
import GraphCanvas from './components/GraphCanvas';
import GraphContextMenuHandler from './components/GraphContextMenuHandler';
import TemplateSelectionDialog from '../dialogs/TemplateSelectionDialog';
import { useTemplateStore } from '../../store/templateStore';

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
  // Use keyboard shortcuts and get template dialog state
  const { showTemplateDialog, setShowTemplateDialog } = useKeyboardShortcuts();
  
  // Use template store for setting the active template
  const { setActiveTemplate } = useTemplateStore();

  // This function will be passed to both the canvas and the context menu handler
  const handleContextMenu = (event: React.MouseEvent) => {
    // Prevent default browser context menu
    event.preventDefault();
  };
  
  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplate(templateId);
    setShowTemplateDialog(false);
  };

  return (
    <GraphContainer data-testid="graph-container">
      <GraphErrorBoundary componentName="Node Palette">
        <NodePalette />
      </GraphErrorBoundary>
      
      <GraphContextMenuHandler onContextMenu={handleContextMenu} />
      
      <GraphCanvas onContextMenu={handleContextMenu} />
      
      <GraphErrorBoundary componentName="Results Panel">
        <ResultsPanel />
      </GraphErrorBoundary>
      
      {/* Template Selection Dialog */}
      <TemplateSelectionDialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSelectTemplate={handleSelectTemplate}
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