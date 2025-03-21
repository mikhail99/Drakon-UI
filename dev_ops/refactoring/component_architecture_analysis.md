# Component Architecture Analysis

## Overview

This document analyzes the current component architecture of the Drakon UI application, identifying dependencies, interaction patterns, complexity, and opportunities for simplification.

## Component Dependency Map

```
GraphEditor (src/components/graph/GraphEditor.tsx)
├── NodeWrapper (src/components/nodes/NodeWrapper.tsx)
├── CommentNode (src/components/nodes/CommentNode.tsx)
├── LabeledEdge (src/components/edges/LabeledEdge.tsx)
├── NodePalette (src/components/palette/NodePalette.tsx)
├── NodeConfiguration (src/components/configuration/NodeConfiguration.tsx)
└── ContextMenu (src/components/menu/ContextMenu.tsx)
```

## State Management

The application uses Zustand for state management, with the primary store defined in `src/store/graphStore.ts`. The store manages:

- Nodes and edges (graph elements)
- Viewport state
- Selection state
- History (undo/redo)
- Clipboard operations

## Component Analysis

### GraphEditor
- **Responsibility**: Main container for the flow editor UI
- **Complexity**: High (365+ lines)
- **Dependencies**: 
  - ReactFlow library
  - Multiple custom components
  - Zustand store
- **Coupling**: High coupling to both React Flow and the graph store
- **Issues**: 
  - Handles too many responsibilities (layout, controls, callbacks, state management)
  - Event handlers are mixed with rendering logic

### NodeWrapper
- **Responsibility**: Renders different types of nodes with ports
- **Complexity**: Medium (125 lines)
- **Dependencies**:
  - ReactFlow
  - MUI components
- **Issues**:
  - Styling logic mixed with component logic
  - Limited abstraction for port rendering

### LabeledEdge
- **Responsibility**: Renders edge connections with labels
- **Complexity**: Low (74 lines)
- **Dependencies**:
  - ReactFlow edge components
- **Issues**:
  - Minimal, focused component with good separation of concerns

### NodePalette
- **Responsibility**: Displays available node types for dragging
- **Complexity**: High (175+ lines, estimated from snippets)
- **Dependencies**:
  - MUI components
  - Node type definitions
- **Issues**:
  - Potentially handling too many responsibilities (filtering, categorization, dragging)

### NodeConfiguration
- **Responsibility**: Displays and handles node configuration UI
- **Complexity**: Medium-High (not seen in snippets)
- **Dependencies**:
  - Zustand store for accessing selected node data
  - MUI components for form elements
- **Issues**:
  - Possibly tightly coupled to specific node types

## Interaction Patterns

1. **Component Communication**:
   - Primary communication happens through the Zustand store
   - Direct prop passing for child components
   - Some components may access store directly, creating hidden dependencies

2. **Event Handling**:
   - Most events are handled in GraphEditor and propagated to the store
   - ReactFlow callbacks are heavily used for graph interactions

3. **Rendering Patterns**:
   - Memoization is used in some components (e.g., NodeWrapper)
   - Potentially excessive re-renders due to store selector usage

## High Coupling Areas

1. **GraphEditor and ReactFlow**: The GraphEditor is tightly coupled to the ReactFlow library, making it difficult to change or update the underlying graph rendering.

2. **NodeWrapper and node data structure**: The NodeWrapper component assumes a specific structure for node data, making it challenging to change the data model.

3. **Store and UI components**: Many UI components directly access the Zustand store, creating hidden dependencies and making components less reusable.

## Opportunities for Simplification

1. **Separate concerns in GraphEditor**:
   - Extract control panel components
   - Split event handling logic from rendering
   - Create custom hooks for specific functionalities

2. **Improve component composition**:
   - Create more granular components for ports, handles, and node content
   - Implement a more flexible component hierarchy

3. **Refactor state management**:
   - Split the store into smaller, focused stores
   - Use selectors more effectively to prevent unnecessary re-renders
   - Create middleware for side effects

4. **Standardize interfaces**:
   - Establish consistent prop interfaces across components
   - Improve TypeScript typing for better IDE support and error catching

## Metrics

- **Total TypeScript Files**: 15
- **Component Breakdown**:
  - UI Components: 9
  - Custom Hooks: 2
  - State Management: 1
  - Type Definitions: 2
  - Utilities: 1

## Next Steps

1. Begin with the highest priority refactoring targets:
   - GraphEditor component (split into smaller components)
   - State management (improve organization and access patterns)

2. Implement standardized patterns for:
   - Component composition
   - Store access
   - Event handling

3. Create unit tests for refactored components to prevent regressions 