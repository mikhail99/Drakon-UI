import { createMockNode, createMockEdge } from '../utils/factories';
import { validateConnection, findConnectedNodes, calculateNodePosition } from '../../utils/graphUtils';

describe('Graph Utilities', () => {
  describe('validateConnection', () => {
    test('allows compatible port types', () => {
      const sourceNode = createMockNode({
        id: 'source',
        data: {
          outputs: [{ id: 'out1', type: 'number' }]
        }
      });
      
      const targetNode = createMockNode({
        id: 'target',
        data: {
          inputs: [{ id: 'in1', type: 'number' }]
        }
      });
      
      const isValid = validateConnection({
        source: sourceNode.id,
        sourceHandle: 'out1',
        target: targetNode.id,
        targetHandle: 'in1',
        nodes: [sourceNode, targetNode]
      });
      
      expect(isValid).toBe(true);
    });

    test('prevents incompatible port types', () => {
      const sourceNode = createMockNode({
        id: 'source',
        data: {
          outputs: [{ id: 'out1', type: 'string' }]
        }
      });
      
      const targetNode = createMockNode({
        id: 'target',
        data: {
          inputs: [{ id: 'in1', type: 'number' }]
        }
      });
      
      const isValid = validateConnection({
        source: sourceNode.id,
        sourceHandle: 'out1',
        target: targetNode.id,
        targetHandle: 'in1',
        nodes: [sourceNode, targetNode]
      });
      
      expect(isValid).toBe(false);
    });

    test('prevents self-connections', () => {
      const node = createMockNode({
        id: 'node1',
        data: {
          inputs: [{ id: 'in1', type: 'number' }],
          outputs: [{ id: 'out1', type: 'number' }]
        }
      });
      
      const isValid = validateConnection({
        source: node.id,
        sourceHandle: 'out1',
        target: node.id,
        targetHandle: 'in1',
        nodes: [node]
      });
      
      expect(isValid).toBe(false);
    });
  });

  describe('findConnectedNodes', () => {
    test('finds direct connections', () => {
      const node1 = createMockNode({ id: 'node1' });
      const node2 = createMockNode({ id: 'node2' });
      const edge = createMockEdge({
        source: 'node1',
        target: 'node2'
      });
      
      const connected = findConnectedNodes(node1.id, [node1, node2], [edge]);
      
      expect(connected).toContain(node2.id);
      expect(connected).toHaveLength(1);
    });

    test('finds indirect connections', () => {
      const node1 = createMockNode({ id: 'node1' });
      const node2 = createMockNode({ id: 'node2' });
      const node3 = createMockNode({ id: 'node3' });
      
      const edges = [
        createMockEdge({ source: 'node1', target: 'node2' }),
        createMockEdge({ source: 'node2', target: 'node3' })
      ];
      
      const connected = findConnectedNodes(node1.id, [node1, node2, node3], edges);
      
      expect(connected).toContain(node2.id);
      expect(connected).toContain(node3.id);
      expect(connected).toHaveLength(2);
    });
  });

  describe('calculateNodePosition', () => {
    test('calculates grid-aligned position', () => {
      const position = calculateNodePosition({ x: 123, y: 456 }, 20);
      
      expect(position.x).toBe(120);
      expect(position.y).toBe(460);
    });

    test('handles negative coordinates', () => {
      const position = calculateNodePosition({ x: -123, y: -456 }, 20);
      
      expect(position.x).toBe(-120);
      expect(position.y).toBe(-460);
    });

    test('maintains position with zero grid size', () => {
      const originalPosition = { x: 123, y: 456 };
      const position = calculateNodePosition(originalPosition, 0);
      
      expect(position).toEqual(originalPosition);
    });
  });
}); 