import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GraphEditor from '../../components/graph/GraphEditor';
import useGraphStore from '../../store/graphStore';

// Mock ReactFlow (it's complex and needs to be mocked)
jest.mock('reactflow', () => ({
  ReactFlow: jest.fn(({ children }) => (
    <div data-testid="react-flow">
      {children}
    </div>
  )),
  Background: jest.fn(() => <div data-testid="background" />),
  Controls: jest.fn(() => <div data-testid="controls" />),
  MiniMap: jest.fn(() => <div data-testid="minimap" />),
  useNodesState: jest.fn(() => [[], jest.fn()]),
  useEdgesState: jest.fn(() => [[], jest.fn()]),
  useReactFlow: jest.fn(() => ({
    fitView: jest.fn(),
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    getViewport: jest.fn(() => ({ x: 0, y: 0, zoom: 1 })),
    setViewport: jest.fn(),
    project: jest.fn((pos) => pos),
  })),
  applyNodeChanges: jest.fn((changes, nodes) => nodes),
  applyEdgeChanges: jest.fn((changes, edges) => edges),
  addEdge: jest.fn((params, edges) => [...edges, params]),
  MarkerType: { ArrowClosed: 'arrow-closed' },
  Panel: jest.fn(({ children }) => <div data-testid="panel">{children}</div>),
}));

// Mock the graph store
jest.mock('../../store/graphStore', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(),
    setState: jest.fn(),
    subscribe: jest.fn((callback) => {
      callback();
      return jest.fn(); // unsubscribe function
    }),
  },
}));

describe('GraphEditor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock values
    (useGraphStore.getState as jest.Mock).mockReturnValue({
      nodes: [],
      edges: [],
      onNodesChange: jest.fn(),
      onEdgesChange: jest.fn(),
      onConnect: jest.fn(),
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedElements: { nodes: [], edges: [] }
    });
  });

  it('renders the component with ReactFlow', () => {
    render(<GraphEditor />);
    
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('background')).toBeInTheDocument();
    expect(screen.getByTestId('controls')).toBeInTheDocument();
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
  });

  it('updates store when viewport changes', () => {
    const setStateMock = jest.fn();
    (useGraphStore.setState as jest.Mock) = setStateMock;
    
    render(<GraphEditor />);
    
    // Find and trigger viewport change event
    const reactFlowWrapper = screen.getByTestId('react-flow');
    // Create a custom event for viewport change
    const viewportEvent = new CustomEvent('viewportChanged', {
      detail: { viewport: { x: 100, y: 100, zoom: 2 } }
    });
    reactFlowWrapper.dispatchEvent(viewportEvent);
    
    expect(setStateMock).toHaveBeenCalledWith(expect.objectContaining({
      viewport: { x: 100, y: 100, zoom: 2 }
    }));
  });

  it('handles node selection', () => {
    const setSelectedElementsMock = jest.fn();
    (useGraphStore.getState as jest.Mock).mockReturnValue({
      nodes: [{ id: 'node1', position: { x: 0, y: 0 }, data: {} }],
      edges: [],
      setSelectedElements: setSelectedElementsMock
    });
    
    render(<GraphEditor />);
    
    // Simulate node selection event
    const reactFlowWrapper = screen.getByTestId('react-flow');
    // Create a custom event for node selection
    const nodeEvent = new CustomEvent('nodeClick', {
      detail: { id: 'node1' }
    });
    reactFlowWrapper.dispatchEvent(nodeEvent);
    
    expect(setSelectedElementsMock).toHaveBeenCalledWith({
      nodes: ['node1'],
      edges: []
    });
  });

  it('handles edge selection', () => {
    const setSelectedElementsMock = jest.fn();
    (useGraphStore.getState as jest.Mock).mockReturnValue({
      nodes: [],
      edges: [{ id: 'edge1', source: 'node1', target: 'node2' }],
      setSelectedElements: setSelectedElementsMock
    });
    
    render(<GraphEditor />);
    
    // Simulate edge selection event
    const reactFlowWrapper = screen.getByTestId('react-flow');
    // Create a custom event for edge selection
    const edgeEvent = new CustomEvent('edgeClick', {
      detail: { id: 'edge1' }
    });
    reactFlowWrapper.dispatchEvent(edgeEvent);
    
    expect(setSelectedElementsMock).toHaveBeenCalledWith({
      nodes: [],
      edges: ['edge1']
    });
  });

  it('adds a node on drop event', () => {
    const addNodeMock = jest.fn();
    (useGraphStore.getState as jest.Mock).mockReturnValue({
      addNode: addNodeMock
    });
    
    render(<GraphEditor />);
    
    // Mock drag and drop event
    const reactFlowWrapper = screen.getByTestId('react-flow');
    const mockData = JSON.stringify({
      type: 'custom',
      data: { label: 'Test Node', inputs: [], outputs: [] }
    });
    
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        getData: jest.fn().mockReturnValue(mockData),
      },
    });
    Object.defineProperty(dropEvent, 'clientX', { value: 100 });
    Object.defineProperty(dropEvent, 'clientY', { value: 100 });
    Object.defineProperty(dropEvent, 'preventDefault', { value: jest.fn() });
    
    reactFlowWrapper.dispatchEvent(dropEvent);
    
    expect(addNodeMock).toHaveBeenCalledWith(expect.objectContaining({
      type: 'custom',
      position: expect.any(Object),
      data: expect.objectContaining({ label: 'Test Node' })
    }));
  });

  it('shows no nodes message when the graph is empty', () => {
    (useGraphStore.getState as jest.Mock).mockReturnValue({
      nodes: [],
      edges: []
    });
    
    render(<GraphEditor />);
    
    expect(screen.getByText(/drag and drop nodes/i)).toBeInTheDocument();
  });
}); 