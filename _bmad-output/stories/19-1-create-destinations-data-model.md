# Story 19.1: Create Destinations Data Model

Status: ready-for-dev

## Story

As a developer,
I want a destinations table and data model,
so that the platform can support multiple locations.

## Acceptance Criteria

1. **Given** the database schema **When** destinations table is created **Then** table includes: id (UUID, primary key), name, slug (unique), country, currency, timezone, language_default, description, hero_image_url, is_active, created_at, updated_at
2. **And** experiences.destination_id foreign key references destinations
3. **And** seed data includes Bali as first destination
4. **And** index on slug for quick lookup

## Tasks / Subtasks

- [ ] Task 1: Define Destination TypeScript type (AC: #1)
  - [ ] Create `src/types/destination.ts`
  - [ ] Define Destination interface with all fields
  - [ ] Include field types: id (string/UUID), name (string), slug (string), country (string), currency (string), timezone (string), language_default (string), description (string), hero_image_url (string), is_active (boolean), created_at (Date), updated_at (Date)
  - [ ] Export type for use across application
- [ ] Task 2: Create destinations data structure (AC: #1, #4)
  - [ ] Create `src/data/destinations.ts`
  - [ ] Define destinations array (or useKV storage)
  - [ ] Add helper functions: getDestinationBySlug(slug), getActiveDestinations()
  - [ ] Ensure slug-based lookup is efficient (Map or index)
- [ ] Task 3: Add Bali seed data (AC: #3)
  - [ ] Create Bali destination object with all required fields
  - [ ] Set: name="Bali", slug="bali", country="Indonesia"
  - [ ] Set: currency="USD", timezone="Asia/Makassar", language_default="en"
  - [ ] Add description and hero_image_url
  - [ ] Set is_active=true
  - [ ] Add to destinations array/storage
- [ ] Task 4: Update Experience type to include destination (AC: #2)
  - [ ] Add destination_id field to Experience type (`src/types/experience.ts`)
  - [ ] Make destination_id required (all experiences must have destination)
  - [ ] Update existing experience seed data to include destination_id="bali"
  - [ ] Add TypeScript validation that destination_id exists
- [ ] Task 5: Create destination utility functions
  - [ ] Create `src/utils/destinations.ts`
  - [ ] Add formatCurrency(amount, destination) for destination-specific formatting
  - [ ] Add formatDateTime(date, destination) for timezone-aware formatting
  - [ ] Add getDestinationCurrency(destinationId) helper
- [ ] Task 6: Test data model (AC: #1-4)
  - [ ] Verify all destination fields are properly typed
  - [ ] Test getDestinationBySlug("bali") returns correct data
  - [ ] Test getActiveDestinations() returns only active destinations
  - [ ] Verify experience queries can filter by destination_id

## Dev Notes

- Use Spark useKV for persistent destination storage
- Slug field must be URL-safe (lowercase, hyphens only)
- Currency code should follow ISO 4217 (USD, IDR, etc.)
- Timezone should follow IANA timezone database format
- Consider future migration path to actual database when scaling

### Project Structure Notes

- Destination types live in `src/types/destination.ts`
- Seed data in `src/data/destinations.ts`
- Utility functions in `src/utils/destinations.ts`
- Foreign key relationship is logical (TypeScript types), not enforced by database
- Experience filtering by destination should be efficient

### References

- [Source: epics.md#Story 19.1]
- [Source: architecture/architecture.md#Data Model]
- [Source: architecture/architecture.md#State Management]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

