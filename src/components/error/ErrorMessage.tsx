import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AppError } from '../../utils/errorUtils';

const ErrorContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1, 0),
}));

interface ErrorMessageProps {
  error?: AppError | string | null;
  title?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title = 'Error',
  onRetry,
  showRetry = false,
  severity = 'error',
}) => {
  if (!error) return null;

  const message = typeof error === 'string' 
    ? error 
    : error.message || 'An unexpected error occurred';
  
  const details = typeof error !== 'string' && error.details 
    ? error.details 
    : undefined;

  return (
    <ErrorContainer data-testid="error-message">
      <Alert 
        severity={severity}
        action={
          showRetry && onRetry ? (
            <Button 
              color="inherit" 
              size="small" 
              onClick={onRetry}
              data-testid="error-retry-button"
            >
              Retry
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
        {details && (
          <Box mt={1} fontSize="0.85em" color="text.secondary">
            {details}
          </Box>
        )}
      </Alert>
    </ErrorContainer>
  );
};

export default ErrorMessage; 