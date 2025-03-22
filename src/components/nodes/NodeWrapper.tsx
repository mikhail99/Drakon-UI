import React from 'react';
import { styled } from '@mui/material/styles';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box,
  Tooltip,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { NodeProps } from 'reactflow';
import { NodeData } from '../../types/node';
import BaseNode from './BaseNode';
import { useExecutionStore, NodeExecutionStatus } from '../../store/executionStore';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  minWidth: 160,
  width: '100%',
  height: '100%',
  boxShadow: theme.shadows[2],
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  }
}));

// Create a status property for the styled component
interface CardHeaderProps {
  status?: NodeExecutionStatus;
}

const StyledCardHeader = styled(CardHeader)<CardHeaderProps>(({ theme, status }) => ({
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: 
    status === 'success' ? theme.palette.success.light :
    status === 'error' ? theme.palette.error.light :
    status === 'running' ? theme.palette.info.light :
    theme.palette.background.default,
  transition: 'background-color 0.3s ease',
}));

const PortLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginBottom: 2,
}));

const NodeWrapper: React.FC<NodeProps<NodeData>> = ({ data, ...props }) => {
  const { results } = useExecutionStore();
  const nodeResult = results[props.id];
  const executionStatus = nodeResult?.status || 'idle';
  
  // Render node status icon
  const renderStatusIcon = () => {
    switch (executionStatus) {
      case 'running':
        return <CircularProgress size={16} />;
      case 'success':
        return <CheckCircleIcon fontSize="small" color="success" />;
      case 'error':
        return <ErrorIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  // Format the node title to include the label value if it exists
  const getNodeTitle = () => {
    console.log('Node data for title:', {
      id: props.id,
      label: data.label,
      configLabel: data.config?.label,
      type: data.type
    });
        
    return data.label + " ::: " + data.type;
  };

  // Render the card content (input/output ports)
  const renderCardContent = () => (
    <CardContent sx={{ p: 1, pb: '8px !important', height: 'calc(100% - 40px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
        {/* Input ports column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 1, minWidth: '35%' }}>
          {data.inputs?.map(port => (
            <Tooltip key={port.id} title={port.description || port.label} placement="left">
              <Box sx={{ mb: 1 }}>
                <PortLabel variant="caption">
                  {port.label}
                </PortLabel>
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* Output ports column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '35%' }}>
          {data.outputs?.map(port => (
            <Tooltip key={port.id} title={port.description || port.label} placement="right">
              <Box sx={{ mb: 1 }}>
                <PortLabel variant="caption">
                  {port.label}
                </PortLabel>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </CardContent>
  );

  return (
    <BaseNode
      {...props}
      data={data}
      className={`node-${executionStatus}`}
      renderHandles={true}
    >
      <StyledCard variant="outlined">
        <StyledCardHeader 
          status={executionStatus}
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
                {getNodeTitle()}
              </Typography>
              {renderStatusIcon()}
            </Box>
          }
          disableTypography
        />
        {renderCardContent()}
      </StyledCard>
    </BaseNode>
  );
};

export default NodeWrapper; 