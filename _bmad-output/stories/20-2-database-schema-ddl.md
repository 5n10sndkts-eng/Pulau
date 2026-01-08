# Story 20.2: Database Schema DDL (Supabase)

Status: done

## Story

As a **developer integrating Supabase**,
I want **a complete database schema that matches the TypeScript types**,
so that **all application data can be persisted with full type safety**.

## Acceptance Criteria

- [x] AC1: All application entities have corresponding database tables
  - destinations, profiles, vendors, experiences, trips, bookings, etc.
- [x] AC2: Table columns match TypeScript type definitions
  - Proper data types (uuid, text, numeric, timestamptz, etc.)
  - Appropriate constraints and defaults
- [x] AC3: Foreign key relationships are properly defined
  - experiences → vendors, trip_items → trips, etc.
- [x] AC4: Row Level Security (RLS) is enabled on all tables
  - Policies defined for CRUD operations
- [x] AC5: Performance indexes are created for common queries
- [x] AC6: TypeScript database.types.ts matches the schema
- [x] AC7: Build succeeds with updated types

## Tasks

- [x] 1. Analyze existing TypeScript types (types.ts)
- [x] 2. Review existing migrations
- [x] 3. Create comprehensive migration file
- [x] 4. Update database.types.ts to match schema
- [x] 5. Verify build succeeds

## Database Tables Created/Updated

### New Tables

| Table | Description |
|-------|-------------|
| `destinations` | Multi-destination support (Bali default) |
| `experience_images` | Image gallery for experiences |
| `experience_inclusions` | What's included/not included/what to bring |
| `experience_availability` | Daily slot availability |
| `reviews` | User reviews for experiences |
| `payment_methods` | Saved payment methods (tokenized) |

### Updated Tables

| Table | Columns Added |
|-------|---------------|
| `profiles` | first_name, last_name, has_completed_onboarding, email_verified |
| `vendors` | owner_first_name, owner_last_name, phone, since_year, photo, bio, response_time, rating, review_count |
| `experiences` | destination_id, subcategory, price_per, duration_hours, start_time, group_size_*, difficulty, languages, meeting_point_*, cancellation_policy, tags, published_at |
| `trips` | name, subtotal, service_fee, total, booking_reference, booked_at, cancelled_at, cancellation_reason, share_token |
| `trip_items` | notes |

## Migration File

`supabase/migrations/20260108000005_complete_schema.sql`

## Technical Notes

### Schema Design Decisions

1. **Destinations as text ID**: Using text IDs ('bali') for readability and URL-friendliness
2. **Experience status enum**: 'draft' | 'active' | 'inactive' | 'sold_out'
3. **Inclusion types**: Separate table for flexible "included/not included/what to bring" lists
4. **Soft delete for payment methods**: Using deleted_at timestamp
5. **Share tokens**: Unique tokens for shareable trip links

### RLS Policies

- **Public read**: destinations, active experiences, reviews
- **Owner read/write**: profiles, vendors (own), trips, bookings, payment_methods
- **Vendor access**: experiences, images, inclusions, availability (own vendor_id)

### Indexes

Performance indexes on:
- experiences (vendor_id, category, status, destination_id)
- trips (user_id, status)
- trip_items (trip_id)
- reviews (experience_id)
- availability (experience_id, date)

## References

- [Source: src/lib/types.ts] - TypeScript type definitions
- [Source: src/lib/database.types.ts] - Updated Supabase types
- [Migration: supabase/migrations/20260108000005_complete_schema.sql]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. Analyzed existing TypeScript types in `src/lib/types.ts`
2. Reviewed existing 4 migrations (initial_schema, trips_schema, bookings_schema, update_profiles)
3. Created comprehensive migration `20260108000005_complete_schema.sql` with:
   - 6 new tables (destinations, experience_images, experience_inclusions, experience_availability, reviews, payment_methods)
   - Column expansions for profiles, vendors, experiences, trips, trip_items
   - Full RLS policies for all tables
   - Performance indexes
   - Updated_at trigger function
4. Updated `src/lib/database.types.ts` with complete type definitions matching all tables
5. Build verified successful

### Change Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `supabase/migrations/20260108000005_complete_schema.sql` | Created | Complete schema migration |
| `src/lib/database.types.ts` | Modified | Updated with all table types |

### File List

**Files created:**
- `supabase/migrations/20260108000005_complete_schema.sql`

**Files modified:**
- `src/lib/database.types.ts`

### Next Steps

To apply this migration to your Supabase project:

1. **Via Supabase Dashboard** (recommended for development):
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `20260108000005_complete_schema.sql`
   - Run the SQL

2. **Via Supabase CLI** (for production):
   ```bash
   npx supabase link --project-ref hqskkayirgnxznkvckxi
   npx supabase db push
   ```
