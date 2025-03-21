import { useGraphElementsStore } from './graphElementsStore';
import { useUIStateStore } from './uiStateStore';
import { useHistoryStore, addCurrentStateToHistory } from './historyStore';
import { useClipboardStore } from './clipboardStore';
import { useCallback } from 'react';
import { Node, Edge, NodeChange, EdgeChange, Connection, Viewport } from 'reactflow';
import { NodeData } from '../types/node';
import { EdgeData } from '../types/graph';

export { useGraphElementsStore } from './graphElementsStore';
export { useUIStateStore } from './uiStateStore';
export { useHistoryStore } from './historyStore';
export { useClipboardStore } from './clipboardStore';

/**
 * A custom hook that provides a unified interface for all graph operations
 * This preserves compatibility with the old useGraphStore
 */
export const useGraph = () => {
  // Get all the store states and actions
  const graphElements = useGraphElementsStore();
  const uiState = useUIStateStore();
  const history = useHistoryStore();
  const clipboard = useClipboardStore();

  // Node actions with history tracking
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    addCurrentStateToHistory();
    graphElements.onNodesChange(changes);
  }, [graphElements]);

  const addNode = useCallback((node: Node<NodeData>) => {
    addCurrentStateToHistory();
    graphElements.addNode(node);
  }, [graphElements]);

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    addCurrentStateToHistory();
    graphElements.updateNodeConfig(nodeId, config);
  }, [graphElements]);

  const removeNode = useCallback((nodeId: string) => {
    addCurrentStateToHistory();
    graphElements.removeNode(nodeId);
  }, [graphElements]);

  // Edge actions with history tracking
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    addCurrentStateToHistory();
    graphElements.onEdgesChange(changes);
  }, [graphElements]);

  const onConnect = useCallback((connection: Connection) => {
    addCurrentStateToHistory();
    graphElements.onConnect(connection);
  }, [graphElements]);

  const updateEdge = useCallback((edge: Edge<EdgeData>) => {
    addCurrentStateToHistory();
    graphElements.updateEdge(edge);
  }, [graphElements]);

  const addEdge = useCallback((edge: Edge<EdgeData>) => {
    addCurrentStateToHistory();
    graphElements.addEdge(edge);
  }, [graphElements]);

  const removeEdge = useCallback((edgeId: string) => {
    addCurrentStateToHistory();
    graphElements.removeEdge(edgeId);
  }, [graphElements]);

  // Clear all
  const clear = useCallback(() => {
    addCurrentStateToHistory();
    graphElements.clear();
    history.clearHistory();
  }, [graphElements, history]);

  // Combined state
  return {
    // State
    nodes: graphElements.nodes,
    edges: graphElements.edges,
    selectedElements: uiState.selectedElements,
    viewport: uiState.viewport,
    clipboard: clipboard.clipboard,

    // Node actions
    onNodesChange,
    addNode,
    updateNodeConfig,
    removeNode,

    // Edge actions
    onEdgesChange,
    onConnect,
    updateEdge,
    addEdge,
    removeEdge,

    // Selection actions
    setSelectedElements: uiState.setSelectedElements,
    selectNodes: uiState.selectNodes,
    selectEdges: uiState.selectEdges,
    deselectAll: uiState.deselectAll,

    // History actions
    undo: history.undo,
    redo: history.redo,

    // Viewport actions
    setViewport: (viewport: Viewport) => {
      uiState.setViewport(viewport);
    },

    // Clipboard actions
    copySelectedElements: clipboard.copySelectedElements,
    pasteElements: clipboard.pasteElements,
    copy: clipboard.copySelectedElements, // Alias for compatibility
    paste: clipboard.pasteElements, // Alias for compatibility

    // Clear all
    clear,
  };
}; 