import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { styled } from '@mui/material/styles';
import { Card, CardContent, Typography, Tooltip } from '@mui/material';
import { NodeData, PortDefinition } from '../../types/node';

const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 150,
  maxWidth: 280,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const Header = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  paddingBottom: theme.spacing(0.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
}));

const NodeTitle = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '0.9rem',
});

const StyledContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(1),
  '&:last-child': {
    paddingBottom: theme.spacing(1),
  },
}));

const PortsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const Port = styled('div')({
  position: 'relative',
  height: 20,
  display: 'flex',
  alignItems: 'center',
});

const InputPort = styled(Port)({
  marginLeft: 12,
  justifyContent: 'flex-start',
});

const OutputPort = styled(Port)({
  marginRight: 12,
  justifyContent: 'flex-end',
});

const PortLabel = styled(Typography)({
  fontSize: '0.75rem',
  marginLeft: 8,
  marginRight: 8,
});

// Colors for different port types
const portTypeColors = {
  number: '#1976d2',
  string: '#388e3c',
  boolean: '#d32f2f',
  array: '#7b1fa2',
  object: '#ff9800',
};

interface PortComponentProps {
  definition: PortDefinition;
  position: Position;
}

const PortComponent: React.FC<PortComponentProps> = ({ definition, position }) => {
  const isInput = position === Position.Left;
  const PortContainer = isInput ? InputPort : OutputPort;
  
  return (
    <Tooltip title={definition.description || definition.type} placement={isInput ? 'right' : 'left'}>
      <PortContainer>
        <Handle
          type={isInput ? 'target' : 'source'}
          position={position}
          id={definition.id}
          style={{
            background: portTypeColors[definition.type] || '#ccc',
            width: 10,
            height: 10,
          }}
        />
        <PortLabel>{definition.label}</PortLabel>
      </PortContainer>
    </Tooltip>
  );
};

interface NodeWrapperProps extends NodeProps<NodeData> {}

const NodeWrapper: React.FC<NodeWrapperProps> = ({ data }) => {
  return (
    <StyledCard>
      <Header>
        <NodeTitle variant="h6">{data.label}</NodeTitle>
      </Header>
      <StyledContent>
        <PortsContainer>
          {data.inputs.map((input) => (
            <PortComponent key={input.id} definition={input} position={Position.Left} />
          ))}
        </PortsContainer>
        <PortsContainer>
          {data.outputs.map((output) => (
            <PortComponent key={output.id} definition={output} position={Position.Right} />
          ))}
        </PortsContainer>
      </StyledContent>
    </StyledCard>
  );
};

export default memo(NodeWrapper); 