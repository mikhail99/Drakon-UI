import { createMockNode } from '../utils/factories';
import { validateConnection, findConnectedNodes, calculateNodePosition } from '../../utils/graphUtils';

describe('Graph Utilities', () => {
  describe('validateConnection', () => {
    test('allows compatible port types', () => {
      const sourceNode = createMockNode({
        id: 'source',
        data: {
          label: 'Source Node',
          type: 'test',
          inputs: [],
          outputs: [{ id: 'out1', type: 'number', label: 'Output 1' }],
          config: {}
        }
      });
      
      const targetNode = createMockNode({
        id: 'target',
        data: {
          label: 'Target Node',
          type: 'test',
          inputs: [{ id: 'in1', type: 'number', label: 'Input 1' }],
          outputs: [],
          config: {}
        }
      });
      
      const isValid = validateConnection(
        sourceNode,
        targetNode,
        'out1',
        'in1'
      );
      
      expect(isValid).toBe(true);
    });

    test('prevents incompatible port types', () => {
      const sourceNode = createMockNode({
        id: 'source',
        data: {
          label: 'Source Node',
          type: 'test',
          inputs: [],
          outputs: [{ id: 'out1', type: 'string', label: 'Output 1' }],
          config: {}
        }
      });
      
      const targetNode = createMockNode({
        id: 'target',
        data: {
          label: 'Target Node',
          type: 'test',
          inputs: [{ id: 'in1', type: 'number', label: 'Input 1' }],
          outputs: [],
          config: {}
        }
      });
      
      const isValid = validateConnection(
        sourceNode,
        targetNode,
        'out1',
        'in1'
      );
      
      expect(isValid).toBe(false);
    });

    test('prevents self-connections', () => {
      const node = createMockNode({
        id: 'node1',
        data: {
          label: 'Test Node',
          type: 'test',
          inputs: [{ id: 'in1', type: 'number', label: 'Input 1' }],
          outputs: [{ id: 'out1', type: 'number', label: 'Output 1' }],
          config: {}
        }
      });
      
      const isValid = validateConnection(
        node,
        node,
        'out1',
        'in1'
      );
      
      expect(isValid).toBe(false);
    });
  });

  describe('findConnectedNodes', () => {
    it('finds directly connected nodes', () => {
      const node1 = createMockNode({ id: 'node1' });
      const node2 = createMockNode({ id: 'node2' });
      const edge = {
        id: 'edge1',
        source: node1.id,
        target: node2.id,
        type: 'default'
      };

      const connected = findConnectedNodes(node1.id, [edge]);
      expect(connected).toContain(node2.id);
    });

    it('finds indirectly connected nodes', () => {
      const node1 = createMockNode({ id: 'node1' });
      const node2 = createMockNode({ id: 'node2' });
      const node3 = createMockNode({ id: 'node3' });
      const edges = [
        {
          id: 'edge1',
          source: node1.id,
          target: node2.id,
          type: 'default'
        },
        {
          id: 'edge2',
          source: node2.id,
          target: node3.id,
          type: 'default'
        }
      ];

      const connected = findConnectedNodes(node1.id, edges);
      expect(connected).toContain(node2.id);
      expect(connected).toContain(node3.id);
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