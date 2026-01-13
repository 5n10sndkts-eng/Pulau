# Task 2.3: Configure Production Environment Variables

Status: not-started
Phase: Launch Readiness Sprint - Phase 2
Priority: P0
Type: Configuration

## Task Description

Set up all required environment variables for production deployment across Supabase Edge Functions and frontend hosting platform.

## Acceptance Criteria

- [ ] All Supabase Edge Function secrets configured
- [ ] Frontend hosting environment variables set
- [ ] No hardcoded credentials in codebase
- [ ] All secrets stored securely
- [ ] Environment variable documentation updated
- [ ] Test deployment validates all variables accessible

## Environment Variables

### Supabase Edge Functions Secrets

```bash
# Database
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[PRODUCTION-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[PRODUCTION-SERVICE-ROLE-KEY]

# Stripe
STRIPE_SECRET_KEY=[PRODUCTION-STRIPE-SECRET-KEY]
STRIPE_PUBLISHABLE_KEY=[PRODUCTION-STRIPE-PUBLISHABLE-KEY]
STRIPE_WEBHOOK_SECRET=[PRODUCTION-WEBHOOK-SECRET]

# Email (Resend)
RESEND_API_KEY=[PRODUCTION-RESEND-KEY]
RESEND_FROM_EMAIL=bookings@pulau.app

# Application
APP_URL=https://pulau.app
NODE_ENV=production

# Sentry (from Epic 32)
SENTRY_DSN=[PRODUCTION-SENTRY-DSN]
SENTRY_AUTH_TOKEN=[SENTRY-AUTH-TOKEN]
```

### Frontend Hosting (Vercel/Netlify)

```bash
# Supabase
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[PRODUCTION-ANON-KEY]

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=[PRODUCTION-STRIPE-PUBLISHABLE-KEY]

# Application
VITE_APP_URL=https://pulau.app
VITE_API_URL=https://[PROJECT-REF].supabase.co/functions/v1

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=[GA-ID]

# Sentry
VITE_SENTRY_DSN=[PRODUCTION-SENTRY-DSN]
VITE_SENTRY_ENVIRONMENT=production
```

## Steps

### 1. Set Supabase Edge Function Secrets

```bash
# Authenticate to production project
supabase link --project-ref [PRODUCTION-PROJECT-REF]

# Set secrets one by one
supabase secrets set STRIPE_SECRET_KEY=[KEY]
supabase secrets set STRIPE_WEBHOOK_SECRET=[SECRET]
supabase secrets set RESEND_API_KEY=[KEY]
supabase secrets set APP_URL=https://pulau.app
# ... (continue for all secrets)

# Or set from file
supabase secrets set --env-file .env.production

# Verify secrets (shows names only, not values)
supabase secrets list
```

### 2. Configure Hosting Platform

**Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Set environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# ... (continue for all variables)

# Or import from file
vercel env pull .env.production.local
```

**Netlify:**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Link site
netlify link

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://[PROJECT-REF].supabase.co"
# ... (continue for all variables)

# Or import from Netlify UI
# Settings → Environment → Environment variables
```

### 3. Document Variables

Create `.env.production.example`:

```bash
# Copy template
cp .env.example .env.production.example

# Update with production placeholder values
# NEVER commit real values to git
```

### 4. Validate Configuration

```typescript
// Create validation script
// scripts/validate-env.ts
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_APP_URL',
];

requiredEnvVars.forEach((varName) => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

console.log('✅ All environment variables configured');
```

Run validation:

```bash
npm run validate:env
```

## Security Best Practices

1. **Never commit secrets to git**

   ```bash
   # Ensure .env files gitignored
   echo ".env*" >> .gitignore
   echo "!.env.example" >> .gitignore
   ```

2. **Rotate keys regularly**
   - Stripe: Quarterly
   - Supabase: On team member departure
   - Resend: Annually

3. **Use separate keys for each environment**
   - Development: Test/sandbox keys
   - Staging: Separate production-like keys
   - Production: Production keys only

4. **Limit access**
   - Use role-based access in Supabase dashboard
   - Only senior engineers access production secrets
   - Use secret rotation on Vercel/Netlify

5. **Monitor for leaks**
   - Enable secret scanning in GitHub
   - Use tools like `git-secrets`
   - Audit logs regularly

## Validation Tests

```bash
# Test Edge Function has access to secrets
curl https://[PROJECT-REF].supabase.co/functions/v1/health-check \
  -H "Authorization: Bearer [ANON-KEY]"
# Should return 200 with environment validation

# Test frontend build includes environment variables
npm run build
grep -r "VITE_SUPABASE_URL" dist/
# Should show obfuscated reference in bundled JS

# Test Stripe integration
curl https://pulau.app/api/health/stripe
# Should return Stripe connection status
```

## Troubleshooting

| Issue                             | Solution                                              |
| --------------------------------- | ----------------------------------------------------- |
| Edge Function can't access secret | Re-deploy function after setting secret               |
| Frontend build fails              | Check VITE\_ prefix on all public variables           |
| Stripe webhook fails              | Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard |
| CORS errors                       | Verify APP_URL matches deployed URL exactly           |

## Related Files

- `.env.example` (template for all environments)
- `.env.production.example` (production template)
- `scripts/validate-env.ts` (validation script)
- `docs/environment-setup.md` (documentation)

## Estimated Time

30 minutes

## Dependencies

- Task 2.1 (Production Supabase project)
- Stripe production account (Task 2.4)
- Resend account configured (Story 30.1.3)
- Hosting platform account (Task 2.5)

## Success Validation

- [ ] `supabase secrets list` shows all 8+ secrets
- [ ] Hosting platform shows all VITE\_\* variables
- [ ] Test Edge Function call succeeds
- [ ] Test frontend build succeeds
- [ ] No secrets in git history
- [ ] Documentation updated

## Post-Setup

- Add secrets to password manager
- Share production access with team lead only
- Schedule quarterly secret rotation
- Enable alerts for secret access
