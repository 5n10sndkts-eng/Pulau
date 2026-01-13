# Production Supabase Setup Checklist

**Date**: January 12, 2026  
**Status**: In Progress

---

## ✅ Step-by-Step Setup

### 1. Create Project in Dashboard

- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Name: `Pulau Production`
- [ ] Database Password: ********\_\_******** (save securely!)
- [ ] Region: ********\_\_******** (Singapore or US West)
- [ ] Wait for provisioning (1-2 minutes)

### 2. Collect Connection Details

Once project is created, go to **Settings → Database**:

- [ ] **Project URL**: `https://____________.supabase.co`
- [ ] **Project Reference**: `____________` (from URL)
- [ ] **Database URL (URI)**:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@____________.supabase.co:5432/postgres
  ```
- [ ] **Anon Key** (for frontend): From Settings → API
- [ ] **Service Role Key** (for backend): From Settings → API (keep secret!)

### 3. Run Migrations

```bash
# Copy your Database URL from Supabase Dashboard
# Settings → Database → Connection String (URI)

DATABASE_URL='postgresql://postgres:YOUR-PASSWORD@xxx.supabase.co:5432/postgres' \
  ./scripts/setup-production-db.sh
```

**Expected Result**: ✅ All 17 migrations applied successfully

### 4. Verify Schema

In Supabase Dashboard → Database → Tables, check you have:

- [ ] audit_logs
- [ ] booking_modifications
- [ ] booking_reminders
- [ ] bookings
- [ ] customer_notifications
- [ ] email_logs
- [ ] experience_slots
- [ ] experiences
- [ ] payments
- [ ] profiles
- [ ] trips
- [ ] vendors

### 5. Test Connection from Local

```bash
# Create .env.production file
cat > .env.production << EOF
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF
```

### 6. Configure RLS Policies

- [ ] Go to Database → RLS Policies
- [ ] Verify policies exist for all tables
- [ ] Test unauthorized access prevention

### 7. Set Up Database Backups

- [ ] Go to Settings → Backups
- [ ] Verify automatic daily backups are enabled
- [ ] Consider setting up Point-in-Time Recovery (paid)

---

## 🔑 Production Credentials (Save Securely!)

**CRITICAL: Store these in 1Password/LastPass - NEVER commit to git**

```bash
# Supabase Production
SUPABASE_PROJECT_URL=https://____________.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:____________@____________.supabase.co:5432/postgres
```

---

## ⚠️ Security Checklist

- [ ] Database password is strong (20+ characters)
- [ ] Service role key is stored securely (NOT in frontend code)
- [ ] RLS policies are enabled on all tables
- [ ] Database is not publicly accessible (Supabase handles this)
- [ ] Connection pooling is configured (check Settings → Database)

---

## 🚨 Troubleshooting

**Migration fails?**

- Check migration file syntax
- Verify database connection string
- Look for missing dependencies (previous migrations)

**Can't connect?**

- Verify project is fully provisioned (not still setting up)
- Check firewall/network settings
- Ensure using correct connection string format

**RLS errors?**

- Verify policies were created in migrations
- Test with service role key (bypasses RLS)
- Check policy conditions match your schema

---

## ✅ Completion Criteria

- [x] Supabase CLI installed
- [ ] Production project created
- [ ] All 17 migrations run successfully
- [ ] Schema verified in dashboard
- [ ] Connection tested from local
- [ ] Credentials saved securely
- [ ] RLS policies working

**Status**: Ready for Step 2 (Stripe Setup) → YES / NO

---

**Next**: Once complete, move to production-launch-sprint.md → Day 1 Afternoon (Stripe Setup)
