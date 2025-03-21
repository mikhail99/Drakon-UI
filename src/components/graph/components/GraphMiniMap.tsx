import React from 'react';
import { MiniMap } from 'reactflow';
import { NodeData } from '../../../types/node';

/**
 * GraphMiniMap - A miniature view of the graph to aid navigation
 * Shows a small overview of the graph with color-coded nodes
 */
const GraphMiniMap: React.FC = () => {
  return (
    <MiniMap 
      position="bottom-right"
      nodeStrokeColor={(n) => {
        return n.selected ? '#ff0072' : '#555';
      }}
      nodeColor={(n) => {
        const nodeData = n.data as NodeData;
        return nodeData.type.startsWith('math.') 
          ? '#00ff00' 
          : nodeData.type.startsWith('io.') 
          ? '#0041d0' 
          : '#ff0072';
      }}
      style={{ 
        height: 120,
        bottom: 70  // Position the minimap higher
      }}
    />
  );
};

export default GraphMiniMap; 