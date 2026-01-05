# Story 5.2: Build Vendor Experience Creation Form

Status: ready-for-dev

## Story

As a vendor,
I want to create a new experience listing,
so that travelers can discover and book my offering.

## Acceptance Criteria

1. **Given** I am logged in to the vendor portal **When** I navigate to "Add New Experience" **Then** I see a multi-step creation form with sections: Basic Info (Title, Category dropdown, Subcategory, Description textarea), Pricing (Price amount, Currency, Per person/vehicle/group), Details (Duration hours, Start time, Group size min/max, Difficulty dropdown, Languages multi-select), Location (Meeting point address, Latitude, Longitude with map picker), What's Included (Add multiple inclusions with checkmark items, Add multiple exclusions with X mark items)
2. **When** I fill all required fields and submit **Then** a new record is created in experiences table with status = "draft"
3. vendor_id is set to my logged-in vendor ID
4. created_at timestamp is set
5. I see success message "Experience created as draft"
6. I am redirected to image upload step
7. Validation prevents submission with: empty title, invalid price, min > max group size

## Tasks / Subtasks

- [ ] Task 1: Create experience creation form UI (AC: #1)
  - [ ] Create `src/screens/vendor/CreateExperienceScreen.tsx`
  - [ ] Build multi-step form with progress indicator
  - [ ] Step 1: Basic Info (title, category, subcategory, description)
  - [ ] Step 2: Pricing (amount, currency dropdown, per dropdown)
  - [ ] Step 3: Details (duration, start time, group size, difficulty, languages)
  - [ ] Step 4: Location (address, map picker for lat/lng)
  - [ ] Step 5: Inclusions (add/remove included/excluded items)
- [ ] Task 2: Implement Basic Info step (AC: #1, #7)
  - [ ] Title input with max 200 character limit
  - [ ] Category dropdown with 6 options
  - [ ] Subcategory text input
  - [ ] Description textarea with rich text (optional)
  - [ ] Validate title required
- [ ] Task 3: Implement Pricing step (AC: #1, #7)
  - [ ] Price amount number input
  - [ ] Currency dropdown (USD default, support IDR, EUR, etc.)
  - [ ] Per dropdown (person, vehicle, group)
  - [ ] Validate price > 0
- [ ] Task 4: Implement Details step (AC: #1, #7)
  - [ ] Duration hours number input (decimal allowed)
  - [ ] Start time picker (e.g., 09:00 AM)
  - [ ] Group size min/max inputs
  - [ ] Validate min <= max
  - [ ] Difficulty dropdown (Easy, Moderate, Challenging)
  - [ ] Languages multi-select checkboxes
- [ ] Task 5: Implement Location step (AC: #1)
  - [ ] Meeting point address text input
  - [ ] Map picker component for selecting coordinates
  - [ ] Show selected lat/lng values
  - [ ] Optional meeting instructions textarea
- [ ] Task 6: Implement Inclusions step (AC: #1)
  - [ ] "What's Included" section with add button
  - [ ] "Not Included" section with add button
  - [ ] Each item: text input + remove button
  - [ ] Store as experience_inclusions with is_included flag
- [ ] Task 7: Handle form submission (AC: #2, #3, #4, #5, #6)
  - [ ] Create experience record with status="draft"
  - [ ] Set vendor_id from auth context
  - [ ] Set created_at timestamp
  - [ ] Save inclusions to separate storage
  - [ ] Show success toast
  - [ ] Navigate to image upload screen

## Dev Notes

- Form uses multi-step wizard pattern
- Each step validates before proceeding
- Draft status allows incomplete experiences
- Image upload is separate screen (Story 5.3)

### References

- [Source: epics.md#Story 5.2]
- [Source: vendor-customer-auth-requirements.md]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

