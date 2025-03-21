# Simplification Opportunities

## Overview

This document identifies opportunities to simplify the Drakon UI codebase, focusing on component consolidation, code reuse, and architectural improvements.

## Component Consolidation

### 1. Reusable Component Abstractions

#### Current Issues:
- Similar UI patterns are reimplemented across components
- Node types have duplicated styling and behavior
- Dialog components share common patterns but lack abstraction

#### Opportunities:
- **Create a BaseNode Component**: 
  ```typescript
  // Example refactoring
  const BaseNode = ({ header, content, inputs, outputs, ...props }) => (
    <StyledCard>
      <NodeHeader>{header}</NodeHeader>
      <PortsSection position="left" ports={inputs} />
      <NodeContent>{content}</NodeContent>
      <PortsSection position="right" ports={outputs} />
    </StyledCard>
  );
  
  // Usage
  const MathNode = (props) => (
    <BaseNode
      header={<MathNodeHeader type={props.data.type} />}
      content={<MathNodeContent value={props.data.config.value} />}
      inputs={props.data.inputs}
      outputs={props.data.outputs}
    />
  );
  ```

- **Implement Dialog Framework**:
  Create a common dialog framework that handles modal behavior, headers, actions, and responsive sizing.

### 2. Component Hierarchy Simplification

#### Current Issues:
- Deeply nested component trees in GraphEditor
- Many small components with mixed responsibilities
- Excessive prop drilling and complex rendering logic

#### Opportunities:
- **Flatten Component Hierarchy**:
  - Move control panels to separate top-level components
  - Reduce nesting of context providers
  - Use composition instead of deep nesting

- **Separate Graph Controls**:
  ```typescript
  // Before
  <GraphEditor>
    {/* Many nested controls and panels */}
  </GraphEditor>
  
  // After
  <GraphEditorContainer>
    <GraphToolbar />
    <GraphCanvas />
    <SidePanel />
  </GraphEditorContainer>
  ```

## Custom Hook Extraction

### 1. Extract Common Patterns into Hooks

#### Current Issues:
- Duplicated state management patterns across components
- Complex useEffect logic for handling viewport, selection, etc.
- Direct store access mixed with component logic

#### Opportunities:
- **Create Focused Custom Hooks**:
  ```typescript
  // Before
  const GraphComponent = () => {
    const { nodes, edges } = useGraphStore();
    
    useEffect(() => {
      // Complex logic for handling selection
    }, [nodes, edges]);
    
    // More mixed concerns
  };
  
  // After
  const useNodeSelection = () => {
    const { nodes } = useGraphStore(state => ({ nodes: state.nodes }));
    const { setSelectedElements } = useGraphStore(state => ({ 
      setSelectedElements: state.setSelectedElements 
    }));
    
    // Selection logic in one place
    return { selectedNodes, selectNode, clearSelection };
  };
  
  const GraphComponent = () => {
    const { selectedNodes, selectNode } = useNodeSelection();
    // Much cleaner component
  };
  ```

- **Extract Specific Functionality**:
  - `useGraphHistory` - Manage undo/redo functionality
  - `useNodeManagement` - Handle node CRUD operations
  - `useConnectionValidation` - Validate edge connections
  - `useViewportControls` - Handle zoom, pan, and fit operations

### 2. Abstract Common UI Interactions

#### Current Issues:
- Repeated event handler patterns
- Similar drag-and-drop logic across components
- Context menu behavior duplicated

#### Opportunities:
- **Create DragAndDrop Hook**:
  ```typescript
  const useDragAndDrop = (nodeType) => {
    // Centralize drag logic
    return {
      onDragStart,
      onDragOver,
      onDrop
    };
  };
  ```

- **Create Context Menu Hook**:
  ```typescript
  const useContextMenu = () => {
    const [contextMenu, setContextMenu] = useState({ open: false, position: { x: 0, y: 0 } });
    
    const handleContextMenu = useCallback((event) => {
      event.preventDefault();
      setContextMenu({
        open: true,
        position: { x: event.clientX, y: event.clientY }
      });
    }, []);
    
    const closeContextMenu = useCallback(() => {
      setContextMenu(prev => ({ ...prev, open: false }));
    }, []);
    
    return { contextMenu, handleContextMenu, closeContextMenu };
  };
  ```

## Interface Standardization

### 1. Consistent Prop Interfaces

#### Current Issues:
- Inconsistent prop naming across similar components
- Props that do the same thing but have different names
- Missing TypeScript interfaces for some components

#### Opportunities:
- **Define Standard Prop Types**:
  ```typescript
  // Use consistent naming and structure
  interface NodeProps {
    id: string;
    data: NodeData;
    selected: boolean;
    position: XYPosition;
    onUpdate?: (id: string, data: Partial<NodeData>) => void;
  }
  
  interface EdgeProps {
    id: string;
    source: string;
    target: string;
    data?: EdgeData;
    selected: boolean;
    onUpdate?: (id: string, data: Partial<EdgeData>) => void;
  }
  ```

- **Create Prop Type Libraries**:
  Gather related prop interfaces into dedicated files that can be imported throughout the app.

### 2. Consistent Event Handling

#### Current Issues:
- Inconsistent event handling patterns
- Mix of imperative and declarative approaches
- Different component behaviors in similar situations

#### Opportunities:
- **Standardize Event Handler Props**:
  ```typescript
  // Before
  <NodeA onChange={handleNodeAChange} />
  <NodeB onEdit={handleNodeBEdit} />
  
  // After
  <NodeA onChange={handleNodeChange} />
  <NodeB onChange={handleNodeChange} />
  ```

- **Use Consistent Event Objects**:
  ```typescript
  // Define standard event types
  type NodeChangeEvent = {
    type: 'config' | 'position' | 'connection';
    nodeId: string;
    value: any;
  };
  ```

## Code Quality Improvements

### 1. Simplifying Complex Conditionals

#### Current Issues:
- Complex conditional rendering
- Nested ternary operators
- Multiple conditions for similar behaviors

#### Opportunities:
- **Extract Conditional Logic**:
  ```typescript
  // Before
  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage msg={error} />
      ) : data ? (
        <DataComponent data={data} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
  
  // After
  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage msg={error} />;
    if (data) return <DataComponent data={data} />;
    return <EmptyState />;
  };
  
  return <div>{renderContent()}</div>;
  ```

- **Use Component Maps**:
  ```typescript
  const nodeComponents = {
    'math': MathNode,
    'io': IONode,
    'comment': CommentNode,
    // Default fallback
    'default': DefaultNode
  };
  
  const NodeRenderer = ({ type, ...props }) => {
    const Component = nodeComponents[type] || nodeComponents.default;
    return <Component {...props} />;
  };
  ```

### 2. Improving Type Definitions

#### Current Issues:
- Some type definitions are overly complex
- Others are too loose (e.g., using `any`)
- Inconsistent type reuse

#### Opportunities:
- **Create Type Hierarchies**:
  ```typescript
  // Base types
  type BaseNodeType = {
    id: string;
    label: string;
  };
  
  // More specific types
  type MathNodeType = BaseNodeType & {
    operation: 'add' | 'subtract' | 'multiply' | 'divide';
    inputs: InputPort[];
    outputs: OutputPort[];
  };
  ```

- **Eliminate `any` Types**:
  Replace generic `any` or `Record<string, any>` with more specific types.

## Next Steps

1. **Prioritize Simplifications**:
   - Start with component abstractions for highest impact
   - Focus on areas with the most duplication first
   - Target components with the highest complexity scores

2. **Create Proof-of-Concept Refactorings**:
   - Implement sample refactorings for key components
   - Test performance and maintenance improvements
   - Document refactoring patterns for team adoption

3. **Establish Coding Standards**:
   - Document component composition patterns
   - Create guidelines for hook extraction
   - Establish naming conventions for props and events
