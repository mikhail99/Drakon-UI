import { Node, Edge } from 'reactflow';
import { NodeData, PortDefinition } from '../../types/node';
import { EdgeData } from '../../types/graph';

export function createMockNode(overrides: Partial<Node<NodeData>> = {}): Node<NodeData> {
  const defaultNode: Node<NodeData> = {
    id: 'test-node',
    type: 'default',
    position: { x: 0, y: 0 },
    data: {
      label: 'Test Node',
      type: 'test',
      inputs: [],
      outputs: [],
      config: {}
    },
    ...overrides
  };

  return defaultNode;
}

export function createMockEdge(overrides: Partial<Edge<EdgeData>> = {}): Edge<EdgeData> {
  const defaultEdge: Edge<EdgeData> = {
    id: 'test-edge',
    source: 'source-node',
    target: 'target-node',
    sourceHandle: 'source-port',
    targetHandle: 'target-port',
    data: {},
    ...overrides
  };

  return defaultEdge;
}

export function createMockPort(overrides: Partial<PortDefinition> = {}): PortDefinition {
  const defaultPort: PortDefinition = {
    id: 'test-port',
    label: 'Test Port',
    type: 'number',
    ...overrides
  };

  return defaultPort;
}

// Generate multiple test nodes in a grid layout
export function generateNodes(count: number): Node<NodeData>[] {
  return Array.from({ length: count }, (_, i) => createMockNode({
    id: `node-${i}`,
    data: {
      label: `Node ${i}`,
      type: i % 2 === 0 ? 'math' : 'input',
      inputs: [],
      outputs: [],
      config: {}
    }
  }));
}

// Generate connected edges between nodes
export function generateEdges(nodeCount: number): Edge<EdgeData>[] {
  return Array.from({ length: nodeCount - 1 }, (_, i) => 
    createMockEdge({
      id: `edge-${i}`,
      source: `node-${i}`,
      target: `node-${i + 1}`,
      sourceHandle: `out-${i}`,
      targetHandle: `in-${i+1}`,
    })
  );
}

// Generate a complete graph with nodes and connecting edges
export function generateGraph(nodeCount: number, edgeCount: number): { nodes: Node<NodeData>[]; edges: Edge<EdgeData>[] } {
  const nodes = generateNodes(nodeCount);
  const edges = Array.from({ length: edgeCount }, (_, i) => createMockEdge({
    id: `edge-${i}`,
    source: `node-${i % nodeCount}`,
    target: `node-${(i + 1) % nodeCount}`
  }));

  return { nodes, edges };
} 