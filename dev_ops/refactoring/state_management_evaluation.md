# State Management Evaluation

## Overview

This document evaluates the current state management implementation in the Drakon UI application, focusing on the Zustand store organization, access patterns, and opportunities for improvement.

## Current State Management Architecture

### Primary Store: `graphStore`

The application primarily uses a single Zustand store (`graphStore.ts`) that manages:

1. **Graph Elements**:
   - Nodes (position, data, configuration)
   - Edges (connections between nodes)

2. **UI State**:
   - Viewport position and zoom
   - Selected elements (nodes and edges)

3. **History Management**:
   - Undo/redo functionality
   - Past and future states

4. **Clipboard Operations**:
   - Copy selected elements
   - Paste copied elements

### Store Structure

```typescript
interface GraphStore extends GraphState {
  // Node actions
  onNodesChange: (changes: NodeChange[]) => void;
  addNode: (node: CustomNode) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  
  // Edge actions
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateEdge: (edge: Edge) => void;
  
  // Selection actions
  setSelectedElements: (elements: { nodes: string[]; edges: string[] }) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  
  // Viewport actions
  setViewport: (viewport: Viewport) => void;
  
  // Clipboard actions
  copySelectedElements: () => void;
  pasteElements: () => void;
}
```

## Store Access Patterns

### Direct Hook Usage

Components access the store directly using the Zustand hook:

```typescript
const { 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange 
} = useGraphStore();
```

### Direct State Access

Some components access the store state directly using `getState()`:

```typescript
const { selectedElements } = useGraphStore.getState();
```

### Hybrid Approaches

The application uses a mix of these patterns:

1. **ReactFlow Components**: Access store via destructured hooks
2. **Control Components**: Mix of hook usage and direct state access
3. **Utility Functions**: Often use direct state access with `getState()`

## Store Duplication Issues

### Global State in Multiple Places

1. **State Duplication**:
   - Nodes and edges data may be held both in the React Flow state and in Zustand
   - Selected elements are tracked both by React Flow and the store

2. **Local Component State**:
   - Some components maintain local state that mirrors store data
   - Example: `NodeConfiguration` duplicates node configuration in local state

## Performance Implications

### Re-render Cascades

1. **Store Updates Trigger Widespread Re-renders**:
   - Any change to nodes or edges potentially re-renders multiple components
   - Selection changes affect various UI components

2. **Missing Memoization**:
   - Not all selectors are memoized, causing unnecessary re-renders
   - Component dependencies on store values are sometimes too broad

### History Management Overhead

1. **Large State Snapshots**:
   - Every graph change saves the entire graph state in history
   - Could become a performance bottleneck with large graphs

2. **Redundant State Copies**:
   - Multiple copies of almost identical state are stored in history

## Opportunities for Improvement

### Store Reorganization

1. **Split into Domain-specific Stores**:
   - `graphElementsStore`: Manage nodes and edges
   - `uiStateStore`: Handle viewport, selection, UI modes
   - `historyStore`: Manage undo/redo functionality

2. **Introduce Middlewares**:
   - History middleware to track changes
   - Persistence middleware for auto-saving
   - Validation middleware for graph integrity

### Access Patterns

1. **Standardize Store Access**:
   - Use hooks consistently instead of mixing with `getState()`
   - Create custom hooks for specific functionality

2. **Improve Selector Usage**:
   - Create fine-grained selectors for specific data slices
   - Use `useShallow` or similar for shallow equality checks

3. **Reduce Direct Dependencies**:
   - Use context for providing store references
   - Implement facade pattern for common operations

### Performance Optimizations

1. **Selective History Management**:
   - Track only changed parts of the state
   - Implement a more efficient undo/redo system

2. **Optimize Selection Management**:
   - Use sets instead of arrays for better lookup performance
   - Implement more efficient selection tracking

3. **Lazy State Updates**:
   - Debounce frequent updates like viewport changes
   - Batch related updates to reduce re-renders

## Next Steps

1. **Audit Store Usage**:
   - Map all components that access the store
   - Identify specific patterns and anti-patterns

2. **Benchmark Performance**:
   - Measure render times with different state sizes
   - Identify performance bottlenecks in state updates

3. **Incremental Refactoring**:
   - Start with the most isolated aspects (e.g., history management)
   - Gradually refactor toward a more modular architecture
   - Implement unit tests to prevent regressions during refactoring
