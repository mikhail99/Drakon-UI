import { useCallback } from 'react';

/**
 * Standard error types used throughout the application
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Standard error structure
 */
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  originalError?: Error;
}

/**
 * Creates a standardized application error
 */
export function createError(
  type: ErrorType,
  message: string,
  details?: string,
  originalError?: Error
): AppError {
  return {
    type,
    message,
    details,
    originalError,
  };
}

/**
 * Maps a caught error to a standardized AppError
 */
export function mapError(error: unknown): AppError {
  // Handle errors that are already in our format
  if (typeof error === 'object' && error !== null && 'type' in error && 'message' in error) {
    return error as AppError;
  }

  // If it's an Error object
  if (error instanceof Error) {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return createError(
        ErrorType.NETWORK,
        'Network error occurred',
        error.message,
        error
      );
    }

    // For other known Error types, we could add more specific handlers here
    
    // Default for standard Error objects
    return createError(
      ErrorType.UNKNOWN,
      error.message || 'An unexpected error occurred',
      error.stack,
      error
    );
  }

  // If it's a string
  if (typeof error === 'string') {
    return createError(ErrorType.UNKNOWN, error);
  }

  // For anything else
  return createError(
    ErrorType.UNKNOWN,
    'An unknown error occurred',
    JSON.stringify(error)
  );
}

/**
 * Hook that provides error handling functions
 */
export function useErrorHandler() {
  const handleError = useCallback((error: unknown): AppError => {
    const appError = mapError(error);
    console.error('Application error:', appError);
    
    // Here we could also send the error to a monitoring service
    // or dispatch to a global error state if needed
    
    return appError;
  }, []);

  const handleAsync = useCallback(async <T>(
    promise: Promise<T>,
    errorMessage = 'Operation failed'
  ): Promise<T> => {
    try {
      return await promise;
    } catch (error) {
      const appError = handleError(error);
      throw createError(
        appError.type,
        errorMessage,
        appError.message,
        appError.originalError
      );
    }
  }, [handleError]);

  return {
    handleError,
    handleAsync,
  };
}

/**
 * Try-catch wrapper for functions that don't return a promise
 */
export function tryCatch<T>(fn: () => T, fallback: T, errorHandler?: (error: unknown) => void): T {
  try {
    return fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error('Error caught in tryCatch:', error);
    }
    return fallback;
  }
} 