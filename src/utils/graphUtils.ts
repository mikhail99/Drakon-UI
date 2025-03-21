import { Node, Edge } from 'reactflow';
import { NodeData, Port, EdgeData } from '../types/graph';

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
  const sourcePort = sourceNode.data.outputs.find(port => port.id === sourcePortId);
  const targetPort = targetNode.data.inputs.find(port => port.id === targetPortId);

  if (!sourcePort || !targetPort) {
    return false;
  }

  if (sourceNode.id === targetNode.id) {
    return false;
  }

  return sourcePort.type === targetPort.type || sourcePort.type === 'any' || targetPort.type === 'any';
}

/**
 * Finds all nodes connected to a given node (directly or indirectly)
 */
export function findConnectedNodes(
  nodeId: string,
  nodes: Node<NodeData>[],
  edges: Edge<EdgeData>[]
): string[] {
  const connectedNodes = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const connectedEdges = edges.filter(
      edge => edge.source === currentId || edge.target === currentId
    );

    for (const edge of connectedEdges) {
      const nextId = edge.source === currentId ? edge.target : edge.source;
      if (!connectedNodes.has(nextId)) {
        connectedNodes.add(nextId);
        queue.push(nextId);
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
  return {
    x: Math.round(mousePosition.x / gridSize) * gridSize,
    y: Math.round(mousePosition.y / gridSize) * gridSize
  };
} 