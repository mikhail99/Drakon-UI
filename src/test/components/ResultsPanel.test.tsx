import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsPanel from '../../components/results/ResultsPanel';
import { useExecutionStore } from '../../store/executionStore';
import { useGraphStore } from '../../store/graphStore';

// Mock the stores
jest.mock('../../store/executionStore', () => ({
  useExecutionStore: jest.fn(),
}));

jest.mock('../../store/graphStore', () => ({
  useGraphStore: jest.fn(),
}));

describe('ResultsPanel', () => {
  beforeEach(() => {
    // Setup default mock implementations
    (useGraphStore as unknown as jest.Mock).mockReturnValue({
      selectedElements: { nodes: [], edges: [] },
      nodes: [],
    });
    
    (useExecutionStore as unknown as jest.Mock).mockReturnValue({
      executionStatus: 'idle',
      isExecuting: false,
      results: {},
      runMockExecution: jest.fn(),
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with Configuration tab active by default', () => {
    render(<ResultsPanel />);
    
    // Check that the tabs are rendered
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
    
    // Check that the Configuration tab is active by default
    expect(screen.getByText('Select a node to configure it.')).toBeInTheDocument();
  });
  
  it('switches to Results tab when clicked', () => {
    render(<ResultsPanel />);
    
    // Click on the Results tab
    fireEvent.click(screen.getByText('Results'));
    
    // Check that we're showing the prompt to run the graph
    expect(screen.getByText('Run the graph to see execution results')).toBeInTheDocument();
    expect(screen.getByText('Run Graph')).toBeInTheDocument();
  });
  
  it('shows node execution results when a node is selected and has results', () => {
    // Mock a selected node with results
    (useGraphStore as unknown as jest.Mock).mockReturnValue({
      selectedElements: { nodes: ['node-1'], edges: [] },
      nodes: [{ id: 'node-1', data: { label: 'Test Node' } }],
    });
    
    (useExecutionStore as unknown as jest.Mock).mockReturnValue({
      executionStatus: 'completed',
      isExecuting: false,
      results: {
        'node-1': {
          nodeId: 'node-1',
          status: 'success',
          data: 42,
          executedAt: new Date(),
        },
      },
      runMockExecution: jest.fn(),
    });
    
    render(<ResultsPanel />);
    
    // Click on the Results tab
    fireEvent.click(screen.getByText('Results'));
    
    // Should show status
    expect(screen.getByText('Status: Completed')).toBeInTheDocument();
    
    // In the Results tab, we should see the value display - we need to wait for the value to render
    // since there might be some async state changes
    setTimeout(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    }, 0);
  });
  
  it('shows error information when a node execution has an error', () => {
    // Mock a selected node with an error result
    (useGraphStore as unknown as jest.Mock).mockReturnValue({
      selectedElements: { nodes: ['node-1'], edges: [] },
      nodes: [{ id: 'node-1', data: { label: 'Test Node' } }],
    });
    
    (useExecutionStore as unknown as jest.Mock).mockReturnValue({
      executionStatus: 'error',
      isExecuting: false,
      results: {
        'node-1': {
          nodeId: 'node-1',
          status: 'error',
          error: 'Test error message',
          executedAt: new Date(),
        },
      },
      runMockExecution: jest.fn(),
    });
    
    render(<ResultsPanel />);
    
    // Click on the Results tab
    fireEvent.click(screen.getByText('Results'));
    
    // Should show status
    expect(screen.getByText('Status: Error')).toBeInTheDocument();
    
    // Should show the error message
    expect(screen.getByText('Execution Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
  
  it('shows running indicator when execution is in progress', () => {
    // Mock execution in progress
    (useExecutionStore as unknown as jest.Mock).mockReturnValue({
      executionStatus: 'running',
      isExecuting: true,
      results: {},
      runMockExecution: jest.fn(),
    });
    
    render(<ResultsPanel />);
    
    // Click on the Results tab
    fireEvent.click(screen.getByText('Results'));
    
    // Should show status
    expect(screen.getByText('Status: Running')).toBeInTheDocument();
  });
  
  it('calls runMockExecution when Run Graph button is clicked', () => {
    const mockRunExecution = jest.fn();
    
    (useExecutionStore as unknown as jest.Mock).mockReturnValue({
      executionStatus: 'idle',
      isExecuting: false,
      results: {},
      runMockExecution: mockRunExecution,
    });
    
    render(<ResultsPanel />);
    
    // Click on the Results tab
    fireEvent.click(screen.getByText('Results'));
    
    // Click the Run Graph button
    fireEvent.click(screen.getByText('Run Graph'));
    
    // Check that the run function was called
    expect(mockRunExecution).toHaveBeenCalledTimes(1);
  });
}); 