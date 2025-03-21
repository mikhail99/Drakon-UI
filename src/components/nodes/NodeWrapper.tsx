import React, { memo } from 'react';
import { Position, NodeProps } from 'reactflow';
import { styled } from '@mui/material/styles';
import { Card, CardContent, Typography, Tooltip } from '@mui/material';
import { NodeData } from '../../types/node';
import BaseNode, { PortComponent } from './BaseNode';

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

const PortLabel = styled(Typography)({
  fontSize: '0.75rem',
  marginLeft: 8,
  marginRight: 8,
});

interface NodeWrapperProps extends NodeProps<NodeData> {}

const NodeWrapper: React.FC<NodeWrapperProps> = (props) => {
  const { data } = props;
  
  // We'll handle rendering the card content here, and let BaseNode handle the ports/handles
  const renderCardContent = () => (
    <StyledCard>
      <Header>
        <NodeTitle variant="h6">{data.label}</NodeTitle>
      </Header>
      <StyledContent>
        <PortsContainer>
          {data.inputs.map((input) => (
            <Tooltip key={input.id} title={input.description || input.type} placement="right">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10 }} /> {/* Placeholder for handle */}
                <PortLabel>{input.label}</PortLabel>
              </div>
            </Tooltip>
          ))}
        </PortsContainer>
        <PortsContainer>
          {data.outputs.map((output) => (
            <Tooltip key={output.id} title={output.description || output.type} placement="left">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <PortLabel>{output.label}</PortLabel>
                <div style={{ width: 10, height: 10 }} /> {/* Placeholder for handle */}
              </div>
            </Tooltip>
          ))}
        </PortsContainer>
      </StyledContent>
    </StyledCard>
  );
  
  return (
    <BaseNode {...props} renderHandles={true}>
      {renderCardContent()}
    </BaseNode>
  );
};

export default memo(NodeWrapper); 