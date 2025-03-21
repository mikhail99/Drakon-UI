import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { NodeData } from '../types/node';
import { EdgeData } from '../types/graph';
import { useGraphElementsStore } from './graphElementsStore';
import { useUIStateStore } from './uiStateStore';

interface GraphSnapshot {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedElements: {
    nodes: string[];
    edges: string[];
  };
}

interface HistoryState {
  past: GraphSnapshot[];
  future: GraphSnapshot[];
}

interface HistoryStore extends HistoryState {
  // History actions
  addToHistory: (snapshot: GraphSnapshot) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

const MAX_HISTORY_LENGTH = 50;

const createSnapshot = (): GraphSnapshot => {
  const { nodes, edges } = useGraphElementsStore.getState();
  const { selectedElements } = useUIStateStore.getState();
  return {
    nodes,
    edges,
    selectedElements
  };
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],

  // History actions
  addToHistory: (snapshot) => {
    set((state) => ({
      past: [...state.past, snapshot].slice(-MAX_HISTORY_LENGTH),
      future: [],
    }));
  },

  undo: () => {
    const { past, future } = get();

    if (past.length === 0) return;

    const newPast = [...past];
    const previous = newPast.pop();
    
    if (!previous) return;

    // Create snapshot of current state before undoing
    const currentSnapshot = createSnapshot();
    
    // Apply the previous state
    useGraphElementsStore.setState({ 
      nodes: previous.nodes, 
      edges: previous.edges 
    });
    
    useUIStateStore.setState({
      selectedElements: previous.selectedElements
    });

    // Update the history
    set({
      past: newPast,
      future: [currentSnapshot, ...future],
    });
  },

  redo: () => {
    const { past, future } = get();

    if (future.length === 0) return;

    const newFuture = [...future];
    const next = newFuture.shift();
    
    if (!next) return;

    // Create snapshot of current state before redoing
    const currentSnapshot = createSnapshot();
    
    // Apply the next state
    useGraphElementsStore.setState({ 
      nodes: next.nodes, 
      edges: next.edges 
    });
    
    useUIStateStore.setState({
      selectedElements: next.selectedElements
    });

    // Update the history
    set({
      past: [...past, currentSnapshot],
      future: newFuture,
    });
  },

  clearHistory: () => {
    set({
      past: [],
      future: [],
    });
  },
}));

// Helper function to add current state to history
export const addCurrentStateToHistory = () => {
  const snapshot = createSnapshot();
  useHistoryStore.getState().addToHistory(snapshot);
}; 