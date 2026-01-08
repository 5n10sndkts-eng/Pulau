# Story 20.4: RLS Policies & Security (Supabase)

Status: done

## Story

As a **security-conscious developer**,
I want **comprehensive Row Level Security (RLS) policies on all database tables**,
so that **users can only access data they're authorized to see and modify**.

## Acceptance Criteria

- [x] AC1: All tables have RLS enabled
- [x] AC2: Public data is readable by everyone (destinations, active experiences, reviews)
- [x] AC3: Private data requires authentication (trips, bookings, payment methods)
- [x] AC4: Owner-only data enforces user_id matching (profiles, trips, payment methods)
- [x] AC5: Vendor data is accessible only to vendor owners
- [x] AC6: Cascading access for child tables (trip_items inherit from trips)

## Security Model

### Access Control Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `destinations` | Public | Admin only | Admin only | Admin only |
| `profiles` | Public | Own (auth.uid = id) | Own | - |
| `vendors` | Public | Own (auth.uid = owner_id) | Own | - |
| `experiences` | Active=public, Draft=vendor | Vendor owns | Vendor owns | - |
| `experience_images` | Inherit from experience | Vendor owns | Vendor owns | Vendor owns |
| `experience_inclusions` | Inherit from experience | Vendor owns | Vendor owns | Vendor owns |
| `experience_availability` | Public | Vendor owns | Vendor owns | Vendor owns |
| `reviews` | Public | Authenticated (own user_id) | Own | - |
| `trips` | Own (user_id) | Own | Own | Own |
| `trip_items` | Via parent trip | Via parent trip | Via parent trip | Via parent trip |
| `bookings` | Via parent trip | Via parent trip | Via parent trip | - |
| `payment_methods` | Own + not deleted | Own | Own | - (soft delete) |

### Policy Details by Table

#### profiles
```sql
-- Anyone can view profiles (public directory)
SELECT: using ( true )

-- Users can only insert/update their own profile
INSERT: with check ( auth.uid() = id )
UPDATE: using ( auth.uid() = id )
```

#### vendors
```sql
-- Public vendor directory
SELECT: using ( true )

-- Users create/update their own vendor profile
INSERT: with check ( auth.uid() = owner_id )
UPDATE: using ( auth.uid() = owner_id )
```

#### experiences
```sql
-- Active experiences are public; vendors see their own drafts
SELECT: using ( status = 'active' OR auth.uid() in (
  select owner_id from vendors where id = vendor_id
))

-- Only vendor owners can create/update
INSERT/UPDATE: using ( auth.uid() in (
  select owner_id from vendors where id = vendor_id
))
```

#### trips & trip_items
```sql
-- Users only see their own trips
SELECT: using ( auth.uid() = user_id )

-- Full CRUD for own trips
INSERT/UPDATE/DELETE: using/with check ( auth.uid() = user_id )

-- trip_items inherit access via parent trip
SELECT/INSERT/UPDATE/DELETE: using (
  exists (select 1 from trips where id = trip_id and user_id = auth.uid())
)
```

#### payment_methods
```sql
-- Users see their own non-deleted methods
SELECT: using ( auth.uid() = user_id and deleted_at is null )

-- Users create/update their own methods
INSERT: with check ( auth.uid() = user_id )
UPDATE: using ( auth.uid() = user_id )
-- Note: Soft delete via deleted_at, no hard DELETE policy
```

### Security Features

1. **Auto-profile creation**: Trigger creates profile on auth.users insert
2. **Soft delete for payments**: deleted_at prevents accidental data loss
3. **Cascading deletes**: trip_items/bookings deleted when parent trip deleted
4. **Vendor isolation**: Experiences/images only editable by vendor owner
5. **Public availability**: Availability data public for booking calendar

## Migration Files

RLS policies are defined across these migrations:

| Migration | Tables Covered |
|-----------|----------------|
| `20260108000000_initial_schema.sql` | profiles, vendors, experiences |
| `20260108000001_trips_schema.sql` | trips, trip_items |
| `20260108000002_bookings_schema.sql` | bookings |
| `20260108000005_complete_schema.sql` | destinations, experience_images, experience_inclusions, experience_availability, reviews, payment_methods |

## References

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Migration: 20260108000000_initial_schema.sql]
- [Migration: 20260108000001_trips_schema.sql]
- [Migration: 20260108000002_bookings_schema.sql]
- [Migration: 20260108000005_complete_schema.sql]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. Reviewed all 4 migration files for RLS policy completeness
2. Verified all 12 tables have RLS enabled:
   - destinations ✅
   - profiles ✅
   - vendors ✅
   - experiences ✅
   - experience_images ✅
   - experience_inclusions ✅
   - experience_availability ✅
   - reviews ✅
   - trips ✅
   - trip_items ✅
   - bookings ✅
   - payment_methods ✅

3. Documented security model with access control matrix
4. Confirmed policies follow principle of least privilege

### Security Checklist

- [x] RLS enabled on all tables
- [x] No unrestricted INSERT/UPDATE/DELETE policies
- [x] User ownership enforced via auth.uid()
- [x] Vendor ownership uses subquery for vendor_id → owner_id mapping
- [x] Child tables inherit access from parent (trip_items → trips)
- [x] Public data explicitly marked (destinations, reviews, availability)
- [x] Soft delete for sensitive data (payment_methods)
- [x] Auto-profile creation trigger uses SECURITY DEFINER

### No Code Changes Required

RLS policies were already comprehensively defined in the migration files. This story was primarily documentation and verification.
