# Story 32.1.5: Test Error Reporting End-to-End

Status: not-started
Epic: 32 - Monitoring & Observability
Phase: Launch Readiness Sprint - Phase 3
Priority: P0

## Story

As a **QA engineer**,
I want comprehensive tests for error reporting,
So that we can verify Sentry captures all error types correctly.

## Acceptance Criteria

1. **Given** various error scenarios
   **When** triggered in production
   **Then** Sentry captures:
   - Unhandled exceptions
   - Promise rejections
   - Network errors
   - Component errors
   - Console errors

2. **Given** error is captured
   **When** viewed in Sentry
   **Then** it includes:
   - Full stack trace
   - User context
   - Breadcrumbs (user actions)
   - Device/browser info
   - Release version

## Tasks / Subtasks

- [ ] Task 1: Create error test scenarios
- [ ] Task 2: Test each error type captures correctly
- [ ] Task 3: Verify user context attachment
- [ ] Task 4: Validate breadcrumbs recorded
- [ ] Task 5: Test error grouping logic
- [ ] Task 6: Validate alert notifications

## Dev Notes

**Test Scenarios:**

```typescript
// 1. Unhandled exception
throw new Error('Test unhandled error');

// 2. Promise rejection
Promise.reject('Test rejection');

// 3. Network error
fetch('https://nonexistent.api');

// 4. Component error
const BrokenComponent = () => {
  throw new Error('Component crashed');
};

// 5. Async error
async function test() {
  throw new Error('Async error');
}
```

**Verification Checklist:**

- [ ] Error appears in Sentry within 10 seconds
- [ ] Source maps resolve correctly
- [ ] User ID attached
- [ ] Breadcrumbs show user journey
- [ ] Environment tag correct
- [ ] Release version tagged

## Success Metrics

- 100% of test errors captured
- < 10 second latency from error to Sentry
- All error metadata present
- Alerts triggered correctly

## Related Files

- `tests/sentry/error-capture.spec.ts` (create)
- `docs/sentry-testing.md` (create)
