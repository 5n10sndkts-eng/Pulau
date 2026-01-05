# Story 17.4: Implement Error Boundaries

Status: ready-for-dev

## Story

As a user,
I want the app to recover from errors gracefully,
So that one bug doesn't crash everything.

## Acceptance Criteria

### AC1: Error Boundary Catching
**Given** an unhandled JavaScript error occurs
**When** the error boundary catches it
**Then** friendly error UI displays instead of white screen:
  - Illustration of confused character
  - "Something went wrong"
  - "Try refreshing the page" suggestion
  - "Report Problem" link
  - "Go Home" button

### AC2: Error Logging
**And** error details logged to console (dev mode)
**And** error reported to monitoring service (production)

### AC3: Error Recovery
**When** user taps "Go Home"
**Then** navigation resets to home screen
**And** error state clears

## Tasks / Subtasks

### Task 1: Create Error Boundary Component (AC: #1)
- [ ] Build React ErrorBoundary class component
- [ ] Implement componentDidCatch lifecycle method
- [ ] Store error and errorInfo in component state
- [ ] Render fallback UI when error caught
- [ ] Reset error state on navigation or manual reset

### Task 2: Design Error Fallback UI (AC: #1)
- [ ] Add confused/error illustration SVG
- [ ] Display "Something went wrong" heading
- [ ] Show user-friendly error message (not technical stack trace)
- [ ] Add "Try refreshing the page" suggestion
- [ ] Include "Go Home" button and "Report Problem" link

### Task 3: Implement Error Logging (AC: #2)
- [ ] Log error to console in development mode
- [ ] Send error to monitoring service (e.g., Sentry) in production
- [ ] Include error message, stack trace, component stack
- [ ] Add user context (userId, page, timestamp)
- [ ] Implement rate limiting to prevent log spam

### Task 4: Add Error Recovery Actions (AC: #3)
- [ ] "Go Home" button resets navigation to home screen
- [ ] Clear error boundary state on action
- [ ] Optionally provide "Try Again" button to retry component
- [ ] Test recovery flow ensures app is usable after error
- [ ] Preserve user data where possible (trip, wishlist)

### Task 5: Wrap App with Error Boundaries (AC: #1, #2, #3)
- [ ] Wrap entire app with root-level error boundary
- [ ] Add error boundaries around major features (Trip Builder, Checkout)
- [ ] Ensure nested boundaries prevent full app crash
- [ ] Test error boundaries with intentional errors
- [ ] Document error boundary placement strategy

## Dev Notes

### Error Boundary Component
File: `src/components/ErrorBoundary.tsx`
```tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Error Fallback UI
```tsx
const ErrorFallback = ({ error, onReset }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onReset();
    navigate({ type: 'home' });
  };

  const handleReportProblem = () => {
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Open email client or feedback form
    window.location.href = `mailto:support@pulau.app?subject=Error Report&body=${encodeURIComponent(JSON.stringify(errorReport, null, 2))}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        {/* Error illustration */}
        <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
          <ErrorIllustration />
        </div>

        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>

        <p className="font-body text-base text-gray-600 mb-8">
          We're sorry for the inconvenience. Try refreshing the page or returning home.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left bg-red-50 p-4 rounded text-xs">
            <summary className="cursor-pointer font-medium text-red-700">
              Error details (dev only)
            </summary>
            <pre className="mt-2 text-red-600 overflow-auto">
              {error?.message}
              {'\n\n'}
              {error?.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleGoHome} className="btn-primary">
            Go Home
          </button>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Refresh Page
          </button>
        </div>

        <button
          onClick={handleReportProblem}
          className="mt-4 text-primary hover:underline text-sm"
        >
          Report this problem
        </button>
      </div>
    </div>
  );
};
```

### Error Boundary Usage
```tsx
// Root level
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

// Feature level
function TripBuilder() {
  return (
    <ErrorBoundary fallback={<TripBuilderError />}>
      <TripBuilderContent />
    </ErrorBoundary>
  );
}
```

### Error Monitoring Integration (Sentry Example)
```typescript
import * as Sentry from "@sentry/react";

// Initialize Sentry
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

// Use Sentry's ErrorBoundary
import { ErrorBoundary } from '@sentry/react';

<ErrorBoundary fallback={ErrorFallback} showDialog>
  <App />
</ErrorBoundary>
```

### Testing Error Boundaries
```tsx
// Test component that throws error
const ErrorTest = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Test error for boundary');
  }

  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
};

// In development, add test route
<ErrorBoundary>
  <ErrorTest />
</ErrorBoundary>
```

### Error Boundary Placement Strategy
1. **Root level**: Catches all unhandled errors (whole app)
2. **Route level**: Per-page boundaries prevent full app crash
3. **Feature level**: Complex features (Checkout, Trip Builder) get own boundaries
4. **Component level**: Reusable components with error-prone logic

### Best Practices
- Don't catch errors in event handlers (use try/catch instead)
- Error boundaries only catch errors in child components
- Use separate boundaries for critical vs. non-critical features
- Always provide recovery actions (reset, go home, refresh)
- Log errors but show user-friendly messages

### Accessibility
- Error message is announced to screen readers (role="alert")
- Buttons have clear labels and keyboard accessibility
- Focus management: Auto-focus on primary action button
- Sufficient color contrast for error state

## References

- [Source: epics.md#Epic 17, Story 17.4]
- [React Docs: Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry: Error Monitoring](https://sentry.io/)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
