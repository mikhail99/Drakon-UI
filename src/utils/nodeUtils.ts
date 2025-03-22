import { Node, XYPosition } from 'reactflow';
import { NodeType, NodeData } from '../types/node';

/**
 * Creates a new node with standardized formatting and defaults
 * @param nodeType The type definition for the node
 * @param position The position to place the node
 * @param id Optional custom ID (will generate one if not provided)
 * @returns A properly formatted node ready to be added to the graph
 */
export const createNewNode = (
  nodeType: NodeType,
  position: XYPosition,
  id?: string
): Node<NodeData> => {
  // Generate a unique ID if none provided
  const nodeId = id || `${nodeType.id}-${Math.floor(Math.random() * 10000)}`;
  
  // Create the node data
  return {
    id: nodeId,
    type: 'default',
    position,
    data: {
      // Always use "AAA" as initial label for consistency
      label: "AAA",
      type: nodeType.id,
      inputs: nodeType.inputs || [],
      outputs: nodeType.outputs || [],
      config: {
        ...nodeType.defaultConfig || {},
        // Store original type info for reference
        originalType: nodeType.id,
        originalLabel: nodeType.label
      }
    }
  };
}; 