import { useCallback } from 'react';
import { useReactFlow, Node } from 'reactflow';
import { useGraphStore } from '../../store/graphStore';
import { NodeType, NodeData } from '../../types/node';

// Generate a unique node ID
const getId = (): string => `node_${Math.random().toString(36).substr(2, 9)}`;

interface DragItem {
  type: string;
  nodeType: NodeType;
}

/**
 * useGraphDragAndDrop - Custom hook for handling drag and drop operations on the graph
 * Manages dropping nodes onto the graph and preventing default behaviors
 */
function useGraphDragAndDrop() {
  const { addNode } = useGraphStore();
  const reactFlowInstance = useReactFlow();
  
  // Handle drop event from palette
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      
      try {
        // Get drop position relative to the ReactFlow canvas
        const bounds = event.currentTarget.getBoundingClientRect();
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        // Get the dragged node type data
        const jsonData = event.dataTransfer.getData('application/drakon-node');
        
        if (!jsonData) {
          console.warn('No drag data found');
          return;
        }
        
        try {
          const dragData = JSON.parse(jsonData);
          console.log('Drag data:', dragData);
          
          if (!dragData.nodeType) {
            console.warn('Invalid drag data structure:', dragData);
            return;
          }
          
          const nodeType = dragData.nodeType;
          
          // Create a new node
          const newNode = {
            id: getId(),
            type: 'default',
            position,
            data: {
              label: nodeType.label || 'New Node',
              type: nodeType.id || 'default',
              inputs: Array.isArray(nodeType.inputs) ? nodeType.inputs : [],
              outputs: Array.isArray(nodeType.outputs) ? nodeType.outputs : [],
              config: { ...(nodeType.defaultConfig || {}) },
            },
          };
          
          console.log('Adding node:', newNode);
          addNode(newNode);
          
        } catch (parseError) {
          console.error('Failed to parse drag data:', parseError, jsonData);
        }
      } catch (error) {
        console.error('Error during node drop:', error);
      }
    },
    [addNode, reactFlowInstance]
  );

  // Simple function to enable drop by preventing default behavior
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  return {
    onDrop,
    onDragOver
  };
}

export default useGraphDragAndDrop; 