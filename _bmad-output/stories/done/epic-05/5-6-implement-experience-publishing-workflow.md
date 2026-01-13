# Story 5.6: Implement Experience Publishing Workflow

Status: done

## Story

As a vendor,
I want to publish my draft experience to make it live,
so that travelers can discover and book it.

## Acceptance Criteria

1. **Given** I have a draft experience with all required fields completed **When** I click "Publish Experience" **Then** system validates: Title, description, price, duration, group size are filled; At least 3 images are uploaded; At least one availability date is set; Meeting point information is complete
2. **When** validation passes **Then** experience status changes from "draft" to "active"
3. Experience becomes visible in customer search and bobjectse
4. published_at timestamp is set
5. I see confirmation "Experience is now live!"
6. **When** validation fails **Then** specific missing items are highlighted
7. Error message lists requirements: "Complete these before publishing: [list]"

## Tasks / Subtasks

- [x] Task 1: Create publish button and modal (AC: #1)
  - [x] Add "Publish Experience" button on draft experiences
  - [x] Show publish confirmation modal
  - [x] Display pre-publish checklist
  - [x] Indicate which items pass/fail validation
- [x] Task 2: Implement validation logic (AC: #1, #6, #7)
  - [x] Check title is not empty
  - [x] Check description is not empty
  - [x] Check price > 0
  - [x] Check duration > 0
  - [x] Check group_size_min and group_size_max are valid
  - [x] Check at least 3 images uploaded
  - [x] Check at least one availability date set
  - [x] Check meeting point address filled
  - [x] Return list of failing validations
- [x] Task 3: Handle successful publish (AC: #2, #3, #4, #5)
  - [x] Update experience status to "active"
  - [x] Set published_at timestamp
  - [x] Show success confirmation modal
  - [x] Display "Experience is now live!" message
  - [x] Include link to view customer-facing page
- [x] Task 4: Handle validation failure (AC: #6, #7)
  - [x] Display clear error list
  - [x] Format: "Complete these before publishing:"
  - [x] List each missing requirement
  - [x] Provide links to fix each issue
  - [x] Keep modal open for user to see issues
- [x] Task 5: Add unpublish/deactivate option
  - [x] Add "Deactivate" button on active experiences
  - [x] Change status from "active" to "inactive"
  - [x] Hide from customer bobjectse
  - [x] Allow reactivating (back to active)
  - [x] Preserve all data when deactivated

## Dev Notes

- Publishing is the gate between draft and customer-visible
- Clear validation messages help vendors complete requirements
- Consider "Preview as Customer" before publishing
- Unpublish useful for seasonal experiences

### References

- [Source: planning-artifacts/epics/epic-05.md#Story 5.6]
- [Source: vendor-customer-auth-requirements.md]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
