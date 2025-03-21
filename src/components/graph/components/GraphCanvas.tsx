import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ConnectionLineType,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import { styled } from '@mui/material/styles';

import GraphControls from './GraphControls';
import GraphMiniMap from './GraphMiniMap';
import { useGraphStore } from '../../../store/graphStore';
import useGraphSelection from '../../../hooks/graph/useGraphSelection';
import useGraphDragAndDrop from '../../../hooks/graph/useGraphDragAndDrop';
import useGraphConnections from '../../../hooks/graph/useGraphConnections';
import useGraphViewport from '../../../hooks/graph/useGraphViewport';
import NodeWrapper from '../../nodes/NodeWrapper';
import CommentNode from '../../nodes/CommentNode';
import LabeledEdge from '../../edges/LabeledEdge';

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
 * Integrates all the graph functionality through custom hooks
 */
interface GraphCanvasProps {
  onContextMenu: (event: React.MouseEvent) => void;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({ onContextMenu }) => {
  const { nodes, edges, onNodesChange, onEdgesChange } = useGraphStore();
  const { onSelectionChange } = useGraphSelection();
  const { onDrop, onDragOver } = useGraphDragAndDrop();
  const { isValidConnection, handleConnect } = useGraphConnections();
  const { onMoveEnd } = useGraphViewport();

  return (
    <FlowContainer onContextMenu={onContextMenu}>
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