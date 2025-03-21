import { Node, Edge } from 'reactflow';
import { useGraphElementsStore } from '../../store/graphElementsStore';
import { useUIStateStore } from '../../store/uiStateStore';
import { useHistoryStore } from '../../store/historyStore';
import { useClipboardStore } from '../../store/clipboardStore';
import { EdgeData } from '../../types/graph';
import { NodeData } from '../../types/node';

describe('Graph Store', () => {
  beforeEach(() => {
    // Reset all stores to their initial states
    useGraphElementsStore.setState({
      nodes: [],
      edges: []
    });
    
    useUIStateStore.setState({
      selectedElements: { nodes: [], edges: [] },
      viewport: { x: 0, y: 0, zoom: 1 }
    });
    
    useHistoryStore.setState({
      past: [],
      future: []
    });
    
    useClipboardStore.setState({
      clipboard: null
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

      useGraphElementsStore.getState().addNode(node);
      expect(useGraphElementsStore.getState().nodes).toHaveLength(1);
      expect(useGraphElementsStore.getState().nodes[0].id).toBe('test-node');
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

      useGraphElementsStore.getState().addNode(node);
      useGraphElementsStore.getState().updateNodeConfig('test-node', { value: 2 });
      
      const updatedNode = useGraphElementsStore.getState().nodes[0];
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

      const { addNode, addEdge, removeNode } = useGraphElementsStore.getState();
      addNode(node1);
      addNode(node2);
      addEdge(edge);

      removeNode('node1');
      
      const state = useGraphElementsStore.getState();
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

      const { addNode, addEdge } = useGraphElementsStore.getState();
      addNode(node1);
      addNode(node2);
      addEdge(edge);

      expect(useGraphElementsStore.getState().edges).toHaveLength(1);
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

      const { addNode, addEdge } = useGraphElementsStore.getState();
      addNode(node1);
      addNode(node2);
      addEdge(edge);

      expect(useGraphElementsStore.getState().edges).toHaveLength(0);
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

      useGraphElementsStore.getState().addNode(node);
      useUIStateStore.getState().selectNodes(['test-node']);

      expect(useUIStateStore.getState().selectedElements.nodes).toContain('test-node');

      useUIStateStore.getState().deselectAll();
      expect(useUIStateStore.getState().selectedElements.nodes).toHaveLength(0);
    });
  });

  describe('History Management', () => {
    it('tracks undo/redo history', () => {
      // Set up initial state
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

      // Create a snapshot of empty state
      const emptySnapshot = {
        nodes: useGraphElementsStore.getState().nodes,
        edges: useGraphElementsStore.getState().edges,
        selectedElements: useUIStateStore.getState().selectedElements
      };

      // Add node
      useGraphElementsStore.getState().addNode(node);
      
      // Manually add the snapshot to history
      useHistoryStore.getState().addToHistory(emptySnapshot);
      
      // Verify node is added
      expect(useGraphElementsStore.getState().nodes).toHaveLength(1);

      // Undo
      useHistoryStore.getState().undo();
      
      // Verify empty state is restored
      expect(useGraphElementsStore.getState().nodes).toHaveLength(0);

      // Redo
      useHistoryStore.getState().redo();
      
      // Verify node is restored
      expect(useGraphElementsStore.getState().nodes).toHaveLength(1);
    });
  });

  describe('Clipboard Operations', () => {
    it('copies and pastes nodes', () => {
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

      // Add node and select it
      useGraphElementsStore.getState().addNode(node);
      useUIStateStore.getState().selectNodes(['test-node']);
      
      // Copy selected nodes
      useClipboardStore.getState().copySelectedElements();
      
      // Verify clipboard has the node
      expect(useClipboardStore.getState().clipboard?.nodes).toHaveLength(1);
      
      // Paste nodes
      useClipboardStore.getState().pasteElements();
      
      // Verify a new node was added
      expect(useGraphElementsStore.getState().nodes).toHaveLength(2);
    });
  });
}); 