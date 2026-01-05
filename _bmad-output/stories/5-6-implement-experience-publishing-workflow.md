# Story 5.6: Implement Experience Publishing Workflow

Status: ready-for-dev

## Story

As a vendor,
I want to publish my draft experience to make it live,
so that travelers can discover and book it.

## Acceptance Criteria

1. **Given** I have a draft experience with all required fields completed **When** I click "Publish Experience" **Then** system validates: Title, description, price, duration, group size are filled; At least 3 images are uploaded; At least one availability date is set; Meeting point information is complete
2. **When** validation passes **Then** experience status changes from "draft" to "active"
3. Experience becomes visible in customer search and browse
4. published_at timestamp is set
5. I see confirmation "Experience is now live!"
6. **When** validation fails **Then** specific missing items are highlighted
7. Error message lists requirements: "Complete these before publishing: [list]"

## Tasks / Subtasks

- [ ] Task 1: Create publish button and modal (AC: #1)
  - [ ] Add "Publish Experience" button on draft experiences
  - [ ] Show publish confirmation modal
  - [ ] Display pre-publish checklist
  - [ ] Indicate which items pass/fail validation
- [ ] Task 2: Implement validation logic (AC: #1, #6, #7)
  - [ ] Check title is not empty
  - [ ] Check description is not empty
  - [ ] Check price > 0
  - [ ] Check duration > 0
  - [ ] Check group_size_min and group_size_max are valid
  - [ ] Check at least 3 images uploaded
  - [ ] Check at least one availability date set
  - [ ] Check meeting point address filled
  - [ ] Return list of failing validations
- [ ] Task 3: Handle successful publish (AC: #2, #3, #4, #5)
  - [ ] Update experience status to "active"
  - [ ] Set published_at timestamp
  - [ ] Show success confirmation modal
  - [ ] Display "Experience is now live!" message
  - [ ] Include link to view customer-facing page
- [ ] Task 4: Handle validation failure (AC: #6, #7)
  - [ ] Display clear error list
  - [ ] Format: "Complete these before publishing:"
  - [ ] List each missing requirement
  - [ ] Provide links to fix each issue
  - [ ] Keep modal open for user to see issues
- [ ] Task 5: Add unpublish/deactivate option
  - [ ] Add "Deactivate" button on active experiences
  - [ ] Change status from "active" to "inactive"
  - [ ] Hide from customer browse
  - [ ] Allow reactivating (back to active)
  - [ ] Preserve all data when deactivated

## Dev Notes

- Publishing is the gate between draft and customer-visible
- Clear validation messages help vendors complete requirements
- Consider "Preview as Customer" before publishing
- Unpublish useful for seasonal experiences

### References

- [Source: epics.md#Story 5.6]
- [Source: vendor-customer-auth-requirements.md]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

