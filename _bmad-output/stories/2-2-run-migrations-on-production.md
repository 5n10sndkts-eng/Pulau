# Task 2.2: Run All Migrations on Production Database

Status: not-started
Phase: Launch Readiness Sprint - Phase 2
Priority: P0
Type: Database Setup

## Task Description

Execute all database migrations on the production Supabase instance to create the complete schema, RLS policies, and functions.

## Acceptance Criteria

- [ ] All migrations from `supabase/migrations/` executed successfully
- [ ] Database schema matches development
- [ ] All RLS policies active
- [ ] All Edge Functions deployed
- [ ] Migration history recorded
- [ ] No migration errors

## Steps

1. **Link Project to Supabase CLI**
   ```bash
   supabase link --project-ref [PRODUCTION-PROJECT-REF]
   ```

2. **Review Migrations**
   ```bash
   # List all pending migrations
   ls -la supabase/migrations/
   
   # Verify migration count (should be 17 based on current state)
   find supabase/migrations -name "*.sql" | wc -l
   ```

3. **Run Migrations**
   ```bash
   # Push all migrations to production
   supabase db push
   
   # Verify schema
   supabase db diff
   ```

4. **Validate Schema**
   ```bash
   # Connect to production DB
   supabase db remote shell
   
   # Verify tables exist
   \dt
   
   # Check RLS policies
   SELECT tablename, policyname FROM pg_policies;
   
   # Verify functions
   \df
   ```

5. **Deploy Edge Functions**
   ```bash
   # Deploy all functions
   supabase functions deploy checkout
   supabase functions deploy stripe-webhook
   supabase functions deploy vendor-onboard
   supabase functions deploy send-email
   # ... (deploy all 11 functions)
   
   # Or deploy all at once
   supabase functions deploy --no-verify-jwt
   ```

6. **Seed Essential Data (if needed)**
   ```bash
   # Run seed file for lookup data
   supabase db remote exec --file supabase/seed.sql
   ```

## Migration Checklist

Expected migrations (from current state):
- [x] Initial schema
- [x] Auth tables
- [x] Profiles table
- [x] Experiences table
- [x] Bookings table
- [x] Payments table
- [x] Trips table
- [x] Trip items table
- [x] Experience slots table
- [x] Vendor analytics table
- [x] QR codes table
- [x] Refunds table
- [x] RLS policies for all tables
- [x] Database functions
- [x] Triggers
- [x] Indexes
- [x] Email logs table (new from Epic 30)

## Rollback Plan

If migration fails:
```bash
# Stop immediately
# Identify failed migration
supabase db remote shell
SELECT * FROM _migration_history ORDER BY executed_at DESC LIMIT 10;

# Manual rollback if needed
# Apply reverse migration or restore from backup
```

## Validation Queries

```sql
-- Count tables
SELECT count(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: ~15 tables

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
-- All should have rowsecurity = true

-- Check for orphaned data
SELECT * FROM bookings WHERE experience_id NOT IN (SELECT id FROM experiences);
-- Should return 0 rows

-- Verify indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public';
-- Should have indexes on foreign keys and frequently queried columns
```

## Related Files

- `supabase/migrations/*.sql` (all migration files)
- `supabase/seed.sql` (if exists)
- `docs/database-schema.md` (update with production URLs)

## Estimated Time

45 minutes (including validation)

## Dependencies

- Task 2.1 (Production project created)
- Supabase CLI installed locally
- All migrations tested in staging

## Success Validation

- [ ] All migrations executed without errors
- [ ] `supabase db diff` shows no differences
- [ ] Test query returns expected data structure
- [ ] RLS policies prevent unauthorized access
- [ ] Edge Functions respond to test requests

## Risk Mitigation

- **Backup**: Supabase Pro includes automatic backups
- **Test First**: Run migrations on fresh staging instance
- **Incremental**: Apply migrations in batches if > 20 migrations
- **Monitor**: Watch for long-running migrations (> 5 min)
