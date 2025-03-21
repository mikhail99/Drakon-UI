import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, Viewport, Edge, NodeChange, EdgeChange, Connection, addEdge } from 'reactflow';
import { CustomNode } from '../types/node';
import { GraphState, GraphSnapshot, EdgeData } from '../types/graph';
import { validateConnection } from '../utils/graphUtils';

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
  
  // Clipboard state
  clipboard: { nodes: CustomNode[]; edges: Edge[] } | null;
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

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: initialViewport,
  selectedElements: { nodes: [], edges: [] },
  history: {
    past: [],
    future: [],
  },
  clipboard: null,

  // Node actions
  onNodesChange: (changes) => {
    // Save current state to history before making changes
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
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      history: {
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
        future: [],
      },
    }));
  },

  onConnect: (connection) => {
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
    set((state) => {
      const { nodes, edges, selectedElements } = state;
      
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
      
      return {
        ...state,
        clipboard: {
          nodes: selectedNodes,
          edges: selectedEdges,
        }
      };
    });
  },
  
  pasteElements: () => {
    const state = get();
    if (!state.clipboard) return;
    
    const idMap = new Map<string, string>();
    
    // Create new IDs for nodes
    const newNodes = state.clipboard.nodes.map((node: CustomNode) => {
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
        selected: true,
      };
    });
    
    // Create new edges with updated node IDs
    const newEdges = state.clipboard.edges.map((edge: Edge<EdgeData>) => {
      const newId = `edge_${Math.random().toString(36).substr(2, 9)}`;
      const newSource = idMap.get(edge.source) || edge.source;
      const newTarget = idMap.get(edge.target) || edge.target;
      
      return {
        ...edge,
        id: newId,
        source: newSource,
        target: newTarget,
      };
    });
    
    set((state) => ({
      ...state,
      nodes: [...state.nodes, ...newNodes],
      edges: [...state.edges, ...newEdges],
      history: {
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
        future: []
      }
    }));
  },

  copy: () => {
    const state = get();
    if (!state.clipboard) return;
    if (state.clipboard.nodes.length === 0) return state;
    
    const idMap = new Map<string, string>();
    
    // Create new IDs for nodes
    const newNodes = state.clipboard.nodes.map((node: CustomNode) => {
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
        selected: true,
      };
    });
    
    // Create new edges with updated node IDs
    const newEdges = state.clipboard.edges.map((edge: Edge<EdgeData>) => {
      const newId = `edge_${Math.random().toString(36).substr(2, 9)}`;
      const newSource = idMap.get(edge.source) || edge.source;
      const newTarget = idMap.get(edge.target) || edge.target;
      
      return {
        ...edge,
        id: newId,
        source: newSource,
        target: newTarget,
      };
    });
    
    set((state) => ({
      ...state,
      nodes: [...state.nodes, ...newNodes],
      edges: [...state.edges, ...newEdges],
      history: {
        past: [...state.history.past, createSnapshot(state)].slice(-MAX_HISTORY_LENGTH),
        future: []
      }
    }));
  },

  paste: () => {
    set((state) => {
      if (!state.clipboard) return state;
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
      clipboard: null
    }));
  }
})); 