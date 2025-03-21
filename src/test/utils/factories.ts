import { Node, Edge, XYPosition } from 'reactflow';

// Define mock types that would normally come from the app's type definitions
// These would be imported from the actual types in the real implementation
interface NodeData {
  label: string;
  nodeType: string;
  inputs: Array<PortData>;
  outputs: Array<PortData>;
  config: Record<string, any>;
}

interface EdgeData {
  label?: string;
}

interface PortData {
  id: string;
  label: string;
  type: PortType;
}

type PortType = 'number' | 'string' | 'boolean' | 'any';

// Generate a random ID if needed
function generateId(prefix = ''): string {
  return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
}

// Generate test node
export const createMockNode = (overrides = {}): Node<NodeData> => ({
  id: generateId('node-'),
  type: 'default',
  position: { x: 100, y: 100 },
  data: {
    label: 'Test Node',
    nodeType: 'default',
    inputs: [],
    outputs: [],
    config: {},
  },
  ...overrides,
});

// Generate test edge
export const createMockEdge = (overrides = {}): Edge<EdgeData> => ({
  id: generateId('edge-'),
  source: 'source-node',
  target: 'target-node',
  sourceHandle: 'output-1',
  targetHandle: 'input-1',
  data: {
    label: 'Test Connection',
  },
  ...overrides,
});

// Generate test port
export const createMockPort = (overrides = {}): PortData => ({
  id: generateId('port-'),
  label: 'Test Port',
  type: 'any',
  ...overrides,
});

// Generate multiple test nodes in a grid layout
export const generateNodes = (count: number): Node<NodeData>[] => 
  Array.from({ length: count }, (_, i) => 
    createMockNode({
      id: `node-${i}`,
      position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 200 },
      data: { 
        label: `Node ${i}`,
        nodeType: i % 2 === 0 ? 'math' : 'input',
        inputs: i % 2 === 0 ? [createMockPort({ id: `in-${i}`, label: `Input ${i}` })] : [],
        outputs: [createMockPort({ id: `out-${i}`, label: `Output ${i}` })],
      }
    })
  );
  
// Generate connected edges between nodes
export const generateEdges = (nodeCount: number): Edge<EdgeData>[] => 
  Array.from({ length: nodeCount - 1 }, (_, i) => 
    createMockEdge({
      id: `edge-${i}`,
      source: `node-${i}`,
      target: `node-${i + 1}`,
      sourceHandle: `out-${i}`,
      targetHandle: `in-${i+1}`,
    })
  );

// Generate a complete graph with nodes and connecting edges
export const generateGraph = (nodeCount: number) => ({
  nodes: generateNodes(nodeCount),
  edges: generateEdges(nodeCount),
}); 