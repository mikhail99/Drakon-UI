import { Node, Edge } from 'reactflow';
import { Port, EdgeData } from '../types/graph';
import { NodeData } from '../types/node';

export interface Position {
  x: number;
  y: number;
}

export interface ConnectionParams {
  sourceId: string;
  sourcePortId: string;
  targetId: string;
  targetPortId: string;
}

/**
 * Validates if a connection between two ports is valid
 */
export function validateConnection(
  sourceNode: Node<NodeData>,
  targetNode: Node<NodeData>,
  sourcePortId: string,
  targetPortId: string
): boolean {
  const sourcePort = sourceNode.data.outputs.find((port: Port) => port.id === sourcePortId);
  const targetPort = targetNode.data.inputs.find((port: Port) => port.id === targetPortId);

  if (!sourcePort || !targetPort) {
    return false;
  }

  if (sourceNode.id === targetNode.id) {
    return false;
  }

  return sourcePort.type === targetPort.type;
}

/**
 * Finds all nodes connected to a given node (directly or indirectly)
 */
export function findConnectedNodes(
  nodeId: string,
  edges: Edge<EdgeData>[]
): string[] {
  const connectedNodes = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (!connectedNodes.has(currentId)) {
      connectedNodes.add(currentId);
      
      // Find all edges connected to this node
      const connectedEdges = edges.filter(
        edge => edge.source === currentId || edge.target === currentId
      );
      
      // Add connected nodes to queue
      for (const edge of connectedEdges) {
        const nextNode = edge.source === currentId ? edge.target : edge.source;
        if (!connectedNodes.has(nextNode)) {
          queue.push(nextNode);
        }
      }
    }
  }
  
  return Array.from(connectedNodes);
}

/**
 * Calculates a grid-aligned position for a node
 */
export function calculateNodePosition(
  mousePosition: Position,
  gridSize: number = 20
): Position {
  if (!gridSize) return mousePosition;
  
  return {
    x: Math.round(mousePosition.x / gridSize) * gridSize,
    y: Math.round(mousePosition.y / gridSize) * gridSize
  };
} 