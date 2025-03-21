import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, Viewport, Node, Edge, NodeChange, EdgeChange, Connection, addEdge } from 'reactflow';
import { CustomNode, NodeData } from '../types/node';
import { GraphState, GraphSnapshot, EdgeData } from '../types/graph';
import { validateConnection } from '../utils/graphUtils';

// Clipboard for copy/paste operations
let clipboard: { nodes: CustomNode[]; edges: Edge[] } | null = null;

const MAX_HISTORY_LENGTH = 50;

interface GraphStore extends GraphState {
  // Node actions
  onNodesChange: (changes: NodeChange[]) => void;
  addNode: (node: CustomNode) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  removeNode: (nodeId: string) => void;
  
  // Edge actions
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateEdge: (edge: Edge) => void;
  addEdge: (edge: Edge<EdgeData>) => void;
  removeEdge: (edgeId: string) => void;
  
  // Selection actions
  setSelectedElements: (elements: { nodes: string[]; edges: string[] }) => void;
  selectNodes: (nodeIds: string[]) => void;
  selectEdges: (edgeIds: string[]) => void;
  deselectAll: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  
  // Viewport actions
  setViewport: (viewport: Viewport) => void;
  
  // Clipboard actions
  copySelectedElements: () => void;
  pasteElements: () => void;
  copy: () => void;
  paste: () => void;
  clear: () => void;
}

const initialViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

const createSnapshot = (state: GraphState): GraphSnapshot => ({
  nodes: state.nodes,
  edges: state.edges,
  selectedElements: state.selectedElements
});

const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: initialViewport,
  selectedElements: { nodes: [], edges: [] },
  history: {
    past: [],
    future: [],
  },
  clipboard: { nodes: [], edges: [] },

  // Node actions
  onNodesChange: (changes) => {
    // Save current state to history before making changes
    const { nodes, edges } = get();
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      history: {
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
        future: [],
      },
    }));
  },

  addNode: (node) => {
    set((state) => {
      const newState = {
        ...state,
        nodes: [...state.nodes, node],
        history: {
          past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
          future: []
        }
      };
      return newState;
    });
  },

  updateNodeConfig: (nodeId, config) => {
    set((state) => {
      const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) return state;

      const updatedNodes = [...state.nodes];
      updatedNodes[nodeIndex] = {
        ...updatedNodes[nodeIndex],
        data: {
          ...updatedNodes[nodeIndex].data,
          config: {
            ...updatedNodes[nodeIndex].data.config,
            ...config
          }
        }
      };

      return {
        ...state,
        nodes: updatedNodes,
        history: {
          past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
          future: []
        }
      };
    });
  },

  removeNode: (nodeId) => {
    set((state) => {
      const newEdges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );

      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: newEdges,
        selectedElements: {
          nodes: state.selectedElements.nodes.filter((id) => id !== nodeId),
          edges: state.selectedElements.edges.filter((id) => {
            const edge = state.edges.find((e) => e.id === id);
            return edge && edge.source !== nodeId && edge.target !== nodeId;
          })
        },
        history: {
          past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
          future: []
        }
      };
    });
  },

  // Edge actions
  onEdgesChange: (changes) => {
    const { nodes, edges } = get();
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      history: {
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
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
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
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
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
        future: [],
      },
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
        ...state,
        edges: [...state.edges, edge],
        history: {
          past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
          future: []
        }
      };
    });
  },

  removeEdge: (edgeId) => {
    set((state) => ({
      ...state,
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedElements: {
        ...state.selectedElements,
        edges: state.selectedElements.edges.filter((id) => id !== edgeId)
      },
      history: {
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
        future: []
      }
    }));
  },

  // Selection actions
  setSelectedElements: (elements) => {
    set(() => ({
      selectedElements: elements,
    }));
  },

  selectNodes: (nodeIds) => {
    set((state) => ({
      ...state,
      selectedElements: {
        ...state.selectedElements,
        nodes: nodeIds
      }
    }));
  },

  selectEdges: (edgeIds) => {
    set((state) => ({
      ...state,
      selectedElements: {
        ...state.selectedElements,
        edges: edgeIds
      }
    }));
  },

  deselectAll: () => {
    set((state) => ({
      ...state,
      selectedElements: {
        nodes: [],
        edges: []
      }
    }));
  },

  // History actions
  undo: () => {
    set((state) => {
      if (state.history.past.length === 0) return state;

      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);

      return {
        ...state,
        nodes: previous.nodes,
        edges: previous.edges,
        selectedElements: previous.selectedElements,
        history: {
          past: newPast,
          future: [createSnapshot(state), ...state.history.future]
        }
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.history.future.length === 0) return state;

      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);

      return {
        ...state,
        nodes: next.nodes,
        edges: next.edges,
        selectedElements: next.selectedElements,
        history: {
          past: [...state.history.past, createSnapshot(state)],
          future: newFuture
        }
      };
    });
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
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
        future: []
      },
    }));
  },

  copy: () => {
    set((state) => {
      const selectedNodes = state.nodes.filter((node) =>
        state.selectedElements.nodes.includes(node.id)
      );

      const selectedEdges = state.edges.filter(
        (edge) =>
          state.selectedElements.edges.includes(edge.id) &&
          state.selectedElements.nodes.includes(edge.source) &&
          state.selectedElements.nodes.includes(edge.target)
      );

      return {
        ...state,
        clipboard: {
          nodes: selectedNodes.map((node) => ({
            ...node,
            id: `${node.id}-copy`
          })),
          edges: selectedEdges.map((edge) => ({
            ...edge,
            id: `${edge.id}-copy`,
            source: `${edge.source}-copy`,
            target: `${edge.target}-copy`
          }))
        }
      };
    });
  },

  paste: () => {
    set((state) => {
      if (state.clipboard.nodes.length === 0) return state;

      const offsetX = 50;
      const offsetY = 50;

      const newNodes = state.clipboard.nodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY
        }
      }));

      const newEdges = state.clipboard.edges.map((edge) => ({
        ...edge,
        id: `${edge.id}-${Date.now()}`
      }));

      return {
        ...state,
        nodes: [...state.nodes, ...newNodes],
        edges: [...state.edges, ...newEdges],
        history: {
          past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
          future: []
        }
      };
    });
  },

  clear: () => {
    set((state) => ({
      ...state,
      nodes: [],
      edges: [],
      selectedElements: { nodes: [], edges: [] },
      history: { past: [], future: [] },
      viewport: { x: 0, y: 0, zoom: 1 },
      clipboard: { nodes: [], edges: [] }
    }));
  }
}));

export default useGraphStore; 