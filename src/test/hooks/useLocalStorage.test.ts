import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Create a shared store variable that can be accessed by our mock
let store: Record<string, string> = {};

// Mock localStorage
const localStorageMock = (() => {
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock for storage events
const addEventListenerMock = jest.fn();
const removeEventListenerMock = jest.fn();
window.addEventListener = addEventListenerMock;
window.removeEventListener = removeEventListenerMock;

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('returns initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
    
    expect(result.current[0]).toBe('default-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('returns parsed value from localStorage if it exists', () => {
    const testObject = { name: 'Test', value: 42 };
    localStorageMock.setItem('test-key', JSON.stringify(testObject));
    
    const { result } = renderHook(() => useLocalStorage('test-key', {}));
    
    expect(result.current[0]).toEqual(testObject);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      const setValue = result.current[1];
      setValue('updated-value');
    });
    
    expect(result.current[0]).toBe('updated-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('updated-value'));
  });

  it('handles function updates correctly', () => {
    const initialValue = { count: 0 };
    const { result } = renderHook(() => useLocalStorage<{ count: number }>('test-key', initialValue));
    
    act(() => {
      const setValue = result.current[1];
      setValue(prev => ({ count: prev.count + 1 }));
    });
    
    expect(result.current[0]).toEqual({ count: 1 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify({ count: 1 }));
  });

  it('handles parsing errors by returning the initial value', () => {
    // Set invalid JSON in localStorage
    localStorageMock.setItem('test-key', 'not-valid-json');
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    
    expect(result.current[0]).toBe('default');
    // We're not checking for console.error because the hook uses console.warn
  });

  it('stores null values correctly', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('test-key', 'initial'));
    
    // First check the initial value is set
    expect(result.current[0]).toBe('initial');
    
    // Set to null 
    act(() => {
      result.current[1](null as any);
    });
    
    // Value should be null
    expect(result.current[0]).toBe(null);
    
    // localStorage should have "null" string stored
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(null));
  });

  it('reads values from localStorage', () => {
    // Set a value in localStorage
    store['shared-key'] = JSON.stringify('stored-value');
    
    // Hook should read this value instead of using initial value
    const { result } = renderHook(() => useLocalStorage('shared-key', 'initial-value'));
    
    // Should get the stored value
    expect(result.current[0]).toBe('stored-value');
  });
}); 