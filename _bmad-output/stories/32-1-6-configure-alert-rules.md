# Story 32.1.6: Configure Alert Rules and Notifications

Status: not-started
Epic: 32 - Monitoring & Observability
Phase: Launch Readiness Sprint - Phase 3
Priority: P0

## Story

As a **platform operator**,
I want real-time alerts for critical errors,
So that I can respond quickly to production issues.

## Acceptance Criteria

1. **Given** alert rules configured in Sentry
   **When** errors exceed thresholds
   **Then** notifications sent via:
   - Email
   - Slack
   - SMS (for critical P0 alerts)

2. **Given** different severity levels
   **When** setting up alerts
   **Then** rules cover:
   - Error spike (> 10/min)
   - New error types
   - Payment failures
   - Database connection errors
   - High error rate (> 1%)

3. **Given** alert is triggered
   **When** notification received
   **Then** it includes:
   - Error description
   - Frequency/count
   - Link to Sentry issue
   - Affected users count
   - Suggested fix (if known)

## Tasks / Subtasks

- [ ] Task 1: Set up Slack integration
- [ ] Task 2: Configure error spike alerts
- [ ] Task 3: Create new issue alerts
- [ ] Task 4: Set up critical error alerts (payments, auth)
- [ ] Task 5: Configure performance degradation alerts
- [ ] Task 6: Test alert delivery

## Dev Notes

**Alert Rules to Create:**

1. **Error Spike**
   - Condition: > 10 errors in 1 minute
   - Action: Slack notification
   - Severity: Warning

2. **New Error Type**
   - Condition: First time seen error
   - Action: Slack + Email
   - Severity: Info

3. **Payment Failure**
   - Condition: Error tag includes "payment"
   - Action: Slack + Email + SMS
   - Severity: Critical

4. **High Error Rate**
   - Condition: Error rate > 1% of sessions
   - Action: Slack + Email
   - Severity: Critical

5. **Database Errors**
   - Condition: Error message includes "supabase" or "database"
   - Action: Slack + Email
   - Severity: High

**Slack Integration:**

1. Go to Sentry → Settings → Integrations
2. Add Slack workspace
3. Configure channel: #pulau-alerts
4. Set notification preferences

**Alert Configuration:**

```yaml
# Example alert rule (configured in Sentry UI)
name: Payment Error Spike
conditions:
  - event.type: error
  - event.tags.flow: checkout
  - event.count > 5 in 5 minutes
actions:
  - slack: #pulau-critical
  - email: team@pulau.app
  - pagerduty: escalate-to-oncall (if integrated)
```

## Success Metrics

- Alerts deliver within 1 minute of threshold
- Zero false positive alerts
- 100% of critical errors trigger alerts
- Mean time to acknowledgement < 5 minutes

## Related Files

- `docs/incident-response.md` (create)
- `docs/sentry-alerts.md` (create)

## Post-Setup

- Test each alert rule manually
- Document alert escalation process
- Set up on-call rotation
- Create runbooks for common alerts
