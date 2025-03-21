import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import useGraphStore from '../../store/graphStore';

// Mock the graphStore
const mockUndo = jest.fn();
const mockRedo = jest.fn();
const mockCopy = jest.fn();
const mockPaste = jest.fn();
const mockDeselectAll = jest.fn();
const mockSelectNodes = jest.fn();
const mockRemoveNode = jest.fn();

const mockState = {
  undo: mockUndo,
  redo: mockRedo,
  copy: mockCopy,
  paste: mockPaste,
  deselectAll: mockDeselectAll,
  selectNodes: mockSelectNodes,
  removeNode: mockRemoveNode,
  selectedElements: {
    nodes: ['node-1', 'node-2']
  },
  nodes: [
    { id: 'node-1', data: { label: 'Node 1' } },
    { id: 'node-2', data: { label: 'Node 2' } }
  ]
};

jest.mock('../../store/graphStore', () => ({
  __esModule: true,
  default: () => mockState,
}));

// Mock for the static method
(useGraphStore as any).getState = jest.fn(() => mockState);

describe('useKeyboardShortcuts Hook', () => {
  let documentListeners: Record<string, EventListener> = {};
  
  // Mock document event listeners
  beforeEach(() => {
    documentListeners = {};
    
    document.addEventListener = jest.fn((event, callback) => {
      documentListeners[event] = callback as EventListener;
    });
    
    document.removeEventListener = jest.fn((event, callback) => {
      delete documentListeners[event];
    });
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  it('registers event listeners on mount', () => {
    renderHook(() => useKeyboardShortcuts());
    
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  it('removes event listeners on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();
    
    expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  it('ignores events from input elements', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const mockEvent = {
      key: 'z',
      ctrlKey: true,
      preventDefault: jest.fn(),
      target: document.createElement('input')
    } as unknown as KeyboardEvent;
    
    documentListeners.keydown(mockEvent);
    
    expect(mockUndo).not.toHaveBeenCalled();
  });
  
  it('handles Ctrl+Z for undo', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const mockEvent = {
      key: 'z',
      ctrlKey: true,
      preventDefault: jest.fn(),
      target: document.body
    } as unknown as KeyboardEvent;
    
    documentListeners.keydown(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockUndo).toHaveBeenCalled();
  });
  
  it('handles Ctrl+Y for redo', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const mockEvent = {
      key: 'y',
      ctrlKey: true,
      preventDefault: jest.fn(),
      target: document.body
    } as unknown as KeyboardEvent;
    
    documentListeners.keydown(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockRedo).toHaveBeenCalled();
  });
  
  it('handles Ctrl+C for copy', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const mockEvent = {
      key: 'c',
      ctrlKey: true,
      preventDefault: jest.fn(),
      target: document.body
    } as unknown as KeyboardEvent;
    
    documentListeners.keydown(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockCopy).toHaveBeenCalled();
  });
  
  it('handles Ctrl+V for paste', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const mockEvent = {
      key: 'v',
      ctrlKey: true,
      preventDefault: jest.fn(),
      target: document.body
    } as unknown as KeyboardEvent;
    
    documentListeners.keydown(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockPaste).toHaveBeenCalled();
  });
  
  it('handles Delete for removing selected nodes', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const mockEvent = {
      key: 'Delete',
      ctrlKey: false,
      preventDefault: jest.fn(),
      target: document.body
    } as unknown as KeyboardEvent;
    
    documentListeners.keydown(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockRemoveNode).toHaveBeenCalledWith('node-1');
    expect(mockRemoveNode).toHaveBeenCalledWith('node-2');
  });
  
  it('handles Ctrl+A for selecting all nodes', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const mockEvent = {
      key: 'a',
      ctrlKey: true,
      preventDefault: jest.fn(),
      target: document.body
    } as unknown as KeyboardEvent;
    
    documentListeners.keydown(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockSelectNodes).toHaveBeenCalledWith(['node-1', 'node-2']);
  });
}); 