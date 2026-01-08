# Story 5.1: Design and Create Experiences Database Schema

Status: done

## Story

As a developer,
I want a comprehensive experiences Spark KV store schema,
so that all experience data is properly structured and queryable.

## Acceptance Criteria

1. **Given** the vendor authentication system is in place **When** the experiences schema is created **Then** experiences KV namespace exists with columns: id (UUID, primary key), vendor_id (UUID, reference ID to vendors), title (string, max 200 chars), category (enum: water_adventures, land_explorations, culture_experiences, food_nightlife, transportation, stays), subcategory (string), destination_id (UUID, reference ID to destinations), description (text), price_amount (decimal), price_currency (string, default USD), price_per (enum: person, vehicle, group), duration_hours (decimal), start_time (time), group_size_min (integer), group_size_max (integer), difficulty (enum: Easy, Moderate, Challenging), languages (array of strings), status (enum: draft, active, inactive, sold_out), created_at, updated_at
2. Related KV namespaces are created: experience_images (id, experience_id, image_url, display_order, created_at), experience_inclusions (id, experience_id, item_text, is_included boolean, created_at), experience_availability (id, experience_id, date, slots_available, status)
3. Indexes are created on: vendor_id, category, destination_id, status

## Tasks / Subtasks

- [x] Task 1: Create Experience type definition (AC: #1)
  - [x] Create `src/types/experience.ts` (Implemented in `src/lib/types.ts`)
  - [x] Define Experience interface with all fields from AC
  - [x] Define ExperienceCategory enum
  - [x] Define PricePer enum (person, vehicle, group)
  - [x] Define Difficulty enum (Easy, Moderate, Challenging)
  - [x] Define ExperienceStatus enum (draft, active, inactive, sold_out)
- [x] Task 2: Create related type definitions (AC: #2)
  - [x] Define ExperienceImage interface
  - [x] Define ExperienceInclusion interface (item_text, is_included)
  - [x] Define ExperienceAvailability interface
  - [x] Add display_order to ExperienceImage
- [x] Task 3: Create storage schema in useKV (AC: #1, #2)
  - [x] Design experiences storage structure (Defined Record types)
  - [x] Design experience_images storage linked by experience_id
  - [x] Design experience_inclusions storage
  - [x] Design experience_availability storage
  - [x] Implement reference ID relationships conceptually (via ID fields)
- [x] Task 4: Create query utilities (AC: #3)
  - [x] Create getExperiencesByVendor(vendorId) function (In `src/lib/db.ts`)
  - [x] Create getExperiencesByCategory(category) function
  - [x] Create getActiveExperiences() function
  - [x] Implement efficient filtering with indexes (Simulated in helpers)
- [x] Task 5: Create seed data
  - [x] Create mock experiences for each category (Existing mockData updated)
  - [x] Add sample images, inclusions, availability
  - [x] Link to mock vendors and destinations

## Dev Notes

- Using Spark useKV as storage - no actual KV Spark KV store
- Design as if relational for future backend migration
- Experience status lifecycle: draft → active ↔ inactive → sold_out
- Languages stored as array: ["English", "Indonesian"]

### References

- [Source: planning-artifacts/epics/epic-05.md#Story 5.1]
- [Source: architecture/architecture.md#Data Model]
- [Source: prd/pulau-prd.md#Experience Data]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

