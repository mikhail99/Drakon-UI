import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { NodeData } from '../types/node';
import { EdgeData } from '../types/graph';
import { useGraphElementsStore } from './graphElementsStore';
import { useUIStateStore } from './uiStateStore';
import { addCurrentStateToHistory } from './historyStore';

interface ClipboardData {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
}

interface ClipboardState {
  clipboard: ClipboardData | null;
}

interface ClipboardStore extends ClipboardState {
  // Clipboard actions
  copySelectedElements: () => void;
  pasteElements: () => void;
  setClipboard: (data: ClipboardData | null) => void;
  clearClipboard: () => void;
}

export const useClipboardStore = create<ClipboardStore>((set) => ({
  clipboard: null,

  // Clipboard actions
  copySelectedElements: () => {
    const { nodes, edges } = useGraphElementsStore.getState();
    const { selectedElements } = useUIStateStore.getState();
    
    // Filter selected nodes and edges
    const selectedNodes = nodes.filter(node => 
      selectedElements.nodes.includes(node.id)
    );
    
    const selectedEdges = edges.filter(edge => 
      selectedElements.edges.includes(edge.id) ||
      (selectedNodes.some(n => n.id === edge.source) && 
       selectedNodes.some(n => n.id === edge.target))
    );
    
    set({
      clipboard: {
        nodes: selectedNodes,
        edges: selectedEdges,
      },
    });
  },

  pasteElements: () => {
    const { clipboard } = useClipboardStore.getState();
    
    if (!clipboard || clipboard.nodes.length === 0) return;
    
    // Create a mapping from old IDs to new IDs
    const idMap = new Map<string, string>();
    
    // Add current state to history before pasting
    addCurrentStateToHistory();
    
    // Create copies of nodes with new IDs
    const newNodes = clipboard.nodes.map(node => {
      const newId = `${node.id}_copy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      idMap.set(node.id, newId);
      
      // Offset position to make it clear these are new nodes
      const newPosition = {
        x: node.position.x + 50,
        y: node.position.y + 50,
      };
      
      return {
        ...node,
        id: newId,
        position: newPosition,
        selected: true,
      };
    });
    
    // Create copies of edges with updated source/target IDs
    const newEdges = clipboard.edges
      .filter(edge => 
        idMap.has(edge.source) && idMap.has(edge.target)
      )
      .map(edge => {
        const newId = `${edge.id}_copy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSource = idMap.get(edge.source) || '';
        const newTarget = idMap.get(edge.target) || '';
        
        return {
          ...edge,
          id: newId,
          source: newSource,
          target: newTarget,
          selected: true,
        };
      });
    
    // Add the new elements to the graph
    newNodes.forEach(node => {
      useGraphElementsStore.getState().addNode(node);
    });
    
    newEdges.forEach(edge => {
      useGraphElementsStore.getState().addEdge(edge);
    });
    
    // Update selection
    useUIStateStore.getState().setSelectedElements({
      nodes: newNodes.map(node => node.id),
      edges: newEdges.map(edge => edge.id),
    });
  },

  setClipboard: (data) => {
    set({
      clipboard: data,
    });
  },

  clearClipboard: () => {
    set({
      clipboard: null,
    });
  },
})); 