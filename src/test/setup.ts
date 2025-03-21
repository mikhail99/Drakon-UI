import '@testing-library/jest-dom';
import React from 'react';

// Mock ReactFlow
jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  // Mock specific ReactFlow components/hooks as needed
  useReactFlow: () => ({
    project: (point: { x: number; y: number }) => point,
    getNodes: () => [],
    getEdges: () => [],
    setNodes: jest.fn(),
    setEdges: jest.fn(),
    fitView: jest.fn(),
  }),
  // Add other ReactFlow components that need mocking
  Background: () => React.createElement('div', { 'data-testid': 'mock-background' }),
  MiniMap: () => React.createElement('div', { 'data-testid': 'mock-minimap' }),
  Controls: () => React.createElement('div', { 'data-testid': 'mock-controls' }),
}));

// Mock ResizeObserver (required for ReactFlow)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock DOM element methods not implemented in JSDOM
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 120,
  height: 120,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  x: 0,
  y: 0,
  toJSON: () => {},
}));

// Setup global test timeouts
jest.setTimeout(10000); 