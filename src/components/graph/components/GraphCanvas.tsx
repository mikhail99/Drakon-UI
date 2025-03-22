import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ConnectionLineType,
  NodeTypes,
  EdgeTypes,
  ReactFlowInstance,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css'; // Make sure styles are imported
import { styled } from '@mui/material/styles';

import GraphControls from './GraphControls';
import GraphMiniMap from './GraphMiniMap';
import { useGraphStore } from '../../../store/graphStore';
import useGraphSelection from '../../../hooks/graph/useGraphSelection';
import useGraphConnections from '../../../hooks/graph/useGraphConnections';
import useGraphViewport from '../../../hooks/graph/useGraphViewport';
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

// Generate a unique node ID
const getId = (): string => `node_${Math.random().toString(36).substr(2, 9)}`;

/**
 * GraphCanvas - Main component that renders the ReactFlow canvas
 * Integrates all the graph functionality through custom hooks
 */
interface GraphCanvasProps {
  onContextMenu: (event: React.MouseEvent) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({ 
  onContextMenu,
  onNodeDoubleClick 
}) => {
  const { nodes, edges, onNodesChange, onEdgesChange, addNode } = useGraphStore();
  const { onSelectionChange } = useGraphSelection();
  const { isValidConnection, handleConnect } = useGraphConnections();
  const { onMoveEnd } = useGraphViewport();
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

  // Handle drop event directly here for better control
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      console.log('Drop event received in GraphCanvas');
      
      if (!reactFlowInstance) {
        console.warn('ReactFlow instance not initialized');
        return;
      }
      
      // Get the position where the node is dropped
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      console.log('Data transfer types:', event.dataTransfer.types);
      
      // Try different data formats
      let jsonData = event.dataTransfer.getData('application/drakon-node');
      
      if (!jsonData) {
        jsonData = event.dataTransfer.getData('application/json');
        console.log('Using fallback application/json format');
      }
      
      if (!jsonData && event.dataTransfer.getData('text/plain')) {
        console.log('Only text/plain format available, cannot create node');
        return;
      }
      
      if (jsonData) {
        try {
          console.log('Parsing JSON data:', jsonData);
          const data = JSON.parse(jsonData);
          const nodeType = data.nodeType;
          
          // Create a new node
          const newNode = {
            id: getId(),
            type: 'default',
            position,
            data: {
              label: "AAA", // Use "AAA" as placeholder until user configures the node
              type: nodeType.id,
              inputs: nodeType.inputs || [],
              outputs: nodeType.outputs || [],
              config: { 
                ...(nodeType.defaultConfig || {}),
                // Add original type information for reference in configuration dialog
                originalType: nodeType.id,
                originalLabel: nodeType.label 
              },
            },
          };
          
          console.log('Creating new node:', newNode);
          
          // Add node to the graph
          addNode(newNode);
        } catch (error) {
          console.error('Error adding node:', error);
        }
      } else {
        console.log('No valid node data found in drop event');
      }
    },
    [reactFlowInstance, addNode]
  );
  
  // Enable drop by preventing default behavior
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // Can uncomment for debugging: console.log('Drag over event in GraphCanvas');
  }, []);

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