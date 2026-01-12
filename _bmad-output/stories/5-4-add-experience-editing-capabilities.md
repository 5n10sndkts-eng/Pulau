### Story 5.4: Add Experience Editing Capabilities

As a vendor,
I want to edit my existing experiences,
So that I can keep information accurate and up-to-date.

**Acceptance Criteria:**

**Given** I have created experiences from previous stories
**When** I navigate to "My Experiences" list
**Then** I see all my experiences with: thumbnail, title, category, price, status
**When** I click "Edit" on an experience
**Then** the creation form opens pre-filled with existing data
**When** I modify any field and save
**Then** the experiences table record is updated with new values
**And** updated_at timestamp is set to current time
**And** change history is logged to experience_audit_log table (experience_id, vendor_id, changed_fields, old_values, new_values, changed_at)
**And** if experience status was "active", it remains active after edit
**And** I see success toast "Experience updated"
**And** changes reflect immediately in customer-facing views
