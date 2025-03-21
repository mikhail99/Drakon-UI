import { memo } from 'react';
import { Handle, Position, Node, HandleType } from 'reactflow';
import { NodeData } from '../types/node';
import { Port } from '../types/graph';
import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface NodeWrapperProps {
  node: Node<NodeData>;
  onClick?: (node: Node<NodeData>) => void;
}

const StyledNode = styled('div')<{ hasError?: boolean }>(({ theme, hasError }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${hasError ? theme.palette.error.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  minWidth: 150,
  maxWidth: 300,
  position: 'relative',
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
  '&.has-error': {
    borderColor: theme.palette.error.main,
    backgroundColor: theme.palette.error.light,
  }
}));

const NodeLabel = styled('div')(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  textAlign: 'center',
}));

const PortContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const PortLabel = styled('div')(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

const ErrorMessage = styled('div')(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.75rem',
  marginTop: theme.spacing(1),
  textAlign: 'center',
}));

const renderPort = (port: Port, type: HandleType) => {
  const position = type === 'target' ? Position.Left : Position.Right;
  const style = type === 'target' ? { left: -8 } : { right: -8 };

  return (
    <div key={port.id} style={{ position: 'relative' }}>
      <Handle
        type={type}
        position={position}
        id={port.id}
        style={style}
        data-testid={`port-${port.id}`}
      />
      <PortLabel>{port.label}</PortLabel>
    </div>
  );
};

export const NodeWrapper = memo<NodeWrapperProps>(({ node, onClick }) => {
  const { data } = node;
  const { label, inputs = [], outputs = [], hasError, errorMessage, description } = data;

  const handleClick = () => {
    onClick?.(node);
  };

  return (
    <Tooltip title={description || ''} arrow>
      <StyledNode
        className={`node-type-${data.type} ${hasError ? 'has-error' : ''}`}
        hasError={hasError}
        onClick={handleClick}
        data-testid="node-wrapper"
      >
        <NodeLabel>{label}</NodeLabel>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <PortContainer>
            {inputs.map(port => renderPort(port, 'target'))}
          </PortContainer>
          <PortContainer>
            {outputs.map(port => renderPort(port, 'source'))}
          </PortContainer>
        </div>

        {hasError && errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
      </StyledNode>
    </Tooltip>
  );
}); 