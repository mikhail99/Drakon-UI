import { create } from 'zustand';
import { useGraphStore } from './graphStore';

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
    const { nodes } = useGraphStore.getState();
    
    console.log('Starting mock execution with nodes:', nodes);
    
    // Start execution
    startExecution();
    
    // If there are no nodes, complete immediately 
    if (!nodes || nodes.length === 0) {
      console.log('No nodes to execute');
      completeExecution(true);
      return;
    }
    
    // For each node, generate a mock result after a random delay
    const nodePromises = nodes.map((node: any) => {
      console.log('Processing node:', node.id, 'Type:', node.data.type, 'Label:', node.data.label);
      
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
            if (node.data.type === 'io.input') {
              // For input nodes, use the default value from config or a placeholder
              mockData = node.data.config?.defaultValue || 10;
              console.log('Input node result:', mockData);
            } else if (node.data.type === 'string.concat') {
              // For concatenate nodes, combine some strings
              mockData = `Combined text: A+B`;
              console.log('Concat node result:', mockData);
            } else if (node.data.type.includes('math')) {
              mockData = Math.round(Math.random() * 100);
            } else if (node.data.type.includes('string')) {
              mockData = `Result for ${node.data.label || 'Node'}`;
            } else if (node.data.type.includes('boolean')) {
              mockData = Math.random() > 0.5;
            } else if (node.data.type.includes('output')) {
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
              console.log('Unknown node type:', node.data.type, 'Using default result');
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
      console.log('All nodes processed, completing execution');
      completeExecution(true);
    });
  },
})); 