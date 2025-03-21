import { useCallback } from 'react';
import { Node, Edge, OnSelectionChangeParams } from 'reactflow';
import { useGraphStore } from '../../store/graphStore';
import { NodeData } from '../../types/node';
import { EdgeData } from '../../types/graph';

/**
 * useGraphSelection - Custom hook for managing graph element selection
 * Handles selection state changes and selected elements tracking
 */
function useGraphSelection() {
  const { setSelectedElements, selectedElements } = useGraphStore();
  
  // Update selected elements when selection changes
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      setSelectedElements({
        nodes: selectedNodes.map((node: Node<NodeData>) => node.id),
        edges: selectedEdges.map((edge: Edge<EdgeData>) => edge.id),
      });
    },
    [setSelectedElements]
  );
  
  // Helper function to check if a node is selected
  const isNodeSelected = useCallback(
    (nodeId: string) => {
      return selectedElements.nodes.includes(nodeId);
    },
    [selectedElements.nodes]
  );
  
  // Helper function to check if an edge is selected
  const isEdgeSelected = useCallback(
    (edgeId: string) => {
      return selectedElements.edges.includes(edgeId);
    },
    [selectedElements.edges]
  );
  
  return {
    onSelectionChange,
    isNodeSelected,
    isEdgeSelected,
    selectedNodeIds: selectedElements.nodes,
    selectedEdgeIds: selectedElements.edges,
    hasSelectedElements: selectedElements.nodes.length > 0 || selectedElements.edges.length > 0
  };
}

export default useGraphSelection; 