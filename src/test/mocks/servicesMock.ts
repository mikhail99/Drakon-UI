// Mock implementation of local storage service
export const mockLocalStorageService = {
  get: jest.fn((key: string) => null),
  set: jest.fn((key: string, value: any) => {}),
  remove: jest.fn((key: string) => {}),
  clear: jest.fn(),
};

// Mock implementation of file system service
export const mockFileSystemService = {
  saveGraph: jest.fn().mockResolvedValue(true),
  loadGraph: jest.fn().mockResolvedValue({ nodes: [], edges: [] }),
  exportGraph: jest.fn().mockResolvedValue(true),
  importGraph: jest.fn().mockResolvedValue({ nodes: [], edges: [] }),
};

// Mock implementation of IPC service if applicable
export const mockIpcService = {
  send: jest.fn(),
  on: jest.fn(),
  invoke: jest.fn().mockResolvedValue({}),
  removeListener: jest.fn(),
};

// Reset all mocks - useful for beforeEach in tests
export const resetAllMocks = () => {
  Object.values(mockLocalStorageService).forEach(mock => {
    if (typeof mock === 'function' && mock.mockClear) {
      mock.mockClear();
    }
  });
  
  Object.values(mockFileSystemService).forEach(mock => {
    if (typeof mock === 'function' && mock.mockClear) {
      mock.mockClear();
    }
  });
  
  Object.values(mockIpcService).forEach(mock => {
    if (typeof mock === 'function' && mock.mockClear) {
      mock.mockClear();
    }
  });
}; 