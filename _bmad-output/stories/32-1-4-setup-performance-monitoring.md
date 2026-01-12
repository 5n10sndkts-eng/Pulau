# Story 32.1.4: Set Up Performance Monitoring

Status: not-started
Epic: 32 - Monitoring & Observability
Phase: Launch Readiness Sprint - Phase 3
Priority: P1

## Story

As a **platform operator**,
I want performance metrics tracked in Sentry,
So that I can identify and fix slow operations.

## Acceptance Criteria

1. **Given** Sentry performance monitoring enabled
   **When** users interact with the app
   **Then** it tracks:
     - Page load times
     - API request duration
     - Database query times
     - User interaction latency

2. **Given** custom transactions defined
   **When** critical flows execute
   **Then** performance data captured for:
     - Checkout flow
     - Search/filter operations
     - Booking creation
     - Dashboard loading

## Tasks / Subtasks

- [ ] Task 1: Enable BrowserTracing integration
- [ ] Task 2: Set appropriate sample rates
- [ ] Task 3: Instrument critical transactions
- [ ] Task 4: Track Web Vitals
- [ ] Task 5: Set up performance alerts

## Dev Notes

**Performance Configuration:**
```typescript
Sentry.init({
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: ['pulau.app', /^\//],
    }),
  ],
  tracesSampleRate: 0.1, // 10% of traffic
})
```

**Custom Transactions:**
```typescript
const transaction = Sentry.startTransaction({
  name: 'Checkout Flow',
  op: 'user-interaction',
})

const span = transaction.startChild({
  op: 'stripe-payment',
  description: 'Process Stripe checkout',
})

await processPayment()
span.finish()
transaction.finish()
```

## Success Metrics

- P95 page load < 2 seconds
- P95 API calls < 500ms
- 10% sample rate captures enough data
- Performance regressions detected early

## Related Files

- `src/main.tsx` (update)
- `src/lib/performance.ts` (create)
