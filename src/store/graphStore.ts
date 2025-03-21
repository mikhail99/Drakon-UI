import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, Viewport, Node, Edge, NodeChange, EdgeChange, Connection, addEdge } from 'reactflow';
import { CustomNode, NodeData } from '../types/node';
import { GraphState } from '../types/graph';

// Clipboard for copy/paste operations
let clipboard: { nodes: CustomNode[]; edges: Edge[] } | null = null;

interface GraphStore extends GraphState {
  // Node actions
  onNodesChange: (changes: NodeChange[]) => void;
  addNode: (node: CustomNode) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  
  // Edge actions
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateEdge: (edge: Edge) => void;
  
  // Selection actions
  setSelectedElements: (elements: { nodes: string[]; edges: string[] }) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  
  // Viewport actions
  setViewport: (viewport: Viewport) => void;
  
  // Clipboard actions
  copySelectedElements: () => void;
  pasteElements: () => void;
}

const initialViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: initialViewport,
  selectedElements: { nodes: [], edges: [] },
  history: {
    past: [],
    future: [],
  },

  // Node actions
  onNodesChange: (changes) => {
    // Save current state to history before making changes
    const { nodes, edges } = get();
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      history: {
        past: [...state.history.past, { nodes, edges }],
        future: [],
      },
    }));
  },

  addNode: (node) => {
    const { nodes, edges } = get();
    set((state) => ({
      nodes: [...state.nodes, node],
      history: {
        past: [...state.history.past, { nodes, edges }],
        future: [],
      },
    }));
  },

  updateNodeConfig: (nodeId, config) => {
    const { nodes, edges } = get();
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: { ...node.data.config, ...config },
            },
          };
        }
        return node;
      }),
      history: {
        past: [...state.history.past, { nodes, edges }],
        future: [],
      },
    }));
  },

  // Edge actions
  onEdgesChange: (changes) => {
    const { nodes, edges } = get();
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      history: {
        past: [...state.history.past, { nodes, edges }],
        future: [],
      },
    }));
  },

  onConnect: (connection) => {
    const { nodes, edges } = get();
    // Could add validation here
    set((state) => ({
      edges: addEdge(connection, state.edges),
      history: {
        past: [...state.history.past, { nodes, edges }],
        future: [],
      },
    }));
  },

  updateEdge: (updatedEdge) => {
    const { nodes, edges } = get();
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id === updatedEdge.id) {
          return updatedEdge;
        }
        return edge;
      }),
      history: {
        past: [...state.history.past, { nodes, edges }],
        future: [],
      },
    }));
  },

  // Selection actions
  setSelectedElements: (elements) => {
    set(() => ({
      selectedElements: elements,
    }));
  },

  // History actions
  undo: () => {
    const { history } = get();
    if (history.past.length === 0) return;

    const newPast = [...history.past];
    const lastState = newPast.pop();

    if (!lastState) return;

    set((state) => ({
      nodes: lastState.nodes,
      edges: lastState.edges,
      history: {
        past: newPast,
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.history.future],
      },
    }));
  },

  redo: () => {
    const { history } = get();
    if (history.future.length === 0) return;

    const newFuture = [...history.future];
    const nextState = newFuture.shift();

    if (!nextState) return;

    set((state) => ({
      nodes: nextState.nodes,
      edges: nextState.edges,
      history: {
        past: [...state.history.past, { nodes: state.nodes, edges: state.edges }],
        future: newFuture,
      },
    }));
  },

  // Viewport actions
  setViewport: (viewport) => {
    set(() => ({
      viewport,
    }));
  },

  // Clipboard actions
  copySelectedElements: () => {
    const { nodes, edges, selectedElements } = get();
    
    // Get the selected nodes
    const selectedNodes = nodes.filter(node => 
      selectedElements.nodes.includes(node.id)
    );
    
    // Get the edges that connect only the selected nodes
    const selectedEdges = edges.filter(edge => 
      selectedElements.edges.includes(edge.id) || 
      (selectedElements.nodes.includes(edge.source) && 
       selectedElements.nodes.includes(edge.target))
    );
    
    // Save to clipboard
    clipboard = {
      nodes: selectedNodes,
      edges: selectedEdges,
    };
  },
  
  pasteElements: () => {
    if (!clipboard) return;
    
    const { nodes, edges } = get();
    const idMap = new Map<string, string>();
    
    // Create new IDs for nodes
    const newNodes = clipboard.nodes.map(node => {
      const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
      idMap.set(node.id, newId);
      
      // Add offset to position for better UX
      const position = {
        x: node.position.x + 50,
        y: node.position.y + 50,
      };
      
      return {
        ...node,
        id: newId,
        position,
        selected: false,
      };
    });
    
    // Create new edges with updated source/target
    const newEdges = clipboard.edges
      .filter(edge => idMap.has(edge.source) && idMap.has(edge.target))
      .map(edge => ({
        ...edge,
        id: `edge_${Math.random().toString(36).substr(2, 9)}`,
        source: idMap.get(edge.source) as string,
        target: idMap.get(edge.target) as string,
        selected: false,
      }));
    
    // Add to graph
    set((state) => ({
      nodes: [...state.nodes, ...newNodes],
      edges: [...state.edges, ...newEdges],
      history: {
        past: [...state.history.past, { nodes, edges }],
        future: [],
      },
    }));
  },
}));

export default useGraphStore; 