import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  NodeTypes,
  useReactFlow,
  OnSelectionChangeParams,
  Viewport,
  Node,
  Edge,
  OnMoveEnd,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { styled } from '@mui/material/styles';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';

import useGraphStore from '../../store/graphStore';
import { useCommonKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import NodeWrapper from '../nodes/NodeWrapper';

const GraphContainer = styled('div')({
  width: '100%',
  height: '100vh',
});

// Define custom node types
const nodeTypes: NodeTypes = {
  default: NodeWrapper,
};

// Connection validation function
const isValidConnection = (connection: any) => {
  // We'll implement real validation in the future
  return true;
};

const GraphControls = () => {
  const { undo, redo } = useGraphStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel position="top-left">
      <ButtonGroup>
        <Tooltip title="Undo (Ctrl+Z)">
          <Button onClick={undo} size="small">
            <UndoIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <Button onClick={redo} size="small">
            <RedoIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup style={{ marginLeft: 8 }}>
        <Tooltip title="Zoom In">
          <Button onClick={() => zoomIn()} size="small">
            <ZoomInIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <Button onClick={() => zoomOut()} size="small">
            <ZoomOutIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Fit View">
          <Button onClick={() => fitView()} size="small">
            <FitScreenIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </Panel>
  );
};

const GraphEditorInner = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setViewport,
    setSelectedElements,
  } = useGraphStore();

  // Use keyboard shortcuts
  useCommonKeyboardShortcuts();

  // Update selected elements when selection changes
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      setSelectedElements({
        nodes: selectedNodes.map((node: Node) => node.id),
        edges: selectedEdges.map((edge: Edge) => edge.id),
      });
    },
    [setSelectedElements]
  );

  // Handle viewport changes
  const onMoveEnd: OnMoveEnd = useCallback(
    (_, viewport) => {
      setViewport(viewport);
    },
    [setViewport]
  );

  return (
    <GraphContainer data-testid="graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        isValidConnection={isValidConnection}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background />
        <Controls />
        <GraphControls />
      </ReactFlow>
    </GraphContainer>
  );
};

// Wrap with ReactFlowProvider to access ReactFlow context
const GraphEditor = () => {
  return (
    <ReactFlowProvider>
      <GraphEditorInner />
    </ReactFlowProvider>
  );
};

export default GraphEditor; 