# Story 5.4: Add Experience Editing Capabilities

Status: ready-for-dev

## Story

As a vendor,
I want to edit my existing experiences,
so that I can keep information accurate and up-to-date.

## Acceptance Criteria

1. **Given** I have created experiences from previous stories **When** I navigate to "My Experiences" list **Then** I see all my experiences with: thumbnail, title, category, price, status
2. **When** I click "Edit" on an experience **Then** the creation form opens pre-filled with existing data
3. **When** I modify any field and save **Then** the experiences table record is updated with new values
4. updated_at timestamp is set to current time
5. Change history is logged to experience_audit_log table (experience_id, vendor_id, changed_fields, old_values, new_values, changed_at)
6. If experience status was "active", it remains active after edit
7. I see success toast "Experience updated"
8. Changes reflect immediately in customer-facing views

## Tasks / Subtasks

- [ ] Task 1: Create My Experiences list screen (AC: #1)
  - [ ] Create `src/screens/vendor/MyExperiencesScreen.tsx`
  - [ ] Fetch experiences filtered by vendor_id
  - [ ] Display as cards with: thumbnail (first image), title, category, price, status badge
  - [ ] Status badges: Draft (gray), Active (green), Inactive (yellow), Sold Out (red)
  - [ ] Add "Edit" button on each card
  - [ ] Add "View" button to see customer view
- [ ] Task 2: Implement edit mode (AC: #2)
  - [ ] Create EditExperienceScreen or reuse CreateExperienceScreen with edit mode
  - [ ] Load existing experience data by ID
  - [ ] Pre-fill all form fields with current values
  - [ ] Pre-fill inclusions list
  - [ ] Load existing images
- [ ] Task 3: Implement update logic (AC: #3, #4)
  - [ ] Create update experience handler
  - [ ] Compare changed fields with original
  - [ ] Update experience record in useKV
  - [ ] Set updated_at to current timestamp
- [ ] Task 4: Implement audit logging (AC: #5)
  - [ ] Create experience_audit_log storage structure
  - [ ] Log: experience_id, vendor_id, changed_fields, old_values, new_values, changed_at
  - [ ] Capture old values before update
  - [ ] Only log fields that actually changed
- [ ] Task 5: Handle status preservation (AC: #6)
  - [ ] Keep status unchanged during edit (unless explicitly changed)
  - [ ] Active experiences remain active
  - [ ] Don't require re-publishing after edit
- [ ] Task 6: Handle UI feedback (AC: #7, #8)
  - [ ] Show "Experience updated" success toast
  - [ ] Navigate back to My Experiences list
  - [ ] Refresh list to show updated data
  - [ ] Changes reflect in customer browse immediately

## Dev Notes

- Editing uses same form as creation but in "edit mode"
- Audit log useful for debugging and vendor history
- Status changes should be explicit (separate action)
- Consider versioning for rollback (future enhancement)

### References

- [Source: epics.md#Story 5.4]
- [Source: vendor-customer-auth-requirements.md]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

