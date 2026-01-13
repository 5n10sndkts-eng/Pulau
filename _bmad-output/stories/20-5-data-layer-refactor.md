# Story 20.5: Data Layer Refactor (Supabase)

Status: done

## Story

As a **developer maintaining the Pulau codebase**,
I want **data services to fully leverage expanded database schema with joins**,
so that **experiences include all related data (images, inclusions, reviews) in a single query**.

## Acceptance Criteria

- [x] AC1: dataService uses `isSupabaseConfigured()` to auto-detect mock vs real mode
- [x] AC2: Experience queries include joins for vendors, images, inclusions, reviews
- [x] AC3: `toExperience()` mapper handles all joined data correctly
- [x] AC4: vendorService maps all expanded vendor columns (phone, bio, rating, etc.)
- [x] AC5: vendorService experiences query matches dataService join pattern
- [x] AC6: VITE_USE_MOCK_DATA documented in .env.example
- [x] AC7: Build succeeds with no type errors

## Technical Implementation

### dataService.ts Changes

1. **Auto-detection of mock mode**:

```typescript
import { supabase, isSupabaseConfigured } from './supabase';

// Use mock data if Supabase not configured or explicitly enabled
const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured();
```

2. **Common select query with all joins**:

```typescript
const EXPERIENCE_SELECT = `
    *,
    vendors (id, business_name, photo, bio, since_year, rating, review_count, response_time, verified, created_at),
    experience_images (id, image_url, display_order),
    experience_inclusions (id, item_text, inclusion_type, display_order),
    reviews (id, author_name, country, rating, text, helpful_count, created_at)
`;
```

3. **Enhanced `toExperience()` mapper**:
   - Maps vendor data to `provider` object
   - Sorts images by `display_order`
   - Separates inclusions by type: `included`, `not_included`, `what_to_bring`
   - Maps reviews with author, country, rating, text, helpful count

4. **New methods added**:
   - `searchExperiences(query)` - Full-text search across title/description
   - `getExperiencesByDestination(destinationId)` - Filter by destination

### vendorService.ts Changes

1. **Same mock detection pattern**:

```typescript
const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured();
```

2. **`getVendorByUserId()` now maps all columns**:
   - `owner_first_name`, `owner_last_name`
   - `phone`, `bio`, `photo`
   - `since_year`, `rating`, `review_count`, `response_time`

3. **`getVendorExperiences()` uses full join query**:
   - Same join pattern as dataService
   - Returns complete Experience objects with all related data
   - Ordered by `created_at` descending

## Files Modified

| File                       | Changes                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/lib/dataService.ts`   | Added `isSupabaseConfigured()` import, EXPERIENCE_SELECT constant, enhanced `toExperience()`, new search methods |
| `src/lib/vendorService.ts` | Updated imports, mock detection, full column mapping, join queries                                               |

## Environment Variables

| Variable                 | Purpose              | Default                               |
| ------------------------ | -------------------- | ------------------------------------- |
| `VITE_USE_MOCK_DATA`     | Force mock data mode | `false` (uses Supabase if configured) |
| `VITE_SUPABASE_URL`      | Supabase project URL | Required for real mode                |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key    | Required for real mode                |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. Analyzed existing data services - found they already had Supabase support but used simplified queries
2. Enhanced `dataService.ts`:
   - Changed USE_MOCK_DATA to check `isSupabaseConfigured()` for auto-detection
   - Added EXPERIENCE_SELECT constant with full joins (vendors, images, inclusions, reviews)
   - Enhanced `toExperience()` to map all joined data:
     - Vendor → provider object with rating, reviewCount, responseTime, verified
     - Images sorted by display_order
     - Inclusions separated by type (included/not_included/what_to_bring)
     - Reviews mapped with all fields
   - Added `searchExperiences()` and `getExperiencesByDestination()` methods

3. Enhanced `vendorService.ts`:
   - Updated to use same mock detection pattern
   - `getVendorByUserId()` now maps all expanded columns from migration
   - `getVendorExperiences()` uses full join query matching dataService pattern

4. Verified `.env.example` already documents VITE_USE_MOCK_DATA

5. Build verified successful with no type errors

### Data Flow

```
User Request → Service Layer → USE_MOCK_DATA check
                                    ↓
                     ┌──────────────┴──────────────┐
                     ↓                             ↓
              Mock Data (localStorage)      Supabase Query
              from mockData.ts              with EXPERIENCE_SELECT
                     ↓                             ↓
                     └──────────────┬──────────────┘
                                    ↓
                            toExperience() mapper
                                    ↓
                            Experience object
                            with all related data
```

### Migration Compatibility

Data layer now fully supports schema from migration `20260108000005_complete_schema.sql`:

- Expanded vendor columns ✅
- experience_images table ✅
- experience_inclusions table ✅
- reviews table ✅
- All new experience columns (duration*hours, start_time, meeting_point*\*, tags, etc.) ✅

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-01-08
**Outcome:** APPROVED (with fixes applied)

### Issues Found & Fixed

| #   | Severity | Issue                                                               | Resolution                                                                                                            |
| --- | -------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | MEDIUM   | Code duplication - toExperience() logic duplicated in vendorService | Fixed: Exported toExperience and EXPERIENCE_SELECT from dataService, refactored vendorService to use shared functions |
| 2   | MEDIUM   | searchExperiences vulnerable to SQL injection via query param       | Fixed: Added sanitization to escape special characters (%, \_, \)                                                     |
| 3   | MEDIUM   | Mock searchExperiences can fail on undefined description            | Fixed: Added optional chaining (e.title?.toLowerCase())                                                               |
| 4   | LOW      | VendorRow type imported but unused                                  | Fixed: Removed unused import                                                                                          |
| 5   | LOW      | Console.error statements not wrapped in DEV check                   | Fixed: Added import.meta.env.DEV guards to all error logs                                                             |
| 6   | LOW      | Inconsistent error handling                                         | Noted for future improvement - not blocking                                                                           |

### Files Modified by Review

- `src/lib/dataService.ts` - Exported toExperience and EXPERIENCE_SELECT, added query sanitization, DEV guards, optional chaining
- `src/lib/vendorService.ts` - Refactored to use shared toExperience/EXPERIENCE_SELECT, removed ~90 lines of duplicate code, added DEV guards
