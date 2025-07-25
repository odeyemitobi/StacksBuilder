'use client';

import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if it's a chunk load error
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      // For chunk load errors, try to recover automatically
      console.warn('ChunkLoadError detected, attempting automatic recovery...');
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return { hasError: false }; // Don't show error UI for chunk errors
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Don't log chunk load errors as they're handled automatically
    if (error.name !== 'ChunkLoadError' && !error.message.includes('Loading chunk')) {
      // You could send this to an error reporting service
      console.error('Application error:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-destructive">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <Button onClick={this.resetError} variant="outline" className="w-full">
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error) => {
    // Handle chunk load errors automatically
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.warn('ChunkLoadError detected, reloading page...');
      window.location.reload();
      return;
    }
    
    // For other errors, you might want to show a toast or handle differently
    console.error('Unhandled error:', error);
  };
}
