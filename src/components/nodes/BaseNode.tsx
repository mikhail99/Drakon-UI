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
  width: 12,
  height: 12,
  background: color || theme.palette.primary.main,
  border: '2px solid white',
  borderRadius: '50%',
}));

// Colors for different port types
export const portTypeColors = {
  number: '#1976d2',
  string: '#388e3c',
  boolean: '#d32f2f',
  array: '#7b1fa2',
  object: '#ff9800',
  default: '#3f51b5'
};

// Port component that can be reused
export interface PortComponentProps {
  definition: PortDefinition;
  position: Position;
  handleType?: 'source' | 'target';
  handleColor?: string;
  index?: number;
  total?: number;
}

export const PortComponent: React.FC<PortComponentProps> = ({ 
  definition, 
  position, 
  handleType,
  handleColor,
  index = 0,
  total = 1
}) => {
  const isInput = position === Position.Left || handleType === 'target';
  const type = handleType || (isInput ? 'target' : 'source');
  
  // Calculate the position offset for handles
  // For example, with 3 ports, positions would be at 25%, 50%, and 75% height
  const offsetPercentage = total <= 1 ? 50 : (100 / (total + 1)) * (index + 1);
  
  const handleStyle = {
    top: `${offsetPercentage}%`,
    transform: 'translateY(-50%)'
  };
  
  return (
    <StyledHandle
      type={type}
      position={position}
      id={definition.id}
      style={handleStyle}
      color={handleColor || portTypeColors[definition.type] || portTypeColors.default}
    />
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
    if (!renderHandles || !data.inputs || data.inputs.length === 0) return null;
    
    return data.inputs.map((input, index) => (
      <PortComponent 
        key={`input-${input.id}`} 
        definition={input} 
        position={Position.Left}
        index={index}
        total={data.inputs.length}
      />
    ));
  };
  
  const renderOutputPorts = () => {
    if (!renderHandles || !data.outputs || data.outputs.length === 0) return null;
    
    return data.outputs.map((output, index) => (
      <PortComponent 
        key={`output-${output.id}`} 
        definition={output} 
        position={Position.Right}
        index={index}
        total={data.outputs.length}
      />
    ));
  };
  
  return (
    <NodeContainer 
      className={`base-node ${selected ? 'selected' : ''} ${className || ''}`}
      data-node-id={id}
      data-node-type={data.type}
      data-testid={`node-${id}`}
      style={{ 
        border: selected ? '2px solid #1976d2' : 'none',
        borderRadius: '4px',
      }}
    >
      {renderInputPorts()}
      {children}
      {renderOutputPorts()}
    </NodeContainer>
  );
};

export default memo(BaseNode); 