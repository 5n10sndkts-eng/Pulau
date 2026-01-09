# Story 19.1: Create Destinations Data Model

Status: done

## Story

As a developer,
I want a destinations KV namespace and data model,
so that the platform can support multiple locations.

## Acceptance Criteria

1. **Given** the Spark KV store schema **When** destinations KV namespace is created **Then** KV namespace includes: id (UUID, primary key), name, slug (unique), country, currency, timezone, language_default, description, hero_image_url, is_active, created_at, updated_at
2. **And** experiences.destination_id reference ID references destinations
3. **And** seed data includes Bali as first destination
4. **And** index on slug for quick lookup

## Tasks / Subtasks

- [x] Task 1: Define Destination TypeScript type (AC: #1)
  - [x] Create `src/types/destination.ts`
  - [x] Define Destination interface with all fields
  - [x] Include field types: id (string/UUID), name (string), slug (string), country (string), currency (string), timezone (string), language_default (string), description (string), hero_image_url (string), is_active (boolean), created_at (Date), updated_at (Date)
  - [x] Export type for use across application
- [x] Task 2: Create destinations data structure (AC: #1, #4)
  - [x] Create `src/data/destinations.ts`
  - [x] Define destinations array (or useKV storage)
  - [x] Add helper functions: getDestinationBySlug(slug), getActiveDestinations()
  - [x] Ensure slug-based lookup is efficient (Map or index)
- [x] Task 3: Add Bali seed data (AC: #3)
  - [x] Create Bali destination object with all required fields
  - [x] Set: name="Bali", slug="bali", country="Indonesia"
  - [x] Set: currency="USD", timezone="Asia/Makassar", language_default="en"
  - [x] Add description and hero_image_url
  - [x] Set is_active=true
  - [x] Add to destinations array/storage
- [x] Task 4: Update Experience type to include destination (AC: #2)
  - [x] Add destination_id field to Experience type (`src/types/experience.ts`)
  - [x] Make destination_id required (all experiences must have destination)
  - [x] Update existing experience seed data to include destination_id="bali"
  - [x] Add TypeScript validation that destination_id exists
- [x] Task 5: Create destination utility functions
  - [x] Create `src/utils/destinations.ts`
  - [x] Add formatCurrency(amount, destination) for destination-specific formatting
  - [x] Add formatDateTime(date, destination) for timezone-aware formatting
  - [x] Add getDestinationCurrency(destinationId) helper
- [x] Task 6: Test data model (AC: #1-4)
  - [x] Verify all destination fields are properly typed
  - [x] Test getDestinationBySlug("bali") returns correct data
  - [x] Test getActiveDestinations() returns only active destinations
  - [x] Verify experience queries can filter by destination_id

## Dev Notes

- Use Spark useKV for persistent destination storage
- Slug field must be URL-safe (lowercase, hyphens only)
- Currency code should follow ISO 4217 (USD, IDR, etc.)
- Timezone should follow IANA timezone Spark KV store format
- Consider future migration path to actual Spark KV store when scaling

### Project Structure Notes

- Destination types live in `src/types/destination.ts`
- Seed data in `src/data/destinations.ts`
- Utility functions in `src/utils/destinations.ts`
- Foreign key relationship is logical (TypeScript types), not enforced by Spark KV store
- Experience filtering by destination should be efficient

### References

- [Source: planning-artifacts/epics/epic-19.md#Story 19.1]
- [Source: architecture/architecture.md#Data Model]
- [Source: architecture/architecture.md#State Management]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

