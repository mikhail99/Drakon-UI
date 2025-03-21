import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, Viewport, Node, Edge, NodeChange, EdgeChange, Connection, addEdge } from 'reactflow';
import { CustomNode, NodeData } from '../types/node';
import { GraphState } from '../types/graph';

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
}));

export default useGraphStore; 