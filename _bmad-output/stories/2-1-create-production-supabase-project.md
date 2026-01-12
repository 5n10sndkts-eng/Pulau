# Task 2.1: Create Production Supabase Project

Status: not-started
Phase: Launch Readiness Sprint - Phase 2
Priority: P0
Type: Infrastructure Setup

## Task Description

Create and configure a production Supabase project separate from development/staging to ensure production data isolation and proper resource allocation.

## Acceptance Criteria

- [ ] Production Supabase project created in Supabase dashboard
- [ ] Project organization configured (separate from dev/staging)
- [ ] Database region selected (optimize for target users)
- [ ] Project name: "pulau-production"
- [ ] Production API keys generated and stored securely
- [ ] Database password recorded in password manager

## Steps

1. **Create Project**
   - Log in to Supabase dashboard
   - Click "New Project"
   - Organization: Select or create "Pulau"
   - Name: "pulau-production"
   - Database Password: Generate strong password
   - Region: Select closest to target users (e.g., us-east-1)
   - Pricing Plan: Pro ($25/month) for production features

2. **Configure Project Settings**
   - Enable Point-in-Time Recovery (PITR)
   - Set up daily backups
   - Configure custom domain (if available)
   - Enable database logs
   - Set connection pooling mode

3. **Record Credentials**
   - Copy Project URL
   - Copy Project API keys (anon, service_role)
   - Copy Database connection string
   - Store in 1Password/secrets manager
   - Document in `.env.production.example`

4. **Configure Security**
   - Review RLS policies (will be applied via migrations)
   - Configure auth settings
   - Set JWT expiry (default 3600s)
   - Enable email confirmations

## Related Files

- `.env.production.example` (create)
- `docs/production-setup.md` (create)

## Estimated Time

30 minutes

## Dependencies

- Supabase account with Pro plan access
- Secure password manager (1Password, etc.)

## Success Validation

```bash
# Test connection
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Verify API
curl https://[PROJECT-REF].supabase.co/rest/v1/ \
  -H "apikey: [ANON-KEY]"
```
