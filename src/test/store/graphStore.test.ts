import { Node, Edge } from 'reactflow';
import useGraphStore from '../../store/graphStore';
import { EdgeData } from '../../types/graph';
import { NodeData, CustomNode, PortDefinition } from '../../types/node';

describe('Graph Store', () => {
  beforeEach(() => {
    useGraphStore.setState({
      nodes: [],
      edges: [],
      selectedElements: { nodes: [], edges: [] },
      history: { past: [], future: [] },
      viewport: { x: 0, y: 0, zoom: 1 },
      clipboard: { nodes: [], edges: [] }
    });
  });

  describe('Node Operations', () => {
    it('adds a node correctly', () => {
      const node: Node<NodeData> = {
        id: 'test-node',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {
          label: 'Test Node',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      useGraphStore.getState().addNode(node);
      expect(useGraphStore.getState().nodes).toHaveLength(1);
      expect(useGraphStore.getState().nodes[0].id).toBe('test-node');
    });

    it('updates node configuration', () => {
      const node: Node<NodeData> = {
        id: 'test-node',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {
          label: 'Test Node',
          type: 'test',
          inputs: [],
          outputs: [],
          config: { value: 1 }
        }
      };

      useGraphStore.getState().addNode(node);
      useGraphStore.getState().updateNodeConfig('test-node', { value: 2 });
      
      const updatedNode = useGraphStore.getState().nodes[0];
      expect(updatedNode.data.config.value).toBe(2);
    });

    it('removes node and connected edges', () => {
      const node1: Node<NodeData> = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Node 1',
          type: 'test',
          inputs: [],
          outputs: [{ id: 'out1', label: 'Output', type: 'number' }],
          config: {}
        }
      };

      const node2: Node<NodeData> = {
        id: 'node2',
        type: 'default',
        position: { x: 200, y: 0 },
        data: {
          label: 'Node 2',
          type: 'test',
          inputs: [{ id: 'in1', label: 'Input', type: 'number' }],
          outputs: [],
          config: {}
        }
      };

      const edge: Edge<EdgeData> = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'out1',
        targetHandle: 'in1'
      };

      const { addNode, addEdge, removeNode } = useGraphStore.getState();
      addNode(node1);
      addNode(node2);
      addEdge(edge);

      removeNode('node1');
      
      const state = useGraphStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.edges).toHaveLength(0);
    });
  });

  describe('Edge Operations', () => {
    it('adds valid edge', () => {
      const node1: Node<NodeData> = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Node 1',
          type: 'test',
          inputs: [],
          outputs: [{ id: 'out1', label: 'Output', type: 'number' }],
          config: {}
        }
      };

      const node2: Node<NodeData> = {
        id: 'node2',
        type: 'default',
        position: { x: 200, y: 0 },
        data: {
          label: 'Node 2',
          type: 'test',
          inputs: [{ id: 'in1', label: 'Input', type: 'number' }],
          outputs: [],
          config: {}
        }
      };

      const edge: Edge<EdgeData> = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'out1',
        targetHandle: 'in1'
      };

      const { addNode, addEdge } = useGraphStore.getState();
      addNode(node1);
      addNode(node2);
      addEdge(edge);

      expect(useGraphStore.getState().edges).toHaveLength(1);
    });

    it('prevents invalid edge connections', () => {
      const node1: Node<NodeData> = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Node 1',
          type: 'test',
          inputs: [],
          outputs: [{ id: 'out1', label: 'Output', type: 'number' }],
          config: {}
        }
      };

      const node2: Node<NodeData> = {
        id: 'node2',
        type: 'default',
        position: { x: 200, y: 0 },
        data: {
          label: 'Node 2',
          type: 'test',
          inputs: [{ id: 'in1', label: 'Input', type: 'string' }],
          outputs: [],
          config: {}
        }
      };

      const edge: Edge<EdgeData> = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'out1',
        targetHandle: 'in1'
      };

      const { addNode, addEdge } = useGraphStore.getState();
      addNode(node1);
      addNode(node2);
      addEdge(edge);

      expect(useGraphStore.getState().edges).toHaveLength(0);
    });
  });

  describe('Selection', () => {
    it('selects and deselects nodes', () => {
      const node: Node<NodeData> = {
        id: 'test-node',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {
          label: 'Test Node',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const { addNode, selectNodes, deselectAll } = useGraphStore.getState();
      addNode(node);
      selectNodes(['test-node']);

      expect(useGraphStore.getState().selectedElements.nodes).toContain('test-node');

      deselectAll();
      expect(useGraphStore.getState().selectedElements.nodes).toHaveLength(0);
    });
  });

  describe('History Management', () => {
    it('tracks undo/redo history', () => {
      const node: Node<NodeData> = {
        id: 'test-node',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {
          label: 'Test Node',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const { addNode, undo, redo } = useGraphStore.getState();
      addNode(node);
      expect(useGraphStore.getState().nodes).toHaveLength(1);

      undo();
      expect(useGraphStore.getState().nodes).toHaveLength(0);

      redo();
      expect(useGraphStore.getState().nodes).toHaveLength(1);
    });

    it('clears future history when new action is performed', () => {
      const node1: Node<NodeData> = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Node 1',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const node2: Node<NodeData> = {
        id: 'node2',
        type: 'default',
        position: { x: 200, y: 0 },
        data: {
          label: 'Node 2',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const { addNode, undo } = useGraphStore.getState();
      addNode(node1);
      addNode(node2);
      undo();

      expect(useGraphStore.getState().history.future).toHaveLength(1);

      addNode(node2);
      expect(useGraphStore.getState().history.future).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('handles adding many nodes efficiently', () => {
      const nodes: Node<NodeData>[] = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        type: 'default',
        position: { x: i * 100, y: 0 },
        data: {
          label: `Node ${i}`,
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      }));

      const start = performance.now();
      nodes.forEach(node => useGraphStore.getState().addNode(node));
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Less than 1ms per node
      expect(useGraphStore.getState().nodes).toHaveLength(100);
    });
  });

  describe('Clipboard Operations', () => {
    it('copies and pastes nodes and their connections', () => {
      // Setup: Create two connected nodes
      const outputPort: PortDefinition = { id: 'out1', label: 'Output', type: 'number' };
      const inputPort: PortDefinition = { id: 'in1', label: 'Input', type: 'number' };
      
      const node1: CustomNode = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Node 1',
          type: 'test',
          inputs: [],
          outputs: [outputPort],
          config: {}
        }
      };

      const node2: CustomNode = {
        id: 'node2',
        type: 'default',
        position: { x: 200, y: 0 },
        data: {
          label: 'Node 2',
          type: 'test',
          inputs: [inputPort],
          outputs: [],
          config: {}
        }
      };

      const edge: Edge<EdgeData> = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'out1',
        targetHandle: 'in1'
      };

      const { addNode, addEdge, selectNodes, copySelectedElements, pasteElements } = useGraphStore.getState();
      addNode(node1);
      addNode(node2);
      addEdge(edge);
      
      // Select and copy nodes
      selectNodes(['node1', 'node2']);
      copySelectedElements();
      
      // Clear the graph
      useGraphStore.setState({
        nodes: [],
        edges: [],
        selectedElements: { nodes: [], edges: [] }
      });
      
      // Paste and verify
      pasteElements();
      
      const state = useGraphStore.getState();
      expect(state.nodes).toHaveLength(2);
      expect(state.edges).toHaveLength(1);
      
      // Pasted nodes should have new IDs but same data
      expect(state.nodes[0].id).not.toBe('node1');
      expect(state.nodes[1].id).not.toBe('node2');
      expect(state.nodes[0].data.label).toBe('Node 1');
      expect(state.nodes[1].data.label).toBe('Node 2');
    });

    it('maintains node positions when pasting', () => {
      const node: CustomNode = {
        id: 'node1',
        type: 'default',
        position: { x: 100, y: 200 },
        data: {
          label: 'Test Node',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const { addNode, selectNodes, copySelectedElements, pasteElements } = useGraphStore.getState();
      addNode(node);
      selectNodes(['node1']);
      copySelectedElements();
      
      // Paste and verify position (with slight offset)
      pasteElements();
      
      const pastedNode = useGraphStore.getState().nodes[1];
      expect(pastedNode.position.x).toBeGreaterThan(node.position.x);
      expect(pastedNode.position.y).toBeGreaterThan(node.position.y);
    });

    it('clears clipboard when explicitly requested', () => {
      const node: CustomNode = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Node',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const { addNode, selectNodes, copySelectedElements, clear } = useGraphStore.getState();
      addNode(node);
      selectNodes(['node1']);
      copySelectedElements();
      
      // Verify clipboard has content
      expect(useGraphStore.getState().clipboard.nodes).toHaveLength(1);
      
      // Clear clipboard
      clear();
      
      // Verify clipboard is empty
      expect(useGraphStore.getState().clipboard.nodes).toHaveLength(0);
    });
  });

  describe('History Management - Advanced', () => {
    it('can undo and redo multiple operations in sequence', () => {
      const { addNode, undo, redo } = useGraphStore.getState();
      
      // Add three nodes
      const node1: CustomNode = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Node 1',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const node2: CustomNode = {
        id: 'node2',
        type: 'default',
        position: { x: 100, y: 0 },
        data: {
          label: 'Node 2',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const node3: CustomNode = {
        id: 'node3',
        type: 'default',
        position: { x: 200, y: 0 },
        data: {
          label: 'Node 3',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };
      
      // Perform actions
      addNode(node1);
      addNode(node2);
      addNode(node3);
      
      // Verify initial state
      expect(useGraphStore.getState().nodes).toHaveLength(3);
      
      // Undo twice
      undo();
      undo();
      
      // Verify state after undoing two operations
      expect(useGraphStore.getState().nodes).toHaveLength(1);
      expect(useGraphStore.getState().nodes[0].id).toBe('node1');
      
      // Redo once
      redo();
      
      // Verify state after redoing one operation
      expect(useGraphStore.getState().nodes).toHaveLength(2);
      expect(useGraphStore.getState().nodes[1].id).toBe('node2');
    });

    it('respects the history limit', () => {
      const { addNode } = useGraphStore.getState();
      
      // Add many nodes to exceed history limit
      for (let i = 0; i < 60; i++) {
        addNode({
          id: `node-${i}`,
          type: 'default',
          position: { x: i * 10, y: 0 },
          data: {
            label: `Node ${i}`,
            type: 'test',
            inputs: [],
            outputs: [],
            config: {}
          }
        });
      }
      
      // The history should be capped (MAX_HISTORY_LENGTH is 50)
      expect(useGraphStore.getState().history.past.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Selection Management - Complete', () => {
    it('selects and deselects both nodes and edges', () => {
      const outputPort: PortDefinition = { id: 'out1', label: 'Output', type: 'number' };
      const inputPort: PortDefinition = { id: 'in1', label: 'Input', type: 'number' };
      
      const node1: CustomNode = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Node 1',
          type: 'test',
          inputs: [],
          outputs: [outputPort],
          config: {}
        }
      };

      const node2: CustomNode = {
        id: 'node2',
        type: 'default',
        position: { x: 200, y: 0 },
        data: {
          label: 'Node 2',
          type: 'test',
          inputs: [inputPort],
          outputs: [],
          config: {}
        }
      };

      const edge: Edge<EdgeData> = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'out1',
        targetHandle: 'in1'
      };

      const { addNode, addEdge, selectNodes, selectEdges, setSelectedElements, deselectAll } = useGraphStore.getState();
      addNode(node1);
      addNode(node2);
      addEdge(edge);
      
      // Test individual selection methods
      selectNodes(['node1']);
      expect(useGraphStore.getState().selectedElements.nodes).toEqual(['node1']);
      expect(useGraphStore.getState().selectedElements.edges).toEqual([]);
      
      selectEdges(['edge1']);
      expect(useGraphStore.getState().selectedElements.nodes).toEqual(['node1']);
      expect(useGraphStore.getState().selectedElements.edges).toEqual(['edge1']);
      
      // Test bulk selection method
      setSelectedElements({ nodes: ['node1', 'node2'], edges: [] });
      expect(useGraphStore.getState().selectedElements.nodes).toEqual(['node1', 'node2']);
      expect(useGraphStore.getState().selectedElements.edges).toEqual([]);
      
      // Test deselection
      deselectAll();
      expect(useGraphStore.getState().selectedElements.nodes).toEqual([]);
      expect(useGraphStore.getState().selectedElements.edges).toEqual([]);
    });

    it('maintains selection state when modifying unselected elements', () => {
      const node1: CustomNode = {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Node 1',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const node2: CustomNode = {
        id: 'node2',
        type: 'default',
        position: { x: 100, y: 0 },
        data: {
          label: 'Node 2',
          type: 'test',
          inputs: [],
          outputs: [],
          config: {}
        }
      };

      const { addNode, selectNodes, updateNodeConfig } = useGraphStore.getState();
      addNode(node1);
      addNode(node2);
      
      // Select node1
      selectNodes(['node1']);
      
      // Update node2 (unselected)
      updateNodeConfig('node2', { value: 42 });
      
      // Selection should remain the same
      expect(useGraphStore.getState().selectedElements.nodes).toEqual(['node1']);
    });
  });

  describe('Viewport Management', () => {
    it('updates viewport correctly', () => {
      const newViewport = { x: 100, y: 200, zoom: 1.5 };
      const { setViewport } = useGraphStore.getState();
      
      setViewport(newViewport);
      
      const state = useGraphStore.getState();
      expect(state.viewport).toEqual(newViewport);
    });
  });
}); 