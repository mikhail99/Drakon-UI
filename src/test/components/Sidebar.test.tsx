import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../../components/Sidebar';
import useGraphStore from '../../store/graphStore';
import { createTestNode } from '../utils/testUtils';

// Mock the graph store
jest.mock('../../store/graphStore', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(),
    setState: jest.fn(),
  },
}));

// Mock ReactFlow's drag functionality
const mockDragEvent = {
  dataTransfer: {
    setData: jest.fn(),
  },
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock values
    (useGraphStore.getState as jest.Mock).mockReturnValue({
      addNode: jest.fn(),
      nodes: []
    });
  });

  it('renders with node categories', () => {
    render(<Sidebar />);
    
    expect(screen.getByText(/Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Process/i)).toBeInTheDocument();
    expect(screen.getByText(/Output/i)).toBeInTheDocument();
  });

  it('expands category when clicked', async () => {
    render(<Sidebar />);
    
    const inputCategory = screen.getByText(/Input/i);
    await userEvent.click(inputCategory);
    
    expect(screen.getByText(/Number Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Text Input/i)).toBeInTheDocument();
  });

  it('collapses expanded category when clicked again', async () => {
    render(<Sidebar />);
    
    const inputCategory = screen.getByText(/Input/i);
    await userEvent.click(inputCategory); // Expand
    await userEvent.click(inputCategory); // Collapse
    
    expect(screen.queryByText(/Number Input/i)).not.toBeInTheDocument();
  });

  it('sets drag data when dragging a node', () => {
    render(<Sidebar />);
    
    const inputCategory = screen.getByText(/Input/i);
    fireEvent.click(inputCategory); // Expand
    
    const numberNode = screen.getByText(/Number Input/i);
    fireEvent.dragStart(numberNode, mockDragEvent);
    
    expect(mockDragEvent.dataTransfer.setData).toHaveBeenCalledWith(
      'application/reactflow',
      expect.any(String)
    );
  });

  it('adds a node when double-clicked', async () => {
    const addNodeMock = jest.fn();
    (useGraphStore.getState as jest.Mock).mockReturnValue({
      addNode: addNodeMock,
      nodes: []
    });
    
    render(<Sidebar />);
    
    const inputCategory = screen.getByText(/Input/i);
    await userEvent.click(inputCategory); // Expand
    
    const numberNode = screen.getByText(/Number Input/i);
    await userEvent.dblClick(numberNode);
    
    expect(addNodeMock).toHaveBeenCalledTimes(1);
    expect(addNodeMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        type: 'numberInput'
      })
    }));
  });

  it('displays node descriptions on hover', async () => {
    render(<Sidebar />);
    
    const inputCategory = screen.getByText(/Input/i);
    await userEvent.click(inputCategory); // Expand
    
    const numberNode = screen.getByText(/Number Input/i);
    await userEvent.hover(numberNode);
    
    expect(await screen.findByText(/Provides a numerical input value/i)).toBeInTheDocument();
  });

  it('filters nodes based on search input', async () => {
    render(<Sidebar />);
    
    const searchInput = screen.getByPlaceholderText(/Search/i);
    await userEvent.type(searchInput, 'number');
    
    expect(screen.getByText(/Number Input/i)).toBeInTheDocument();
    expect(screen.queryByText(/Text Input/i)).not.toBeInTheDocument();
  });

  it('shows "No results" when search has no matches', async () => {
    render(<Sidebar />);
    
    const searchInput = screen.getByPlaceholderText(/Search/i);
    await userEvent.type(searchInput, 'nonexistent');
    
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    render(<Sidebar />);
    
    const searchInput = screen.getByPlaceholderText(/Search/i);
    await userEvent.type(searchInput, 'number');
    
    const clearButton = screen.getByLabelText(/clear search/i);
    await userEvent.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(screen.getByText(/Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Process/i)).toBeInTheDocument();
  });
}); 