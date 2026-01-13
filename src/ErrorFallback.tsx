// ================================================
// Error Fallback Component
// Story: 32.1 - Integrate Error Tracking (Sentry)
// AC #3: Error Boundary Integration
// ================================================

import { useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { captureError } from './lib/sentry';

import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) => {
  // When encountering an error in the development mode, rethrow it and don't display the boundary.
  // The parent UI will take care of showing a more helpful dialog.
  if (import.meta.env.DEV) throw error;

  // Capture error to Sentry in production (AC #3)
  useEffect(() => {
    captureError(error, {
      tags: {
        error_boundary: 'app_root',
        error_type: error.name,
      },
      extra: {
        error_message: error.message,
        stack: error.stack,
      },
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            We've been notified and are looking into the issue. Please try again
            or contact support if the problem persists.
          </AlertDescription>
        </Alert>

        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            Error Details:
          </h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>

        <Button
          onClick={resetErrorBoundary}
          className="w-full"
          variant="outline"
        >
          <RefreshCwIcon />
          Try Again
        </Button>
      </div>
    </div>
  );
};
