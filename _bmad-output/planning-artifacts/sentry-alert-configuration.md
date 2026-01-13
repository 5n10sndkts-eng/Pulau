# Sentry Alert Rules Configuration Guide

**Story:** 32.1.6 - Configure Alert Rules  
**Epic:** 32 - Monitoring & Observability  
**Priority:** P0

---

## Overview

This guide covers configuring Sentry alert rules for the Pulau production environment to ensure the team is notified of critical errors and performance degradations.

## Alert Philosophy

**Goal:** Be alerted to actionable issues without alert fatigue.

**Principles:**

1. **Critical alerts** → Immediate notification (PagerDuty/SMS)
2. **Warning alerts** → Slack notification within 15 minutes
3. **Info alerts** → Daily digest email
4. **Noise reduction** → Group similar errors, ignore non-actionable issues

---

## 1. Error Rate Alerts

### High Error Rate (Critical)

**Trigger When:**

- Error rate exceeds 1% of sessions
- OR more than 100 errors in 5 minutes

**Actions:**

- Send to: PagerDuty (on-call engineer)
- Slack: #pulau-alerts (critical)
- Email: engineering@pulau.app

**Configuration in Sentry:**

```
Alert Name: High Error Rate - Immediate Action Required
Metric: Error count
Condition: errors > 100 in 5 minutes
         OR error_rate > 1% in 5 minutes
Environment: production
```

### New Error Introduced (Warning)

**Trigger When:**

- New error type not seen before appears
- Affects > 10 users

**Actions:**

- Slack: #pulau-errors
- Email: engineering@pulau.app

**Configuration:**

```
Alert Name: New Error Type Detected
Metric: New issue
Condition: first_seen AND user_count > 10
Environment: production
```

### Error Spike (Warning)

**Trigger When:**

- Error count increases by 100% compared to previous hour
- Minimum 50 errors to avoid noise

**Actions:**

- Slack: #pulau-errors
- Email: engineering@pulau.app

**Configuration:**

```
Alert Name: Error Spike Detected
Metric: Error count
Condition: percent_change > 100% (comparison period: 1 hour)
         AND errors > 50
Environment: production
```

---

## 2. Performance Degradation Alerts

### Slow Page Load (Warning)

**Trigger When:**

- 75th percentile page load time > 3 seconds
- For 10+ minutes

**Actions:**

- Slack: #pulau-performance
- Email: engineering@pulau.app

**Configuration:**

```
Alert Name: Slow Page Load Times
Metric: Page load (LCP)
Condition: p75(lcp) > 3000ms for 10 minutes
Environment: production
```

### Slow API Response (Critical)

**Trigger When:**

- 95th percentile API response time > 5 seconds
- Affects critical endpoints (checkout, bookings)

**Actions:**

- PagerDuty
- Slack: #pulau-alerts (critical)

**Configuration:**

```
Alert Name: Critical API Slow Response
Metric: Transaction duration
Condition: p95(duration) > 5000ms for 5 minutes
         AND transaction_name IN ['checkout', 'create_booking']
Environment: production
```

### High Checkout Drop-off (Critical)

**Trigger When:**

- Checkout completion rate drops below 70%
- OR checkout errors spike

**Actions:**

- PagerDuty
- Slack: #pulau-revenue (critical revenue impact)

**Configuration:**

```
Alert Name: Checkout Drop-off Alert
Metric: Custom metric (checkout_completion_rate)
Condition: checkout_completion_rate < 0.70 for 15 minutes
Environment: production
```

---

## 3. User Experience Alerts

### High Bounce Rate (Warning)

**Trigger When:**

- Users encounter error within 10 seconds of landing
- Affects > 5% of new sessions

**Actions:**

- Slack: #pulau-product
- Email: product@pulau.app

**Configuration:**

```
Alert Name: High New User Error Rate
Metric: Error count
Condition: error_count > 0 AND session_duration < 10s
         AND affected_users > 5% of new_users
Environment: production
```

### Failed Payment Processing (Critical)

**Trigger When:**

- Payment errors exceed 2% of attempts
- Any Stripe integration errors

**Actions:**

- PagerDuty (immediate)
- Slack: #pulau-revenue
- Email: finance@pulau.app

**Configuration:**

```
Alert Name: Payment Processing Failure
Metric: Error count
Condition: error_message CONTAINS 'stripe' OR 'payment'
         AND error_rate > 0.02 (2%)
Environment: production
```

---

## 4. Infrastructure Alerts

### Third-Party Service Outage

**Trigger When:**

- Supabase API errors spike
- Stripe API errors spike
- Resend email delivery failures spike

**Actions:**

- Slack: #pulau-infrastructure
- Email: engineering@pulau.app

**Configuration:**

```
Alert Name: Third-Party Service Degradation
Metric: Error count
Condition: error_message CONTAINS 'supabase' OR 'stripe' OR 'resend'
         AND error_count > 20 in 5 minutes
Environment: production
```

### Browser Compatibility Issue

**Trigger When:**

- Specific browser/version has > 10x error rate vs others
- Affects > 50 users

**Actions:**

- Slack: #pulau-engineering
- Create GitHub issue automatically

**Configuration:**

```
Alert Name: Browser-Specific Error Spike
Metric: Error count by browser
Condition: error_rate_for_browser > 10x avg_error_rate
         AND affected_users > 50
Environment: production
```

---

## 5. Security Alerts

### Unusual Error Pattern (Warning)

**Trigger When:**

- 403/401 errors spike (potential security scan)
- CORS errors spike (potential attack)

**Actions:**

- Slack: #pulau-security
- Email: security@pulau.app

**Configuration:**

```
Alert Name: Potential Security Issue
Metric: Error count
Condition: error_status IN [401, 403]
         AND error_count > 100 in 5 minutes
Environment: production
```

---

## 6. Alert Rules Setup in Sentry

### Step-by-Step Configuration

1. **Navigate to Alerts**
   - Go to https://sentry.io/organizations/pulau/alerts/
   - Click "Create Alert"

2. **Select Alert Type**
   - Choose "Issues" for error alerts
   - Choose "Metrics" for performance alerts

3. **Configure Conditions**
   - Set metric and threshold
   - Define time window
   - Add environment filter (production only)

4. **Set Actions**
   - Add integrations (Slack, PagerDuty, Email)
   - Configure notification frequency
   - Set owner/team

5. **Test Alert**
   - Use "Send Test Notification"
   - Verify delivery to all channels

### Recommended Alert Categories

| Alert Name      | Type        | Severity | Channel           | Response Time |
| --------------- | ----------- | -------- | ----------------- | ------------- |
| High Error Rate | Error       | Critical | PagerDuty + Slack | < 5 min       |
| Payment Failure | Error       | Critical | PagerDuty + Slack | < 5 min       |
| Slow Checkout   | Performance | Critical | PagerDuty + Slack | < 15 min      |
| New Error Type  | Error       | Warning  | Slack             | < 1 hour      |
| Slow Page Load  | Performance | Warning  | Slack             | < 2 hours     |
| API Degradation | Performance | Warning  | Slack             | < 1 hour      |
| Browser Issue   | Error       | Info     | Slack             | Next day      |
| Security Alert  | Security    | Warning  | Slack + Email     | < 30 min      |

---

## 7. Integration Setup

### Slack Integration

1. **Add Sentry App to Slack**
   - Go to Slack workspace settings
   - Add Sentry app
   - Authorize Sentry to post

2. **Configure Channels**
   - #pulau-alerts (critical)
   - #pulau-errors (warnings)
   - #pulau-performance (performance issues)
   - #pulau-security (security alerts)

3. **Set Notification Format**
   - Include: Error message, count, link to Sentry
   - Group: Similar errors in thread
   - Mute: Errors below threshold

### PagerDuty Integration

1. **Create Service in PagerDuty**
   - Service name: "Pulau Production Errors"
   - Escalation policy: On-call engineer → Engineering manager

2. **Get Integration Key**
   - Copy PagerDuty integration key

3. **Add to Sentry**
   - Settings → Integrations → PagerDuty
   - Paste integration key
   - Test connection

### Email Notifications

Configure email lists:

- `engineering@pulau.app` - All engineering alerts
- `on-call@pulau.app` - Critical alerts only
- `product@pulau.app` - User experience issues

---

## 8. Alert Tuning & Maintenance

### Weekly Review (Every Monday)

1. **Check Alert Volume**
   - Goal: < 10 alerts/week (excluding info)
   - If > 20 alerts/week → increase thresholds

2. **Review False Positives**
   - Alerts that don't require action
   - Update ignoreErrors config
   - Adjust thresholds

3. **Check Response Times**
   - Critical alerts acknowledged < 5 min
   - Warnings resolved < 1 day

### Monthly Optimization

1. **Analyze Alert Patterns**
   - Most common alerts
   - Alerts with highest false positive rate
   - Alerts that led to actual fixes

2. **Update Thresholds**
   - Increase for noisy alerts
   - Decrease for critical but missed issues

3. **Add New Alerts**
   - Based on production incidents
   - Based on new features launched

---

## 9. Alert Response Runbook

### Critical Alert Response

1. **Acknowledge** (< 2 min)
   - Click acknowledge in PagerDuty
   - Post "Investigating" in Slack

2. **Triage** (< 5 min)
   - Check Sentry for error details
   - Check affected users count
   - Check if still ongoing

3. **Mitigate** (< 15 min)
   - If critical revenue impact → rollback
   - If user-blocking → disable feature flag
   - If infrastructure → contact provider

4. **Resolve** (< 2 hours)
   - Deploy fix
   - Verify error rate returns to normal
   - Update Sentry issue as resolved

5. **Post-Mortem** (< 24 hours)
   - Document incident
   - Identify root cause
   - Create prevention tasks

### Warning Alert Response

1. **Review** (< 1 hour)
   - Check Sentry issue details
   - Assess user impact
   - Determine if needs immediate fix

2. **Prioritize** (< 2 hours)
   - Create GitHub issue
   - Add to sprint backlog
   - Assign owner

3. **Track** (ongoing)
   - Monitor if issue worsens
   - Update team on progress

---

## 10. Testing Alert Configuration

### Manual Alert Testing

```bash
# Trigger test error in production (use staging first!)
# DO NOT RUN IN PRODUCTION without approval

# 1. Test error capture
curl -X POST https://pulau.app/api/test/trigger-error \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d '{"error_type": "test"}'

# 2. Verify alert sent to Slack
# Check #pulau-errors channel

# 3. Verify PagerDuty notification
# Check on-call engineer receives page

# 4. Acknowledge and resolve
# Mark issue as resolved in Sentry
```

### Automated Alert Testing

Create scheduled job to test alert pipeline:

- Weekly test of critical alert path
- Verify Slack, PagerDuty, Email delivery
- Document test results

---

## 11. Sentry Quotas & Budget

### Free Tier Limits

- 5,000 errors/month
- 10,000 performance events/month
- 1 project

### Monitoring Usage

Check monthly usage:

1. Sentry → Settings → Subscription
2. Review current usage vs quota
3. If > 80% → upgrade plan or reduce sampling

### Sampling Configuration

Adjust in `src/lib/sentry.ts`:

```typescript
// Reduce sampling if hitting quota
tracesSampleRate: 0.05, // 5% (from 10%)
replaysSessionSampleRate: 0.05, // 5% (from 10%)
```

---

## 12. Compliance & Data Retention

### Data Retention

- Free tier: 30 days
- Team plan: 90 days
- Business plan: Unlimited

### PII Protection

Configured in `sentry.ts`:

- Email addresses scrubbed
- User IDs anonymized
- Passwords filtered
- Payment data excluded

### GDPR Compliance

- Right to deletion: Use Sentry's data scrubbing
- Data export: Available via Sentry API
- Consent: Covered by privacy policy

---

## Production Deployment Checklist

Before enabling alerts in production:

- [ ] All alert rules configured in Sentry
- [ ] Slack channels created and Sentry added
- [ ] PagerDuty integration tested
- [ ] Email distribution lists configured
- [ ] On-call rotation schedule set
- [ ] Response runbook documented and shared
- [ ] Team trained on alert response
- [ ] Test alerts sent and verified
- [ ] Alert thresholds reviewed with team
- [ ] Escalation paths defined

---

**Last Updated:** January 12, 2026  
**Owner:** DevOps Team  
**Review Frequency:** Monthly
