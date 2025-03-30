import React from 'react';
import { DatabaseError } from '../lib/supabaseTypes';

export type ErrorType = 'auth' | 'network' | 'database' | 'validation' | 'api' | 'unknown';

export interface ApiError extends Error {
  code: string;
  details?: string;
  hint?: string;
}

export interface ErrorDetails {
  type: ErrorType;
  code?: string;
  message: string;
  details?: unknown;
  retry?: () => Promise<void>;
}

class ErrorService {
  private errorHandlers: ((error: ErrorDetails) => void)[] = [];

  // Register an error handler
  registerHandler(handler: (error: ErrorDetails) => void): void {
    this.errorHandlers.push(handler);
  }

  // Remove an error handler
  unregisterHandler(handler: (error: ErrorDetails) => void): void {
    this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
  }

  // Handle any error and categorize it
  handleError(error: unknown, retry?: () => Promise<void>): ErrorDetails {
    let errorDetails: ErrorDetails;

    if (error instanceof Error) {
      if (this.isApiError(error)) {
        // API or Database error
        errorDetails = this.handleApiError(error, retry);
      } else if (error.name === 'ValidationError') {
        // Validation error
        errorDetails = {
          type: 'validation',
          message: error.message,
          details: error,
          retry,
        };
      } else if (error.name === 'AuthError') {
        // Authentication error
        errorDetails = {
          type: 'auth',
          message: 'Authentication failed. Please sign in again.',
          details: error,
          retry,
        };
      } else if (error.name === 'NetworkError') {
        // Network error
        errorDetails = {
          type: 'network',
          message: 'Network connection error. Please check your connection.',
          details: error,
          retry,
        };
      } else {
        // Unknown error
        errorDetails = {
          type: 'unknown',
          message: error.message || 'An unexpected error occurred',
          details: error,
          retry,
        };
      }
    } else {
      // Non-Error object
      errorDetails = {
        type: 'unknown',
        message: 'An unexpected error occurred',
        details: error,
        retry,
      };
    }

    // Notify all error handlers
    this.notifyHandlers(errorDetails);
    return errorDetails;
  }

  // Type guard for API errors
  private isApiError(error: Error): error is ApiError {
    return 'code' in error && typeof (error as ApiError).code === 'string';
  }

  // Handle database and API errors
  private handleApiError(error: ApiError, retry?: () => Promise<void>): ErrorDetails {
    const type: ErrorType = error.code.startsWith('23') ? 'database' : 'api';
    let message = 'An error occurred while processing your request';

    // Map common error codes to user-friendly messages
    switch (error.code) {
      case '23505':
        message = 'This item already exists';
        break;
      case '23503':
        message = 'This operation would violate data relationships';
        break;
      case '42P01':
        message = 'The requested resource was not found';
        break;
      case '42501':
        message = 'You do not have permission to perform this action';
        break;
      default:
        if (error.message) {
          message = error.message;
        }
    }

    return {
      type,
      code: error.code,
      message,
      details: error,
      retry,
    };
  }

  // Notify all registered error handlers
  private notifyHandlers(error: ErrorDetails): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    });
  }

  // Format error message for display
  formatErrorMessage(error: ErrorDetails): string {
    const baseMessage = error.message;
    const suffix = error.retry ? ' Click to try again.' : '';
    return baseMessage + suffix;
  }

  // Get appropriate action based on error type
  getErrorAction(error: ErrorDetails): string {
    switch (error.type) {
      case 'auth':
        return 'Sign In';
      case 'network':
        return 'Retry';
      case 'validation':
        return 'Fix Input';
      default:
        return error.retry ? 'Retry' : 'Dismiss';
    }
  }
}

// Create singleton instance
export const errorService = new ErrorService();

// React hook for registering error handlers
export function useErrorHandler(handler: (error: ErrorDetails) => void): void {
  React.useEffect(() => {
    errorService.registerHandler(handler);
    return () => errorService.unregisterHandler(handler);
  }, [handler]);
}
