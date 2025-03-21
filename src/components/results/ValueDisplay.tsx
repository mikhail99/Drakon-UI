import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  styled 
} from '@mui/material';

const ViewerContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const ValueContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  minWidth: '80%',
  textAlign: 'center',
  boxShadow: theme.shadows[1],
}));

interface ValueDisplayProps {
  value: string | number | boolean;
  label?: string;
  type?: 'string' | 'number' | 'boolean';
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({ 
  value, 
  label,
  type = typeof value as 'string' | 'number' | 'boolean'
}) => {
  // Format the value based on its type
  const getFormattedValue = () => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    switch (type) {
      case 'boolean':
        return value ? 'True' : 'False';
      case 'number':
        // Format number with commas for thousands
        return typeof value === 'number' 
          ? value.toLocaleString() 
          : Number(value).toLocaleString();
      default:
        return String(value);
    }
  };

  // Get color based on type
  const getValueColor = () => {
    switch (type) {
      case 'boolean':
        return value ? 'success.main' : 'error.main';
      case 'number':
        return 'primary.main';
      default:
        return 'text.primary';
    }
  };

  // Get the variant based on the value length
  const getVariant = () => {
    const stringValue = String(value);
    if (stringValue.length > 20) {
      return 'body1';
    }
    return 'h4';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}
      
      <ViewerContainer>
        <ValueContainer>
          {label && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {label}
            </Typography>
          )}
          
          <Typography 
            variant={getVariant()} 
            component="div" 
            color={getValueColor()}
            sx={{ 
              fontWeight: 'medium',
              wordBreak: 'break-word'
            }}
          >
            {getFormattedValue()}
          </Typography>
        </ValueContainer>
      </ViewerContainer>
    </Box>
  );
};

export default ValueDisplay; 