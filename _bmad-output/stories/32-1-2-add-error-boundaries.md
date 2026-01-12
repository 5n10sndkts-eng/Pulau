# Story 32.1.2: Add Error Boundaries to Critical Components

Status: not-started
Epic: 32 - Monitoring & Observability
Phase: Launch Readiness Sprint - Phase 3
Priority: P0

## Story

As a **user**,
I want graceful error handling throughout the app,
So that a single component error doesn't crash the entire application.

## Acceptance Criteria

1. **Given** an error occurs in a component
   **When** caught by error boundary
   **Then** it:
     - Shows fallback UI
     - Reports to Sentry
     - Allows app to continue functioning
     - Provides recovery action

2. **Given** critical sections of the app
   **When** wrapping with error boundaries
   **Then** coverage includes:
     - Root app level
     - Route level
     - Checkout flow
     - Vendor dashboard
     - Data fetching components

3. **Given** error boundary catches error
   **When** user sees fallback UI
   **Then** it displays:
     - Clear error message
     - Recovery options (reload, go home)
     - Contact support link
     - Error ID for reference

## Tasks / Subtasks

- [ ] Task 1: Create base error boundary component
- [ ] Task 2: Wrap app root with Sentry error boundary
- [ ] Task 3: Add route-level error boundaries
- [ ] Task 4: Protect checkout flow
- [ ] Task 5: Create fallback UI components
- [ ] Task 6: Test error boundary recovery

## Dev Notes

**Sentry Error Boundary:**
```tsx
// src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react'

export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error, resetError }) => (
      <div className="error-container">
        <h1>Oops! Something went wrong</h1>
        <p>{error.message}</p>
        <button onClick={resetError}>Try Again</button>
        <a href="/">Go Home</a>
      </div>
    ),
    showDialog: false,
  }
)
```

**Usage:**
```tsx
// src/App.tsx
<ErrorBoundary>
  <Routes>
    <Route path="/checkout" element={
      <ErrorBoundary fallback={<CheckoutError />}>
        <CheckoutFlow />
      </ErrorBoundary>
    } />
  </Routes>
</ErrorBoundary>
```

## Success Metrics

- All critical flows protected
- Errors caught and reported
- User can recover without full page reload
- < 0.1% of users see error boundaries

## Related Files

- `src/components/ErrorBoundary.tsx` (create)
- `src/components/CheckoutErrorFallback.tsx` (create)
- `src/App.tsx` (update)
