# Task 2.7: Deploy Production Build

Status: not-started
Phase: Launch Readiness Sprint - Phase 2
Priority: P0
Type: Deployment

## Task Description

Execute production deployment of the Pulau application to Vercel with full testing and validation.

## Acceptance Criteria

- [ ] Production build completes without errors
- [ ] All environment variables loaded correctly
- [ ] Deployment accessible at https://pulau.app
- [ ] All routes working correctly
- [ ] PWA installable
- [ ] Service worker registered
- [ ] Error monitoring active (Sentry)
- [ ] Deployment rollback plan ready

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No critical lint errors
- [ ] TypeScript compiles without errors
- [ ] Bundle size optimized (< 500KB gzipped)

### Configuration

- [ ] All environment variables set (Task 2.3)
- [ ] Domain configured (Task 2.6)
- [ ] SSL certificate active
- [ ] Supabase production ready (Task 2.1, 2.2)
- [ ] Stripe production keys configured (Task 2.4)

### Database

- [ ] All migrations applied
- [ ] RLS policies active
- [ ] Test data removed
- [ ] Production data seeded (if needed)

## Deployment Steps

### 1. Final Code Review

```bash
# Ensure on latest main branch
git checkout main
git pull origin main

# Verify clean working directory
git status
# Should show: "nothing to commit, working tree clean"

# Run full test suite
npm run test
npm run test:e2e
npm run lint

# Check for any TODOs or console.logs
grep -r "TODO" src/ | wc -l
grep -r "console.log" src/ | wc -l
```

### 2. Build Locally First

```bash
# Clean previous builds
rm -rf dist/

# Build production bundle
npm run build

# Check build output
ls -lh dist/
du -sh dist/

# Preview locally
npm run preview
# Open http://localhost:4173
# Test critical flows:
# - Search experiences
# - Book experience
# - Checkout flow
# - Vendor dashboard
```

### 3. Analyze Bundle

```bash
# Install bundle analyzer
npm i -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  react(),
  visualizer({ open: true }),
]

# Build and analyze
npm run build
# Opens bundle visualization in browser

# Check for:
# - Large dependencies that can be lazy-loaded
# - Duplicate dependencies
# - Unused code
```

### 4. Deploy to Production

```bash
# Deploy via CLI
vercel --prod

# Or push to main (auto-deploys)
git push origin main

# Monitor deployment
vercel logs --follow

# Get deployment URL
vercel ls
```

### 5. Verify Deployment

```bash
# Check deployment status
curl -I https://pulau.app
# Should return 200

# Test API connectivity
curl https://pulau.app/api/health
# Should return OK

# Verify environment variables loaded
curl https://pulau.app/api/config/check
# Should confirm VITE_* variables present
```

### 6. Run Smoke Tests

**Manual Testing:**

1. Home page loads
2. Search experiences works
3. Experience details page loads
4. Add to trip works
5. Checkout initiates
6. Payment flow works (use Stripe test mode)
7. Booking confirmation received
8. Email sent (check inbox)
9. Vendor dashboard accessible
10. PWA install prompt appears

**Automated Smoke Tests:**

```bash
# Run against production
npm run test:e2e:prod

# Or manually with Playwright
npx playwright test --headed --project=chromium \
  --grep "@smoke" \
  --base-url https://pulau.app
```

## Post-Deployment Validation

### 1. Performance Audit

```bash
# Run Lighthouse
lighthouse https://pulau.app --view

# Target scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 95
# SEO: > 90
# PWA: installable
```

### 2. Security Scan

```bash
# Check security headers
curl -I https://pulau.app | grep -E "(CSP|HSTS|X-Frame)"

# Verify SSL
https://www.ssllabs.com/ssltest/analyze.html?d=pulau.app
# Target: A+

# Check for vulnerabilities
npm audit --production
# Should show 0 critical vulnerabilities
```

### 3. Monitoring Validation

**Sentry (Epic 32):**

- Verify error tracking active
- Test error capture: trigger test error
- Check source maps uploaded

**Vercel Analytics:**

```typescript
// Verify analytics loaded
// Check Vercel dashboard for real-time traffic
```

**Supabase Logs:**

```bash
# Check Edge Function logs
supabase functions logs checkout --limit 100
supabase functions logs stripe-webhook --limit 100
```

### 4. Database Health Check

```sql
-- Run in production database
-- Verify RLS policies
SELECT tablename, policyname FROM pg_policies;

-- Check for test data
SELECT count(*) FROM bookings WHERE customer_email LIKE '%test%';
-- Should return 0

-- Verify indexes
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public';

-- Check database size
SELECT pg_database_size('postgres') / 1024 / 1024 AS size_mb;
```

## Deployment Script

Create `scripts/deploy-production.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting production deployment..."

# 1. Run tests
echo "📝 Running tests..."
npm run test
npm run lint

# 2. Build
echo "🏗️  Building..."
npm run build

# 3. Check bundle size
echo "📦 Checking bundle size..."
BUNDLE_SIZE=$(du -sk dist/ | cut -f1)
if [ $BUNDLE_SIZE -gt 1000 ]; then
  echo "⚠️  Warning: Bundle size is large: ${BUNDLE_SIZE}KB"
fi

# 4. Deploy
echo "🌐 Deploying to production..."
vercel --prod

# 5. Verify
echo "✅ Verifying deployment..."
sleep 10
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://pulau.app)
if [ $RESPONSE -eq 200 ]; then
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment verification failed: HTTP $RESPONSE"
  exit 1
fi

echo "🎉 Production deployment complete!"
```

Make executable:

```bash
chmod +x scripts/deploy-production.sh
```

## Rollback Plan

### If deployment fails or critical bugs discovered:

**1. Instant Rollback (Vercel)**

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [DEPLOYMENT-URL]

# Or via dashboard:
# Deployments → Click previous → "Promote to Production"
```

**2. Emergency Maintenance Mode**

Create `public/maintenance.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Pulau - Maintenance</title>
    <meta http-equiv="refresh" content="60" />
  </head>
  <body>
    <h1>We'll be back soon!</h1>
    <p>Pulau is currently undergoing maintenance.</p>
  </body>
</html>
```

Redirect all traffic:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/maintenance.html"
    }
  ]
}
```

**3. Database Rollback**

```bash
# If migrations caused issues
# Restore from backup
supabase db remote exec --file backups/pre-deployment-backup.sql
```

## Monitoring First 24 Hours

### Metrics to Watch

**1. Error Rate**

- Target: < 0.1% of requests
- Monitor: Sentry dashboard
- Alert: Spike > 1%

**2. Response Time**

- Target: P95 < 2 seconds
- Monitor: Vercel Analytics
- Alert: P95 > 5 seconds

**3. Availability**

- Target: 99.9% uptime
- Monitor: UptimeRobot
- Alert: Any downtime

**4. Database Performance**

- Target: Query time < 100ms
- Monitor: Supabase dashboard
- Alert: Slow queries > 1 second

### Incident Response

If critical issue detected:

1. **Assess severity**
   - P0: Site down, payments failing → Rollback immediately
   - P1: Feature broken → Fix within 1 hour
   - P2: Minor issue → Fix in next deployment

2. **Communicate**
   - Post status update (if status page exists)
   - Notify team in Slack
   - Email affected customers (if applicable)

3. **Fix or Rollback**
   - If fix takes > 15 minutes → Rollback
   - Deploy fix as hotfix
   - Document incident

## Success Validation Checklist

- [ ] https://pulau.app loads in < 2 seconds
- [ ] All 462 tests passing in production
- [ ] Lighthouse scores > 90 across categories
- [ ] No console errors in browser
- [ ] Test booking completes successfully
- [ ] Email confirmation received
- [ ] PWA install works on mobile
- [ ] Sentry capturing errors
- [ ] Analytics tracking pageviews
- [ ] Database queries performant (< 100ms)
- [ ] SSL A+ rating
- [ ] No security vulnerabilities
- [ ] Zero downtime during deployment

## Related Files

- `scripts/deploy-production.sh` (create)
- `public/maintenance.html` (create)
- `docs/deployment-runbook.md` (create)
- `docs/rollback-procedure.md` (create)

## Estimated Time

1-2 hours (deployment + validation)

## Dependencies

- All previous Phase 2 tasks complete
- Tests passing
- Staging deployment successful

## Post-Deployment

- [ ] Monitor error rates for 24 hours
- [ ] Review performance metrics
- [ ] Gather user feedback
- [ ] Plan first hotfix if needed
- [ ] Update status page (launch announcement)
- [ ] Celebrate! 🎉
