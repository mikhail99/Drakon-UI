import { useCallback } from 'react';
import { Connection, Node, MarkerType } from 'reactflow';
import { useGraphStore } from '../../store/graphStore';
import { NodeData, PortDefinition } from '../../types/node';

/**
 * useGraphConnections - Custom hook for managing graph connections
 * Handles creating, validating, and connecting edges between nodes
 */
function useGraphConnections() {
  const { nodes, onConnect } = useGraphStore();
  
  // Connection validation function
  const isValidConnection = useCallback((connection: Connection) => {
    // Prevent connecting to the same node
    if (connection.source === connection.target) {
      return false;
    }
    
    // Prevent duplicate connections
    const { edges } = useGraphStore.getState();
    const isDuplicate = edges.some(
      edge => 
        edge.source === connection.source && 
        edge.sourceHandle === connection.sourceHandle &&
        edge.target === connection.target &&
        edge.targetHandle === connection.targetHandle
    );
    
    if (isDuplicate) {
      return false;
    }
    
    return true;
  }, []);
  
  // Handle connection creation with custom edge properties
  const handleConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        console.error('Invalid connection parameters:', params);
        return;
      }
      
      try {
        // Get source node and port details
        const sourceNode = nodes.find((n: Node<NodeData>) => n.id === params.source);
        const sourcePort = sourceNode?.data.outputs?.find((p: PortDefinition) => p.id === params.sourceHandle);
        
        // Get target node and port details
        const targetNode = nodes.find((n: Node<NodeData>) => n.id === params.target);
        const targetPort = targetNode?.data.inputs?.find((p: PortDefinition) => p.id === params.targetHandle);
        
        if (!sourceNode || !targetNode) {
          console.error('Could not find source or target node for connection:', params);
          return;
        }
        
        // Create label from port names
        const sourceName = sourcePort?.label || 'output';
        const targetName = targetPort?.label || 'input';
        const sourceType = sourcePort?.type || 'unknown';
        
        // Enhance the connection with custom data and style
        const enhancedConnection = {
          ...params,
          id: `e${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
          type: 'default', // Use our custom edge type
          animated: false, // Set to true for animated edges if needed
          markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
          data: {
            label: `${sourceName} → ${targetName}`,
            sourceType: sourceType,
            targetType: targetPort?.type,
          },
        };
        
        console.log('Creating connection:', enhancedConnection);
        onConnect(enhancedConnection);
      } catch (error) {
        console.error('Error creating connection:', error);
      }
    },
    [nodes, onConnect]
  );
  
  return {
    isValidConnection,
    handleConnect
  };
}

export default useGraphConnections; 