import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Container, Typography, Paper } from '@mui/material';
import ReactFlow, { Background, Controls, Node, Edge, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import NodeWrapper from '../nodes/NodeWrapper';
import CommentNode from '../nodes/CommentNode';
import { testNodeTypes } from '../palette/TestNodes';
import { NodeData } from '../../types/node';

const DemoContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const FlowContainer = styled(Box)({
  height: 600,
  border: '1px solid #ddd',
  borderRadius: 4,
  overflow: 'hidden',
});

const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

// Define custom node types
const nodeTypes = {
  default: NodeWrapper,
  comment: CommentNode,
};

// Create sample nodes from our test node types
const initialNodes: Node<NodeData>[] = testNodeTypes.map((nodeType, index) => {
  // Create a node from the node type
  return {
    id: `node-${index}`,
    type: 'default',
    position: { x: 250 * (index % 2), y: 200 * Math.floor(index / 2) },
    data: {
      label: nodeType.label,
      type: nodeType.id,
      inputs: nodeType.inputs,
      outputs: nodeType.outputs,
      config: { ...nodeType.defaultConfig },
    },
  };
});

// Add a comment node
initialNodes.push({
  id: 'comment-1',
  type: 'comment',
  position: { x: 50, y: 500 },
  data: {
    label: 'Comment',
    type: 'comment',
    inputs: [],
    outputs: [],
    config: { text: 'This is a demo of the new node styles with handles on the sides.' },
  },
});

// Create sample edges
const initialEdges: Edge[] = [
  {
    id: 'edge-1',
    source: 'node-0',
    sourceHandle: 'output',
    target: 'node-1',
    targetHandle: 'a',
    type: 'default',
  },
  {
    id: 'edge-2',
    source: 'node-0',
    sourceHandle: 'output',
    target: 'node-1',
    targetHandle: 'b',
    type: 'default',
  },
];

const NodeStyleDemo: React.FC = () => {
  return (
    <DemoContainer maxWidth="lg">
      <HeaderPaper elevation={2}>
        <Typography variant="h4" gutterBottom>
          Node Style Demo
        </Typography>
        <Typography variant="body1">
          This demo shows the new node styles with connection handles on the sides.
        </Typography>
      </HeaderPaper>
      
      <FlowContainer>
        <ReactFlowProvider>
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </FlowContainer>
    </DemoContainer>
  );
};

export default NodeStyleDemo; 