import React, { Component, ErrorInfo, ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2),
  backgroundColor: '#fff8f8',
  borderColor: '#f44336',
  borderWidth: 1,
  borderStyle: 'solid',
}));

const ErrorHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  color: '#d32f2f',
}));

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GraphErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by GraphErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorCard data-testid="error-boundary-fallback">
          <CardContent>
            <ErrorHeader>
              <ErrorOutlineIcon fontSize="large" />
              <Typography variant="h6">
                {componentName ? `Error in ${componentName}` : 'Something went wrong'}
              </Typography>
            </ErrorHeader>
            
            {error && (
              <Typography variant="body2" color="error" gutterBottom>
                {error.message}
              </Typography>
            )}
            
            <Box mt={2}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>
          </CardContent>
        </ErrorCard>
      );
    }

    return children;
  }
}

export default GraphErrorBoundary; 