import React, { FC } from 'react';
import { EdgeProps, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { styled } from '@mui/material/styles';

// Styled components for the edge
const EdgePath = styled('path')({
  stroke: '#555',
  strokeWidth: 1.5,
  fill: 'none',
  '&.selected': {
    stroke: '#ff0072',
    strokeWidth: 2,
  },
});

const LabelContainer = styled('div')({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  fontSize: 11,
  pointerEvents: 'all',
  padding: '2px 4px',
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  border: '1px solid #ccc',
  userSelect: 'none',
});

const LabeledEdge: FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}) => {
  // Calculate the edge path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Default to connection type if no label is provided
  const edgeLabel = data?.label || 'connection';

  return (
    <>
      <EdgePath
        id={id}
        d={edgePath}
        markerEnd={markerEnd}
        className={selected ? 'selected' : ''}
      />
      <EdgeLabelRenderer>
        <LabelContainer
          style={{
            left: labelX,
            top: labelY,
          }}
        >
          {edgeLabel}
        </LabelContainer>
      </EdgeLabelRenderer>
    </>
  );
};

export default LabeledEdge; 