import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactFlowProvider } from 'reactflow';

// We'll assume there's a createGraphStore function that we'll mock
// This mock indicates how it would be used
const mockGraphStore = {
  getState: () => ({
    nodes: [],
    edges: [],
    selectedElements: { nodes: [], edges: [] },
    history: { past: [], future: [] },
    viewport: { x: 0, y: 0, zoom: 1 },
  }),
  setState: jest.fn(),
  // Add other store methods as needed
  onNodesChange: jest.fn(),
  onEdgesChange: jest.fn(),
  addNode: jest.fn(),
  updateNodeConfig: jest.fn(),
  setSelectedElements: jest.fn(),
  // ... other methods
};

// Mock store creation for testing
const createTestStore = (customState = {}) => {
  // Return mocked store with custom state
  return {
    ...mockGraphStore,
    getState: () => ({
      ...mockGraphStore.getState(),
      ...customState,
    }),
  };
};

// Explicitly inject the jest variable to avoid TypeScript errors
const jestFn = jest.fn;

// Custom renderer that provides store context
export function renderWithStore(
  ui: ReactElement,
  initialState = {},
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const store = createTestStore(initialState);
  
  // Mock the useGraphStore hook
  jest.mock('../../store/graphStore', () => ({
    useGraphStore: () => store,
  }));
  
  return {
    ...render(ui, options),
    store,
    user: userEvent.setup(),
  };
}

// Render with ReactFlow context
export function renderWithFlow(
  ui: ReactElement,
  initialState = {},
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return renderWithStore(
    <ReactFlowProvider>{ui}</ReactFlowProvider>,
    initialState,
    options
  );
} 