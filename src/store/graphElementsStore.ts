import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, Edge, NodeChange, EdgeChange, Connection, addEdge, Node } from 'reactflow';
import { NodeData } from '../types/node';
import { EdgeData } from '../types/graph';
import { validateConnection } from '../utils/graphUtils';

interface GraphElementsState {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
}

interface GraphElementsStore extends GraphElementsState {
  // Node actions
  onNodesChange: (changes: NodeChange[]) => void;
  addNode: (node: Node<NodeData>) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  removeNode: (nodeId: string) => void;
  
  // Edge actions
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateEdge: (edge: Edge<EdgeData>) => void;
  addEdge: (edge: Edge<EdgeData>) => void;
  removeEdge: (edgeId: string) => void;

  // Clear all
  clear: () => void;

  // Get full state
  getState: () => GraphElementsState;
}

export const useGraphElementsStore = create<GraphElementsStore>((set, get) => ({
  nodes: [],
  edges: [],

  // Node actions
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },

  updateNodeConfig: (nodeId, config) => {
    set((state) => {
      const updatedNodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config
            }
          };
        }
        return node;
      });
      return { nodes: updatedNodes };
    });
  },

  removeNode: (nodeId) => {
    set((state) => {
      const newEdges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );

      return {
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: newEdges,
      };
    });
  },

  // Edge actions
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },

  updateEdge: (updatedEdge) => {
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id === updatedEdge.id) {
          return updatedEdge;
        }
        return edge;
      }),
    }));
  },

  addEdge: (edge) => {
    set((state) => {
      const sourceNode = state.nodes.find((n) => n.id === edge.source);
      const targetNode = state.nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return state;

      const isValid = validateConnection(
        sourceNode,
        targetNode,
        edge.sourceHandle || '',
        edge.targetHandle || ''
      );

      if (!isValid) return state;

      return {
        edges: [...state.edges, edge],
      };
    });
  },

  removeEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    }));
  },

  clear: () => {
    set(() => ({
      nodes: [],
      edges: [],
    }));
  },

  getState: () => {
    return get();
  },
})); 