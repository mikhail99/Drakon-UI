// @ts-nocheck - React is used by JSX
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphErrorBoundary from '../../../components/error/GraphErrorBoundary';

// Test component that throws an error
const ErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="working-component">Component is working</div>;
};

describe('GraphErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <GraphErrorBoundary>
        <ErrorComponent />
      </GraphErrorBoundary>
    );
    
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
  });

  it('renders fallback UI when there is an error', () => {
    render(
      <GraphErrorBoundary>
        <ErrorComponent shouldThrow />
      </GraphErrorBoundary>
    );
    
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it('renders custom component name in the error message', () => {
    render(
      <GraphErrorBoundary componentName="TestComponent">
        <ErrorComponent shouldThrow />
      </GraphErrorBoundary>
    );
    
    expect(screen.getByText(/Error in TestComponent/i)).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;
    
    render(
      <GraphErrorBoundary fallback={customFallback}>
        <ErrorComponent shouldThrow />
      </GraphErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });

  it('resets error state when trying again', () => {
    // Mock the reset function
    const mockReset = jest.fn();
    let shouldThrow = true;
    
    // Create a component that toggles error state based on the mockReset call
    const ToggleErrorComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div data-testid="working-component">Component is working</div>;
    };
    
    render(
      <GraphErrorBoundary onReset={() => {
        mockReset();
        shouldThrow = false;
      }}>
        <ToggleErrorComponent />
      </GraphErrorBoundary>
    );
    
    // Should be in error state initially
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    
    // Click the try again button
    fireEvent.click(screen.getByText(/Try Again/i));
    
    // Check that reset was called
    expect(mockReset).toHaveBeenCalledTimes(1);
    
    // Now the component should be working
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
  });
}); 