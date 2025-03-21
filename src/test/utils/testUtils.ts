import { Node, Edge } from 'reactflow';
import { EdgeData } from '../../types/graph';
import { NodeData, PortDefinition } from '../../types/node';

export function createTestNode(overrides: Partial<Node<NodeData>> = {}): Node<NodeData> {
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

export function createTestPort(overrides: Partial<PortDefinition> = {}): PortDefinition {
  const defaultPort: PortDefinition = {
    id: 'test-port',
    label: 'Test Port',
    type: 'number',
    ...overrides
  };

  return defaultPort;
}

export function createTestEdge(overrides: Partial<Edge<EdgeData>> = {}): Edge<EdgeData> {
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

export function createKeyboardEvent(key: string, ctrlKey: boolean = false): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    ctrlKey
  });
}

export function createMouseEvent(type: string, x: number, y: number): MouseEvent {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitForNextTick(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
} 