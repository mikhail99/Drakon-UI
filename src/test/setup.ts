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

// Mock ResizeObserver which is required by ReactFlow
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

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback): number => setTimeout(callback, 0);
global.cancelAnimationFrame = (id: number): void => clearTimeout(id);

// Mock matchMedia which is required for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Setup global test timeouts
jest.setTimeout(10000); 