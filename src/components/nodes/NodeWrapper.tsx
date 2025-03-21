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
  display: 'flex',
  alignItems: 'center',
}));

const NodeIcon = styled('div')({
  marginRight: 8,
  display: 'flex',
  alignItems: 'center',
});

const NodeTitle = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '0.9rem',
  flexGrow: 1,
});

const StyledContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(1, 1.5),
  '&:last-child': {
    paddingBottom: theme.spacing(1),
  },
}));

const PortRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  height: 28,
  marginBottom: 4,
});

const PortLabel = styled(Typography)({
  fontSize: '0.875rem',
  paddingLeft: 8,
  paddingRight: 8,
});

interface NodeWrapperProps extends NodeProps<NodeData> {}

const NodeWrapper: React.FC<NodeWrapperProps> = (props) => {
  const { data } = props;

  // Get an icon for the node based on its type
  const getNodeIcon = () => {
    // You could add icons here based on node type
    // For now, just return null or a placeholder
    return null;
  };
  
  // Render the card content
  const renderCardContent = () => (
    <StyledCard>
      <Header>
        <NodeIcon>{getNodeIcon()}</NodeIcon>
        <NodeTitle variant="h6">{data.label}</NodeTitle>
      </Header>
      <StyledContent>
        {/* Input ports */}
        {data.inputs?.map((input) => (
          <Tooltip key={input.id} title={input.description || input.type} placement="left">
            <PortRow>
              <PortLabel>{input.label}</PortLabel>
            </PortRow>
          </Tooltip>
        ))}
        
        {/* Output ports */}
        {data.outputs?.map((output) => (
          <Tooltip key={output.id} title={output.description || output.type} placement="right">
            <PortRow style={{ justifyContent: 'flex-end' }}>
              <PortLabel>{output.label}</PortLabel>
            </PortRow>
          </Tooltip>
        ))}
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