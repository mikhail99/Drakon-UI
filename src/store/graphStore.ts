/**
 * @deprecated This file is kept for backwards compatibility.
 * Please use the new domain-specific stores instead:
 * - useGraphElementsStore for nodes and edges
 * - useUIStateStore for selection and viewport
 * - useHistoryStore for undo/redo
 * - useClipboardStore for clipboard operations
 * 
 * Or use the unified useGraph hook for a combined API.
 */

import { create } from 'zustand';
import { Viewport, Edge, NodeChange, EdgeChange, Connection, Node } from 'reactflow';
import { NodeData, CustomNode } from '../types/node';
import { GraphState, EdgeData } from '../types/graph';
import { useGraphElementsStore } from './graphElementsStore';
import { useUIStateStore } from './uiStateStore';
import { useHistoryStore, addCurrentStateToHistory } from './historyStore';
import { useClipboardStore } from './clipboardStore';

// This is a more direct version of the store that maintains direct access to setState and getState
// for compatibility with the tests
export const useGraphStore = create<GraphState & GraphActions>((set, get) => {
  // Initialize the store with values from the domain-specific stores
  set({
    nodes: useGraphElementsStore.getState().nodes,
    edges: useGraphElementsStore.getState().edges,
    selectedElements: useUIStateStore.getState().selectedElements,
    viewport: useUIStateStore.getState().viewport,
    history: useHistoryStore.getState(),
    clipboard: useClipboardStore.getState().clipboard
  });

  // Set up listeners to keep the state in sync with the domain stores
  useGraphElementsStore.subscribe((state) => {
    set({
      nodes: state.nodes,
      edges: state.edges
    });
  });

  useUIStateStore.subscribe((state) => {
    set({
      selectedElements: state.selectedElements,
      viewport: state.viewport
    });
  });

  useHistoryStore.subscribe((state) => {
    set({ history: state });
  });

  useClipboardStore.subscribe((state) => {
    set({ clipboard: state.clipboard });
  });

  return {
    // State - initial values will be overwritten by the subscriptions
    nodes: [],
    edges: [],
    selectedElements: { nodes: [], edges: [] },
    viewport: { x: 0, y: 0, zoom: 1 },
    history: { past: [], future: [] },
    clipboard: null,

    // Node actions
    onNodesChange: (changes) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().onNodesChange(changes);
    },

    addNode: (node) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().addNode(node as Node<NodeData>);
    },

    updateNodeConfig: (nodeId, config) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().updateNodeConfig(nodeId, config);
    },

    removeNode: (nodeId) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().removeNode(nodeId);
    },

    // Edge actions
    onEdgesChange: (changes) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().onEdgesChange(changes);
    },

    onConnect: (connection) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().onConnect(connection);
    },

    updateEdge: (edge) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().updateEdge(edge as Edge<EdgeData>);
    },

    addEdge: (edge) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().addEdge(edge);
    },

    removeEdge: (edgeId) => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().removeEdge(edgeId);
    },

    // Selection actions
    setSelectedElements: (elements) => {
      useUIStateStore.getState().setSelectedElements(elements);
    },

    selectNodes: (nodeIds) => {
      useUIStateStore.getState().selectNodes(nodeIds);
    },

    selectEdges: (edgeIds) => {
      useUIStateStore.getState().selectEdges(edgeIds);
    },

    deselectAll: () => {
      useUIStateStore.getState().deselectAll();
    },

    // History actions
    undo: () => {
      useHistoryStore.getState().undo();
    },

    redo: () => {
      useHistoryStore.getState().redo();
    },

    // Viewport actions
    setViewport: (viewport) => {
      useUIStateStore.getState().setViewport(viewport);
    },

    // Clipboard actions
    copySelectedElements: () => {
      useClipboardStore.getState().copySelectedElements();
    },

    pasteElements: () => {
      useClipboardStore.getState().pasteElements();
    },

    copy: () => {
      useClipboardStore.getState().copySelectedElements();
    },

    paste: () => {
      useClipboardStore.getState().pasteElements();
    },

    clear: () => {
      addCurrentStateToHistory();
      useGraphElementsStore.getState().clear();
      useClipboardStore.getState().clearClipboard();
    }
  };
});

// Separate the actions interface for better type checking
interface GraphActions {
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