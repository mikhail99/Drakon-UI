import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { useGraphStore } from '../../store/graphStore';
import { useNodeOrganizationStore } from '../../store/nodeOrganizationStore';
import { NodeType } from '../../types/node';
import { createNewNode } from '../../utils/nodeUtils';

// Interface for the drag data
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
  const { addNodeToFolder } = useNodeOrganizationStore();
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
          
          // Use the centralized node creation function
          const newNode = createNewNode(nodeType, position);
          console.log('Adding node from drag:', newNode);
          
          addNode(newNode);
          
          // Add the node to the default folder
          addNodeToFolder(newNode.id, 'default');
          
        } catch (parseError) {
          console.error('Failed to parse drag data:', parseError, jsonData);
        }
      } catch (error) {
        console.error('Error during node drop:', error);
      }
    },
    [addNode, addNodeToFolder, reactFlowInstance]
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