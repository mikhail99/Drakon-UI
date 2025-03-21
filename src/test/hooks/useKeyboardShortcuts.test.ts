import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

// Mock the graph store
const mockState = {
  undo: jest.fn(),
  redo: jest.fn(),
  copy: jest.fn(),
  paste: jest.fn(),
  deselectAll: jest.fn(),
  selectNodes: jest.fn(),
  removeNode: jest.fn(),
  selectedElements: {
    nodes: ['node-1', 'node-2']
  },
  nodes: [
    { id: 'node-1', data: { label: 'Node 1' } },
    { id: 'node-2', data: { label: 'Node 2' } }
  ]
};

jest.mock('../../store/graphStore', () => ({
  useGraphStore: () => mockState
}));

describe('useKeyboardShortcuts Hook', () => {
  let documentListeners: Record<string, EventListener> = {};
  
  beforeEach(() => {
    jest.clearAllMocks();
    documentListeners = {};
    
    document.addEventListener = jest.fn((event, callback) => {
      documentListeners[event] = callback as EventListener;
    });
    
    document.removeEventListener = jest.fn((event) => {
      delete documentListeners[event];
    });
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
    
    expect(mockState.undo).not.toHaveBeenCalled();
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
    expect(mockState.undo).toHaveBeenCalled();
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
    expect(mockState.redo).toHaveBeenCalled();
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
    expect(mockState.copy).toHaveBeenCalled();
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
    expect(mockState.paste).toHaveBeenCalled();
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
    expect(mockState.removeNode).toHaveBeenCalledWith('node-1');
    expect(mockState.removeNode).toHaveBeenCalledWith('node-2');
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
    expect(mockState.selectNodes).toHaveBeenCalledWith(['node-1', 'node-2']);
  });
}); 