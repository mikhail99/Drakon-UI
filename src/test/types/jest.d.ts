import '@testing-library/jest-dom';
import { Node, Edge } from 'reactflow';

// Define graph interface for the matcher
interface Graph {
  nodes: Node[];
  edges: Edge[];
}

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Checks if the received object is a valid node with required properties
       */
      toBeValidNode(): R;
      
      /**
       * Checks if the graph has a connection between sourceId and targetId
       * @param sourceId - ID of the source node
       * @param targetId - ID of the target node
       */
      toHaveConnection(sourceId: string, targetId: string): R;
      
      /**
       * Checks if a node has a port with the specified ID
       * @param portId - ID of the port to check for
       * @param isInput - Whether the port is an input (true) or output (false)
       */
      toHavePort(portId: string, isInput?: boolean): R;
      
      /**
       * Checks if the graph changed after executing the callback
       * @param callback - Function to execute that might change the graph
       */
      toHaveChangedAfter(callback: Function): R;
    }
  }
} 