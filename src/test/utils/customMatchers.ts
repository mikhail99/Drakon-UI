// Custom Jest matchers for testing graph operations
import { Node, Edge } from 'reactflow';

// Define graph interface for matcher
interface Graph {
  nodes: Node[];
  edges: Edge[];
}

// Define Jest matcher context type
interface MatcherContext {
  utils: {
    printReceived: (value: any) => string;
    printExpected: (value: any) => string;
  };
  isNot: boolean;
}

// Extending Jest's expect
const customMatchers = {
  // Check if an object is a valid node
  toBeValidNode(this: MatcherContext, received: any) {
    const pass = Boolean(
      received && 
      typeof received.id === 'string' && 
      received.position && 
      typeof received.position.x === 'number' && 
      typeof received.position.y === 'number' && 
      received.data
    );
    
    return {
      pass,
      message: (): string => 
        `Expected ${this.utils.printReceived(received)} ${
          pass ? 'not to be' : 'to be'
        } a valid node with id, position, and data`,
    };
  },
  
  // Check if a graph has a connection between two nodes
  toHaveConnection(this: MatcherContext, received: Graph, sourceId: string, targetId: string) {
    const hasConnection = received.edges.some(
      edge => edge.source === sourceId && edge.target === targetId
    );
    
    return {
      pass: hasConnection,
      message: (): string => 
        `Expected graph ${
          hasConnection ? 'not to have' : 'to have'
        } a connection from ${sourceId} to ${targetId}`,
    };
  },
  
  // Check if node has specific port
  toHavePort(this: MatcherContext, received: Node, portId: string, isInput = true) {
    const portType = isInput ? 'inputs' : 'outputs';
    const ports = received.data?.[portType] || [];
    const hasPort = ports.some((port: any) => port.id === portId);
    
    return {
      pass: hasPort,
      message: (): string => 
        `Expected node ${
          hasPort ? 'not to have' : 'to have'
        } a ${isInput ? 'input' : 'output'} port with id ${portId}`,
    };
  },
  
  // Check if graph has changed after an operation
  toHaveChangedAfter(this: MatcherContext, initialGraph: Graph, callback: Function) {
    const initialNodesJson = JSON.stringify(initialGraph.nodes);
    const initialEdgesJson = JSON.stringify(initialGraph.edges);
    
    callback();
    
    const currentNodesJson = JSON.stringify(initialGraph.nodes);
    const currentEdgesJson = JSON.stringify(initialGraph.edges);
    
    const hasChanged = 
      initialNodesJson !== currentNodesJson || 
      initialEdgesJson !== currentEdgesJson;
    
    return {
      pass: hasChanged,
      message: (): string => 
        `Expected graph ${
          hasChanged ? 'not to have changed' : 'to have changed'
        } after the operation`,
    };
  },
};

export default customMatchers; 