import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, Edge, NodeChange, EdgeChange, Connection, addEdge, Node } from 'reactflow';
import { NodeData } from '../types/node';
import { EdgeData } from '../types/graph';
import { validateConnection } from '../utils/graphUtils';
import { graphEvents, GRAPH_EVENTS } from '../utils/eventEmitter';

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
    set((state) => {
      const updatedNodes = applyNodeChanges(changes, state.nodes);
      
      // Emit change event
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, updatedNodes, state.edges);
      
      return {
        nodes: updatedNodes,
      };
    });
  },

  addNode: (node) => {
    set((state) => {
      console.log('Adding node with initial data:', {
        id: node.id,
        label: node.data.label,
        type: node.data.type
      });
      
      // Ensure the node keeps its original label
      const nodeWithPreservedLabel = {
        ...node,
        data: {
          ...node.data,
          // Explicitly preserve the label, especially if it's "AAA"
          label: node.data.label
        }
      };
      
      console.log('Node after preservation:', {
        id: nodeWithPreservedLabel.id, 
        label: nodeWithPreservedLabel.data.label
      });
      
      const updatedNodes = [...state.nodes, nodeWithPreservedLabel];
      
      // Emit node added event
      graphEvents.emit(GRAPH_EVENTS.NODE_ADDED, nodeWithPreservedLabel);
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, updatedNodes, state.edges);
      
      return {
        nodes: updatedNodes,
      };
    });
  },

  updateNodeConfig: (nodeId, config) => {
    set((state) => {
      const updatedNodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          console.log('Updating node config:', nodeId);
          console.log('Current node data:', node.data);
          console.log('New config to apply:', config);
          
          // Create updated node with new config
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              // If label is provided in config, update the main label
              ...(config.label ? { label: config.label } : {}),
              config: {
                ...node.data.config,
                ...config
              }
            }
          };
          
          console.log('Updated node data:', updatedNode.data);
          
          // Emit node updated event
          graphEvents.emit(GRAPH_EVENTS.NODE_UPDATED, updatedNode);
          
          return updatedNode;
        }
        return node;
      });
      
      // Emit change event
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, updatedNodes, state.edges);
      
      return { nodes: updatedNodes };
    });
  },

  removeNode: (nodeId) => {
    set((state) => {
      // Filter edges that don't use the node being removed
      const newEdges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );

      // Find the node being removed (for event)
      const nodeToRemove = state.nodes.find(node => node.id === nodeId);
      
      // Filter out the node
      const updatedNodes = state.nodes.filter((node) => node.id !== nodeId);
      
      // Emit node removed event
      if (nodeToRemove) {
        graphEvents.emit(GRAPH_EVENTS.NODE_REMOVED, nodeToRemove);
      }
      
      // Emit edges removed events for any connected edges
      const removedEdges = state.edges.filter(
        (edge) => edge.source === nodeId || edge.target === nodeId
      );
      
      removedEdges.forEach(edge => {
        graphEvents.emit(GRAPH_EVENTS.EDGE_REMOVED, edge);
      });
      
      // Emit change event
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, updatedNodes, newEdges);
      
      return {
        nodes: updatedNodes,
        edges: newEdges,
      };
    });
  },

  // Edge actions
  onEdgesChange: (changes) => {
    set((state) => {
      const updatedEdges = applyEdgeChanges(changes, state.edges);
      
      // Emit change event
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, state.nodes, updatedEdges);
      
      return {
        edges: updatedEdges,
      };
    });
  },

  onConnect: (connection) => {
    set((state) => {
      const newEdges = addEdge(connection, state.edges);
      const addedEdge = newEdges[newEdges.length - 1]; // The newly added edge
      
      // Emit edge added event
      graphEvents.emit(GRAPH_EVENTS.EDGE_ADDED, addedEdge);
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, state.nodes, newEdges);
      
      return {
        edges: newEdges,
      };
    });
  },

  updateEdge: (updatedEdge) => {
    set((state) => {
      const newEdges = state.edges.map((edge) => {
        if (edge.id === updatedEdge.id) {
          // Emit edge updated event
          graphEvents.emit(GRAPH_EVENTS.EDGE_UPDATED, updatedEdge);
          return updatedEdge;
        }
        return edge;
      });
      
      // Emit change event
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, state.nodes, newEdges);
      
      return {
        edges: newEdges,
      };
    });
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

      // Emit edge added event
      graphEvents.emit(GRAPH_EVENTS.EDGE_ADDED, edge);
      
      const newEdges = [...state.edges, edge];
      
      // Emit change event
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, state.nodes, newEdges);
      
      return {
        edges: newEdges,
      };
    });
  },

  removeEdge: (edgeId) => {
    set((state) => {
      // Find the edge being removed (for event)
      const edgeToRemove = state.edges.find(edge => edge.id === edgeId);
      
      const newEdges = state.edges.filter((edge) => edge.id !== edgeId);
      
      // Emit edge removed event
      if (edgeToRemove) {
        graphEvents.emit(GRAPH_EVENTS.EDGE_REMOVED, edgeToRemove);
      }
      
      // Emit change event
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, state.nodes, newEdges);
      
      return {
        edges: newEdges,
      };
    });
  },

  clear: () => {
    set(() => {
      // Emit clear event
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CLEARED);
      graphEvents.emit(GRAPH_EVENTS.GRAPH_CHANGED, [], []);
      
      return {
        nodes: [],
        edges: [],
      };
    });
  },

  getState: () => {
    return get();
  },
})); 