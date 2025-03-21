import { renderHook, act } from '@testing-library/react-hooks';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useGraphStore } from '../../store/graphStore';
import useProjectFile from '../../hooks/useProjectFile';
import { useTemplateStore } from '../../store/templateStore';

// Mock all required dependencies
jest.mock('../../store/graphStore', () => ({
  useGraphStore: jest.fn()
}));

jest.mock('../../hooks/useProjectFile', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../../store/templateStore', () => ({
  useTemplateStore: jest.fn()
}));

describe('useKeyboardShortcuts', () => {
  let mockGraphStore: any;
  let mockProjectFile: any;
  let mockUseTemplateStore: any;
  let mockPreventDefault: jest.Mock;
  
  beforeEach(() => {
    // Setup default mock implementations
    mockGraphStore = {
      undo: jest.fn(),
      redo: jest.fn(),
      copy: jest.fn(),
      paste: jest.fn(),
      deselectAll: jest.fn(),
      selectNodes: jest.fn(),
      removeNode: jest.fn(),
      nodes: [],
      selectedElements: { nodes: [] }
    };
    (useGraphStore as unknown as jest.Mock).mockReturnValue(mockGraphStore);
    
    mockProjectFile = {
      hasContent: jest.fn().mockReturnValue(false),
      createNewProject: jest.fn(),
      saveProject: jest.fn()
    };
    (useProjectFile as unknown as jest.Mock).mockReturnValue(mockProjectFile);
    
    mockUseTemplateStore = {
      setActiveTemplate: jest.fn()
    };
    (useTemplateStore as unknown as jest.Mock).mockReturnValue(mockUseTemplateStore);

    mockPreventDefault = jest.fn();
    
    // Clear any previous mocks
    jest.clearAllMocks();

    // Mock document.addEventListener
    jest.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
      // Store the handler for later use
      if (event === 'keydown') {
        (document as any).keydownHandler = handler;
      }
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
    delete (document as any).keydownHandler;
  });
  
  it('should initialize with template dialog closed', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    expect(result.current.showTemplateDialog).toBe(false);
    expect(typeof result.current.setShowTemplateDialog).toBe('function');
  });
  
  it('should open template dialog when Ctrl+N is pressed and no unsaved changes', () => {
    mockProjectFile.hasContent.mockReturnValue(false);
    
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Initialize the hook to add the event listener
    act(() => {
      // Create a keyboard event
      const mockEvent = {
        key: 'n',
        ctrlKey: true,
        preventDefault: mockPreventDefault,
        stopPropagation: jest.fn()
      } as unknown as KeyboardEvent;
      
      // Trigger the event handler directly
      (document as any).keydownHandler(mockEvent);
    });
    
    // Check that template dialog is shown
    expect(result.current.showTemplateDialog).toBe(true);
    expect(mockPreventDefault).toHaveBeenCalled();
  });
  
  it('should ask for confirmation when Ctrl+N is pressed with unsaved changes', () => {
    mockProjectFile.hasContent.mockReturnValue(true);
    
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn().mockReturnValue(true);
    
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Initialize the hook to add the event listener
    act(() => {
      // Create a keyboard event
      const mockEvent = {
        key: 'n',
        ctrlKey: true,
        preventDefault: mockPreventDefault,
        stopPropagation: jest.fn()
      } as unknown as KeyboardEvent;
      
      // Trigger the event handler directly
      (document as any).keydownHandler(mockEvent);
    });
    
    // Check that confirm was called and template dialog is shown
    expect(window.confirm).toHaveBeenCalled();
    expect(result.current.showTemplateDialog).toBe(true);
    expect(mockPreventDefault).toHaveBeenCalled();
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });
  
  it('should not open template dialog when user cancels confirmation', () => {
    mockProjectFile.hasContent.mockReturnValue(true);
    
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn().mockReturnValue(false);
    
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Initialize the hook to add the event listener
    act(() => {
      // Create a keyboard event
      const mockEvent = {
        key: 'n',
        ctrlKey: true,
        preventDefault: mockPreventDefault,
        stopPropagation: jest.fn()
      } as unknown as KeyboardEvent;
      
      // Trigger the event handler directly
      (document as any).keydownHandler(mockEvent);
    });
    
    // Check that confirm was called but template dialog is not shown
    expect(window.confirm).toHaveBeenCalled();
    expect(result.current.showTemplateDialog).toBe(false);
    expect(mockPreventDefault).toHaveBeenCalled();
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });
}); 