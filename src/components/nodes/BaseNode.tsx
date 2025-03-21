import React, { memo, ReactNode } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { styled } from '@mui/material/styles';
import { NodeData, PortDefinition } from '../../types/node';

// Common styled components for all node types
const NodeContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

// Handle styling
export const StyledHandle = styled(Handle)<{ color?: string }>(({ theme, color }) => ({
  width: 10,
  height: 10,
  background: color || theme.palette.primary.main,
}));

// Port styling
export const Port = styled('div')({
  position: 'relative',
  height: 20,
  display: 'flex',
  alignItems: 'center',
});

export const InputPort = styled(Port)({
  marginLeft: 12,
  justifyContent: 'flex-start',
});

export const OutputPort = styled(Port)({
  marginRight: 12,
  justifyContent: 'flex-end',
});

// Colors for different port types
export const portTypeColors = {
  number: '#1976d2',
  string: '#388e3c',
  boolean: '#d32f2f',
  array: '#7b1fa2',
  object: '#ff9800',
  default: '#ccc'
};

// Port component that can be reused
export interface PortComponentProps {
  definition: PortDefinition;
  position: Position;
  handleType?: 'source' | 'target';
  handleColor?: string;
}

export const PortComponent: React.FC<PortComponentProps> = ({ 
  definition, 
  position, 
  handleType,
  handleColor 
}) => {
  const isInput = position === Position.Left || handleType === 'target';
  const PortContainer = isInput ? InputPort : OutputPort;
  const type = handleType || (isInput ? 'target' : 'source');
  
  return (
    <PortContainer>
      <StyledHandle
        type={type}
        position={position}
        id={definition.id}
        color={handleColor || portTypeColors[definition.type] || portTypeColors.default}
      />
    </PortContainer>
  );
};

// Base props for all node types
export interface BaseNodeProps extends NodeProps<NodeData> {
  children?: ReactNode;
  className?: string;
  renderHandles?: boolean;
}

// BaseNode component
const BaseNode: React.FC<BaseNodeProps> = ({ 
  id, 
  data, 
  selected, 
  children, 
  className,
  renderHandles = true
}) => {
  // Render input/output ports if requested
  const renderInputPorts = () => {
    if (!renderHandles || !data.inputs) return null;
    
    return data.inputs.map((input) => (
      <PortComponent 
        key={`input-${input.id}`} 
        definition={input} 
        position={Position.Left} 
      />
    ));
  };
  
  const renderOutputPorts = () => {
    if (!renderHandles || !data.outputs) return null;
    
    return data.outputs.map((output) => (
      <PortComponent 
        key={`output-${output.id}`} 
        definition={output} 
        position={Position.Right} 
      />
    ));
  };
  
  return (
    <NodeContainer 
      className={`base-node ${selected ? 'selected' : ''} ${className || ''}`}
      data-node-id={id}
      data-node-type={data.type}
      data-testid={`node-${id}`}
    >
      {renderInputPorts()}
      {children}
      {renderOutputPorts()}
    </NodeContainer>
  );
};

export default memo(BaseNode); 