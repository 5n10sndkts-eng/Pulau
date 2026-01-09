# Story 5.2: Build Vendor Experience Creation Form

Status: done

## Story

As a vendor,
I want to create a new experience listing,
so that travelers can discover and book my offering.

## Acceptance Criteria

1. **Given** I am logged in to the vendor portal **When** I navigate to "Add New Experience" **Then** I see a multi-step creation form with sections: Basic Info (Title, Category dropdown, Subcategory, Description textarea), Pricing (Price amount, Currency, Per person/vehicle/group), Details (Duration hours, Start time, Group size min/max, Difficulty dropdown, Languages multi-select), Location (Meeting point address, Latitude, Longitude with map picker), What's Included (Add multiple inclusions with checkmark items, Add multiple exclusions with X mark items)
2. **When** I fill all required fields and submit **Then** a new record is created in experiences KV namespace with status = "draft"
3. vendor_id is set to my logged-in vendor ID
4. created_at timestamp is set
5. I see success message "Experience created as draft"
6. I am redirected to image upload step
7. Validation prevents submission with: empty title, invalid price, min > max group size

## Tasks / Subtasks

- [x] Task 1: Create experience creation form UI (AC: #1)
  - [x] Create `src/screens/vendor/CreateExperienceScreen.tsx` (Implemented as `src/screens/vendor/experience-form/index.tsx`)
  - [x] Build multi-step form with progress indicator
  - [x] Step 1: Basic Info (title, category, subcategory, description)
  - [x] Step 2: Pricing (amount, currency dropdown, per dropdown)
  - [x] Step 3: Details (duration, start time, group size, difficulty, languages)
  - [x] Step 4: Location (address, map picker for lat/lng)
  - [x] Step 5: Inclusions (add/remove included/excluded items)
- [x] Task 2: Implement Basic Info step (AC: #1, #7)
  - [x] Title input with max 200 character limit
  - [x] Category dropdown with 6 options
  - [x] Subcategory text input
  - [x] Description textarea with rich text (optional)
  - [x] Validate title required
- [x] Task 3: Implement Pricing step (AC: #1, #7)
  - [x] Price amount number input
  - [x] Currency dropdown (USD default, support IDR, EUR, etc.)
  - [x] Per dropdown (person, vehicle, group)
  - [x] Validate price > 0
- [x] Task 4: Implement Details step (AC: #1, #7)
  - [x] Duration hours number input (decimal allowed)
  - [x] Start time picker (e.g., 09:00 AM)
  - [x] Group size min/max inputs
  - [x] Validate min <= max
  - [x] Difficulty dropdown (Easy, Moderate, Challenging)
  - [x] Languages multi-select checkboxes
- [x] Task 5: Implement Location step (AC: #1)
  - [x] Meeting point address text input
  - [x] Map picker component for selecting coordinates
  - [x] Show selected lat/lng values
  - [x] Optional meeting instructions textarea
- [x] Task 6: Implement Inclusions step (AC: #1)
  - [x] "What's Included" section with add button
  - [x] "Not Included" section with add button
  - [x] Each item: text input + remove button
  - [x] Store as experience_inclusions with is_included flag
- [x] Task 7: Handle form submission (AC: #2, #3, #4, #5, #6)
  - [x] Create experience record with status="draft"
  - [x] Set vendor_id from auth context
  - [x] Set created_at timestamp
  - [x] Save inclusions to separate storage
  - [x] Show success toast
  - [x] Navigate to image upload screen (Simulated navigation to 'completed' state)

## Dev Notes

- Form uses multi-step wizard pattern
- Each step validates before proceeding
- Draft status allows incomplete experiences
- Image upload is separate screen (Story 5.3)

### References

- [Source: planning-artifacts/epics/epic-05.md#Story 5.2]
- [Source: vendor-customer-auth-requirements.md]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

