# Story 19.4: Prepare Experience Schema for Multi-Destination

Status: ready-for-dev

## Story

As a vendor,
I want my experiences linked to a specific destination,
so that travelers in that location can find them.

## Acceptance Criteria

1. **Given** a vendor creates an experience **When** the creation form loads **Then** destination is pre-selected based on vendor's location or selecKV namespace **And** experience record includes destination_id
2. **And** experience only appears in bobjectse/search when matching user's selected destination
3. **When** admin adds a new destination **Then** vendors in that region can create experiences for it **And** existing experiences remain in their original destination

## Tasks / Subtasks

- [ ] Task 1: Update Experience type with destination_id (AC: #1)
  - [ ] Modify Experience interface in `src/types/experience.ts`
  - [ ] Add destination_id: string field (required)
  - [ ] Update all existing experience seed data to include destination_id
  - [ ] Set default destination_id="bali" for existing experiences
- [ ] Task 2: Add destination selector to experience creation form (AC: #1)
  - [ ] Update ExperienceCreationForm component
  - [ ] Add destination dropdown/select field
  - [ ] Populate dropdown with active destinations
  - [ ] Pre-select based on vendor's location (if available)
  - [ ] Allow manual selection if vendor has multiple destination access
- [ ] Task 3: Validate destination_id on experience creation (AC: #1)
  - [ ] Add validation: destination_id must be non-empty
  - [ ] Add validation: destination_id must match an active destination
  - [ ] Show error if invalid destination selected
  - [ ] Prevent form submission without valid destination
- [ ] Task 4: Update experience queries to filter by destination (AC: #2)
  - [ ] Modify getExperiences() to accept optional destinationId filter
  - [ ] Update getExperiencesByCategory() to filter by destination
  - [ ] Update searchExperiences() to filter by destination
  - [ ] Ensure bobjectse/search only shows matching destination experiences
- [ ] Task 5: Update vendor data model for multi-destination (AC: #3)
  - [ ] Add allowed_destinations array to Vendor type
  - [ ] Allow vendors to have multiple destination access
  - [ ] Default to single destination (Bali) for MVP
  - [ ] Add future admin UI concept for destination management
- [ ] Task 6: Test experience filtering by destination (AC: #2)
  - [ ] Create test experiences for different destinations
  - [ ] Verify experiences only appear when matching selected destination
  - [ ] Test switching destinations shows different experiences
  - [ ] Verify search respects destination filter
- [ ] Task 7: Handle destination changes gracefully (AC: #3)
  - [ ] Ensure existing experiences maintain their destination_id
  - [ ] When new destination added, existing experiences unchanged
  - [ ] Vendors can create new experiences for new destinations
  - [ ] Experiences tied to inactive destinations are hidden (not deleted)

## Dev Notes

- destination_id is a required field for all new experiences
- Migration path: all existing experiences get destination_id="bali"
- Future: consider multi-destination experiences (e.g., tours across locations)
- Vendor-destination relationship can be expanded later for access control
- For MVP, all vendors can access all active destinations

### Project Structure Notes

- Experience type definition in `src/types/experience.ts`
- Experience creation form in `src/screens/vendor/ExperienceCreationForm.tsx`
- Experience queries in `src/data/experiences.ts` or `src/utils/experiences.ts`
- Vendor type in `src/types/vendor.ts`

### References

- [Source: planning-artifacts/epics/epic-19.md#Story 19.4]
- [Source: architecture/architecture.md#Data Model]
- [Source: architecture/architecture.md#Vendor Portal]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

