// @ts-nocheck - React is used by JSX
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessage from '../../../components/error/ErrorMessage';
import { AppError, ErrorType } from '../../../utils/errorUtils';

describe('ErrorMessage', () => {
  it('renders nothing when no error is provided', () => {
    const { container } = render(<ErrorMessage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a string error message', () => {
    render(<ErrorMessage error="Something went wrong" />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument(); // Default title
  });

  it('renders an AppError object', () => {
    const appError: AppError = {
      type: ErrorType.VALIDATION,
      message: 'Invalid input',
      details: 'Please check the form fields'
    };
    
    render(<ErrorMessage error={appError} />);
    
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
    expect(screen.getByText('Please check the form fields')).toBeInTheDocument();
  });

  it('renders with a custom title', () => {
    render(
      <ErrorMessage error="Something went wrong" title="Custom Error Title" />
    );
    
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });

  it('renders with a retry button when showRetry is true', () => {
    const mockRetry = jest.fn();
    
    render(
      <ErrorMessage 
        error="Something went wrong" 
        showRetry={true} 
        onRetry={mockRetry} 
      />
    );
    
    const retryButton = screen.getByTestId('error-retry-button');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when showRetry is false', () => {
    const mockRetry = jest.fn();
    
    render(
      <ErrorMessage 
        error="Something went wrong" 
        showRetry={false} 
        onRetry={mockRetry} 
      />
    );
    
    expect(screen.queryByTestId('error-retry-button')).not.toBeInTheDocument();
  });

  it('renders with different severity levels', () => {
    const { rerender } = render(
      <ErrorMessage 
        error="Warning message" 
        severity="warning" 
      />
    );
    
    // Check for warning severity
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardWarning');
    
    // Rerender with info severity
    rerender(
      <ErrorMessage 
        error="Info message" 
        severity="info" 
      />
    );
    
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardInfo');
  });
}); 