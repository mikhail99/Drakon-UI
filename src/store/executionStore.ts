import { create } from 'zustand';

// Types for execution status and results
export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface NodeExecutionResult {
  nodeId: string;
  status: NodeExecutionStatus;
  data?: unknown;
  error?: string;
  executedAt?: Date;
}

export interface ExecutionStore {
  // State
  executionStatus: 'idle' | 'running' | 'completed' | 'error';
  results: Record<string, NodeExecutionResult>;
  isExecuting: boolean;
  
  // Actions
  startExecution: () => void;
  completeExecution: (success: boolean) => void;
  updateNodeResult: (nodeId: string, result: Partial<NodeExecutionResult>) => void;
  resetExecution: () => void;
  
  // Mock execution (to be replaced with real execution later)
  runMockExecution: () => void;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  // Initial state
  executionStatus: 'idle',
  results: {},
  isExecuting: false,
  
  // Actions
  startExecution: () => {
    set({
      executionStatus: 'running',
      isExecuting: true,
    });
  },
  
  completeExecution: (success: boolean) => {
    set({
      executionStatus: success ? 'completed' : 'error',
      isExecuting: false,
    });
  },
  
  updateNodeResult: (nodeId: string, result: Partial<NodeExecutionResult>) => {
    set(state => ({
      results: {
        ...state.results,
        [nodeId]: {
          ...state.results[nodeId],
          nodeId,
          ...result,
          executedAt: result.executedAt || new Date(),
        },
      },
    }));
  },
  
  resetExecution: () => {
    set({
      executionStatus: 'idle',
      results: {},
      isExecuting: false,
    });
  },
  
  // Mock execution for testing
  runMockExecution: () => {
    const { startExecution, updateNodeResult, completeExecution } = get();
    const { nodes } = require('../store/graphStore').useGraphStore.getState();
    
    // Start execution
    startExecution();
    
    // For each node, generate a mock result after a random delay
    const nodePromises = nodes.map((node: any) => {
      return new Promise<void>(resolve => {
        const delay = 500 + Math.random() * 1500; // Random delay between 0.5-2s
        
        // Set node to running state
        updateNodeResult(node.id, {
          status: 'running',
        });
        
        setTimeout(() => {
          // Generate mock result based on node type
          const success = Math.random() > 0.1; // 90% success rate
          
          if (success) {
            let mockData: unknown;
            
            // Generate different mock data based on node type
            if (node.data.type.includes('math')) {
              mockData = Math.round(Math.random() * 100);
            } else if (node.data.type.includes('string')) {
              mockData = `Result for ${node.data.label || 'Node'}`;
            } else if (node.data.type.includes('boolean')) {
              mockData = Math.random() > 0.5;
            } else if (node.data.type.includes('Output')) {
              // For output nodes, create a more complex result
              mockData = {
                value: Math.round(Math.random() * 1000) / 10,
                timestamp: new Date().toISOString(),
                metadata: {
                  unit: 'units',
                  precision: 2,
                  source: `${node.data.label || 'Node'}`
                }
              };
            } else {
              // Default case - generate an object with random properties
              mockData = {
                id: node.id,
                timestamp: new Date().toISOString(),
                value: Math.round(Math.random() * 100) / 10,
                processed: true
              };
            }
            
            updateNodeResult(node.id, {
              status: 'success',
              data: mockData,
            });
          } else {
            // In case of error
            updateNodeResult(node.id, {
              status: 'error',
              error: `Error processing ${node.data.label || 'node'}: Invalid operation`,
            });
          }
          
          resolve();
        }, delay);
      });
    });
    
    // When all nodes are processed, complete the execution
    Promise.all(nodePromises).then(() => {
      completeExecution(true);
    });
  },
})); 