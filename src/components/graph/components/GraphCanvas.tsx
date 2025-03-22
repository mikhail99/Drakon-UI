import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  ConnectionLineType,
  NodeTypes,
  EdgeTypes,
  ReactFlowInstance,
  Node,
  OnConnectStartParams,
  OnConnectStart,
  OnConnectEnd,
  Connection,
  FitViewOptions,
} from 'reactflow';
import 'reactflow/dist/style.css'; // Make sure styles are imported
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import GraphControls from './GraphControls';
import GraphMiniMap from './GraphMiniMap';
import { useGraphStore } from '../../../store/graphStore';
import { useNodeOrganizationStore } from '../../../store/nodeOrganizationStore';
import useGraphSelection from '../../../hooks/graph/useGraphSelection';
import useGraphConnections from '../../../hooks/graph/useGraphConnections';
import useGraphViewport from '../../../hooks/graph/useGraphViewport';
import useGraphDragAndDrop from '../../../hooks/graph/useGraphDragAndDrop';
import NodeWrapper from '../../nodes/NodeWrapper';
import CommentNode from '../../nodes/CommentNode';
import LabeledEdge from '../../edges/LabeledEdge';
import { NodeType, NodeData } from '../../../types/node';

const FlowContainer = styled('div')({
  flex: 1,
  height: '100%',
  position: 'relative',
});

// Define custom node types
const nodeTypes: NodeTypes = {
  default: NodeWrapper,
  comment: CommentNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  default: LabeledEdge,
};

/**
 * GraphCanvas - Main component that renders the ReactFlow canvas
 * Handles the visualization of nodes and edges, as well as user interactions
 */
interface GraphCanvasProps {
  onContextMenu: (event: React.MouseEvent) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onNodeSelect?: (nodeId: string | null) => void;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({ 
  onContextMenu,
  onNodeDoubleClick,
  onNodeSelect
}) => {
  const { nodes, edges, onNodesChange, onEdgesChange } = useGraphStore();
  const { onSelectionChange } = useGraphSelection();
  const { isValidConnection, handleConnect } = useGraphConnections();
  const { onMoveEnd } = useGraphViewport();
  const { onDrop, onDragOver } = useGraphDragAndDrop();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Handle node double-click
  const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    // Stop propagation to prevent other click handlers
    event.stopPropagation();
    
    // Call the provided callback with the node id
    if (onNodeDoubleClick) {
      onNodeDoubleClick(node.id);
    }
  }, [onNodeDoubleClick]);

  return (
    <FlowContainer ref={reactFlowWrapper} onContextMenu={onContextMenu}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onSelectionChange={onSelectionChange}
        onMoveEnd={onMoveEnd}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'default',
        }}
        connectionLineStyle={{ stroke: '#555' }}
        connectionLineType={ConnectionLineType.Bezier}
        isValidConnection={isValidConnection}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        selectionKeyCode={['Shift']}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background />
        <Controls />
        <GraphControls />
        <GraphMiniMap />
      </ReactFlow>
    </FlowContainer>
  );
};

export default GraphCanvas; 