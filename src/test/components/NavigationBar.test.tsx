import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationBar } from '../../components/NavigationBar';
import useGraphStore from '../../store/graphStore';

// Mock window.confirm and window.prompt
global.confirm = jest.fn();
global.prompt = jest.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = jest.fn(() => 'mock-url');
URL.revokeObjectURL = jest.fn();

// Mock createElement and appendChild/removeChild for the download link
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: mockClick
    };
  } else if (tagName === 'input') {
    return {
      type: '',
      accept: '',
      click: mockClick,
      onchange: null as any
    };
  }
  return originalCreateElement(tagName);
}) as any;

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild
});

// Mock FileReader
const mockFileReader = {
  readAsText: jest.fn(),
  onload: null as any
};
global.FileReader = jest.fn(() => mockFileReader) as any;

// Mock graph store
const mockUndo = jest.fn();
const mockRedo = jest.fn();
const mockClear = jest.fn();
const mockSetState = jest.fn();

const mockState = {
  undo: mockUndo,
  redo: mockRedo,
  clear: mockClear,
  history: {
    past: ['action1', 'action2'],
    future: ['action3']
  },
  nodes: [{ id: 'node1', position: { x: 0, y: 0 }, data: {} }],
  edges: [{ id: 'edge1', source: 'node1', target: 'node2' }],
  viewport: { x: 0, y: 0, zoom: 1 }
};

jest.mock('../../store/graphStore', () => ({
  __esModule: true,
  default: () => mockState
}));

// Mock for the static method
(useGraphStore as any).getState = jest.fn(() => mockState);
(useGraphStore as any).setState = mockSetState;

describe('NavigationBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation buttons', () => {
    render(<NavigationBar />);
    
    expect(screen.getByLabelText('new')).toBeInTheDocument();
    expect(screen.getByLabelText('open')).toBeInTheDocument();
    expect(screen.getByLabelText('save')).toBeInTheDocument();
    expect(screen.getByLabelText('undo')).toBeInTheDocument();
    expect(screen.getByLabelText('redo')).toBeInTheDocument();
  });

  it('enables/disables undo button based on history', () => {
    render(<NavigationBar />);
    
    const undoButton = screen.getByLabelText('undo');
    expect(undoButton).not.toBeDisabled();

    // Change history state to simulate no past actions
    (useGraphStore as any).getState.mockReturnValueOnce({
      ...mockState,
      history: { past: [], future: ['action1'] }
    });

    render(<NavigationBar />);
    const disabledUndoButton = screen.getByLabelText('undo');
    expect(disabledUndoButton).toBeDisabled();
  });

  it('enables/disables redo button based on history', () => {
    render(<NavigationBar />);
    
    const redoButton = screen.getByLabelText('redo');
    expect(redoButton).not.toBeDisabled();

    // Change history state to simulate no future actions
    (useGraphStore as any).getState.mockReturnValueOnce({
      ...mockState,
      history: { past: ['action1'], future: [] }
    });

    render(<NavigationBar />);
    const disabledRedoButton = screen.getByLabelText('redo');
    expect(disabledRedoButton).toBeDisabled();
  });

  it('calls undo when undo button is clicked', () => {
    render(<NavigationBar />);
    
    const undoButton = screen.getByLabelText('undo');
    fireEvent.click(undoButton);
    
    expect(mockUndo).toHaveBeenCalledTimes(1);
  });

  it('calls redo when redo button is clicked', () => {
    render(<NavigationBar />);
    
    const redoButton = screen.getByLabelText('redo');
    fireEvent.click(redoButton);
    
    expect(mockRedo).toHaveBeenCalledTimes(1);
  });

  it('prompts for confirmation before creating a new graph', () => {
    render(<NavigationBar />);
    
    const newButton = screen.getByLabelText('new');
    (global.confirm as jest.Mock).mockReturnValueOnce(true);
    
    fireEvent.click(newButton);
    
    expect(global.confirm).toHaveBeenCalledWith('Create a new graph? This will clear your current work.');
    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('does not clear if user cancels new graph creation', () => {
    render(<NavigationBar />);
    
    const newButton = screen.getByLabelText('new');
    (global.confirm as jest.Mock).mockReturnValueOnce(false);
    
    fireEvent.click(newButton);
    
    expect(global.confirm).toHaveBeenCalledWith('Create a new graph? This will clear your current work.');
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('creates a file input when open button is clicked', () => {
    render(<NavigationBar />);
    
    const openButton = screen.getByLabelText('open');
    fireEvent.click(openButton);
    
    expect(document.createElement).toHaveBeenCalledWith('input');
    const inputElement = (document.createElement as jest.Mock).mock.results[0].value;
    expect(inputElement.type).toBe('file');
    expect(inputElement.accept).toBe('.json');
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('prompts for filename and saves graph when save button is clicked', () => {
    render(<NavigationBar />);
    
    (global.prompt as jest.Mock).mockReturnValueOnce('test-graph');
    
    const saveButton = screen.getByLabelText('save');
    fireEvent.click(saveButton);
    
    expect(global.prompt).toHaveBeenCalledWith('Enter a name for your graph', 'graph');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('does not save if user cancels the filename prompt', () => {
    render(<NavigationBar />);
    
    (global.prompt as jest.Mock).mockReturnValueOnce(null);
    
    const saveButton = screen.getByLabelText('save');
    fireEvent.click(saveButton);
    
    expect(global.prompt).toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(document.createElement).not.toHaveBeenCalledWith('a');
  });
}); 