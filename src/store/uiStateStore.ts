import { create } from 'zustand';
import { Viewport } from 'reactflow';

interface SelectedElements {
  nodes: string[];
  edges: string[];
}

interface UIStateState {
  selectedElements: SelectedElements;
  viewport: Viewport;
}

interface UIStateStore extends UIStateState {
  // Selection actions
  setSelectedElements: (elements: SelectedElements) => void;
  selectNodes: (nodeIds: string[]) => void;
  selectEdges: (edgeIds: string[]) => void;
  deselectAll: () => void;
  
  // Viewport actions
  setViewport: (viewport: Viewport) => void;
}

const initialViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const useUIStateStore = create<UIStateStore>((set) => ({
  selectedElements: { nodes: [], edges: [] },
  viewport: initialViewport,

  // Selection actions
  setSelectedElements: (elements) => {
    set(() => ({
      selectedElements: elements,
    }));
  },

  selectNodes: (nodeIds) => {
    set((state) => ({
      selectedElements: {
        ...state.selectedElements,
        nodes: nodeIds
      }
    }));
  },

  selectEdges: (edgeIds) => {
    set((state) => ({
      selectedElements: {
        ...state.selectedElements,
        edges: edgeIds
      }
    }));
  },

  deselectAll: () => {
    set(() => ({
      selectedElements: {
        nodes: [],
        edges: []
      }
    }));
  },

  // Viewport actions
  setViewport: (viewport) => {
    set(() => ({
      viewport,
    }));
  },
})); 