import { FC } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, Position } from 'reactflow';
import { styled, useTheme } from '@mui/material/styles';

const StyledEdge = styled(BaseEdge)(({ theme }) => ({
  stroke: theme.palette.primary.main,
  strokeWidth: 2,
  '&.selected': {
    stroke: theme.palette.primary.dark,
    strokeWidth: 3,
  },
}));

const EdgeLabel = styled('div')(({ theme }) => ({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: theme.typography.caption.fontSize,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
}));

const LabeledEdge: FC<EdgeProps> = ({
  data,
  selected,
  style,
  markerEnd,
}) => {
  const theme = useTheme();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: 0,
    sourceY: 0,
    sourcePosition: Position.Bottom,
    targetX: 0,
    targetY: 0,
    targetPosition: Position.Top,
    curvature: 0.25,
  });

  return (
    <>
      <StyledEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? theme.palette.primary.dark : theme.palette.primary.main,
          strokeWidth: selected ? 3 : 2,
        }}
      />
      {data?.label && (
        <EdgeLabel
          style={{
            left: labelX,
            top: labelY,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {data.label}
        </EdgeLabel>
      )}
    </>
  );
};

export default LabeledEdge; 