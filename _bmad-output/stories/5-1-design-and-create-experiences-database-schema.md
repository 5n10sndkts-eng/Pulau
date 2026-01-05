# Story 5.1: Design and Create Experiences Database Schema

Status: ready-for-dev

## Story

As a developer,
I want a comprehensive experiences database schema,
so that all experience data is properly structured and queryable.

## Acceptance Criteria

1. **Given** the vendor authentication system is in place **When** the experiences schema is created **Then** experiences table exists with columns: id (UUID, primary key), vendor_id (UUID, foreign key to vendors), title (string, max 200 chars), category (enum: water_adventures, land_explorations, culture_experiences, food_nightlife, transportation, stays), subcategory (string), destination_id (UUID, foreign key to destinations), description (text), price_amount (decimal), price_currency (string, default USD), price_per (enum: person, vehicle, group), duration_hours (decimal), start_time (time), group_size_min (integer), group_size_max (integer), difficulty (enum: Easy, Moderate, Challenging), languages (array of strings), status (enum: draft, active, inactive, sold_out), created_at, updated_at
2. Related tables are created: experience_images (id, experience_id, image_url, display_order, created_at), experience_inclusions (id, experience_id, item_text, is_included boolean, created_at), experience_availability (id, experience_id, date, slots_available, status)
3. Indexes are created on: vendor_id, category, destination_id, status

## Tasks / Subtasks

- [ ] Task 1: Create Experience type definition (AC: #1)
  - [ ] Create `src/types/experience.ts`
  - [ ] Define Experience interface with all fields from AC
  - [ ] Define ExperienceCategory enum
  - [ ] Define PricePer enum (person, vehicle, group)
  - [ ] Define Difficulty enum (Easy, Moderate, Challenging)
  - [ ] Define ExperienceStatus enum (draft, active, inactive, sold_out)
- [ ] Task 2: Create related type definitions (AC: #2)
  - [ ] Define ExperienceImage interface
  - [ ] Define ExperienceInclusion interface (item_text, is_included)
  - [ ] Define ExperienceAvailability interface
  - [ ] Add display_order to ExperienceImage
- [ ] Task 3: Create storage schema in useKV (AC: #1, #2)
  - [ ] Design experiences storage structure
  - [ ] Design experience_images storage linked by experience_id
  - [ ] Design experience_inclusions storage
  - [ ] Design experience_availability storage
  - [ ] Implement foreign key relationships conceptually
- [ ] Task 4: Create query utilities (AC: #3)
  - [ ] Create getExperiencesByVendor(vendorId) function
  - [ ] Create getExperiencesByCategory(category) function
  - [ ] Create getExperiencesByDestination(destinationId) function
  - [ ] Create getActiveExperiences() function
  - [ ] Implement efficient filtering with indexes
- [ ] Task 5: Create seed data
  - [ ] Create mock experiences for each category
  - [ ] Add sample images, inclusions, availability
  - [ ] Link to mock vendors and destinations

## Dev Notes

- Using Spark useKV as storage - no actual SQL database
- Design as if relational for future backend migration
- Experience status lifecycle: draft → active ↔ inactive → sold_out
- Languages stored as array: ["English", "Indonesian"]

### References

- [Source: epics.md#Story 5.1]
- [Source: architecture/architecture.md#Data Model]
- [Source: prd/pulau-prd.md#Experience Data]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

