### Story 15.2: Enable Vendor Calendar Quick Updates

As a vendor,
I want to quickly update availability from my phone,
So that I can manage cancellations on the go.

**Acceptance Criteria:**

**Given** I am a vendor viewing my experience availability
**When** I tap a date on the calendar
**Then** quick edit modal opens with:
  - Date displayed
  - Slots Available (number input)
  - Status toggle: Available / Blocked
  - "Save" and "Cancel" buttons
**When** I save changes
**Then** experience_availability record updates immediately
**And** change reflects on customer-facing pages within 1 second
**And** toast confirms "Availability updated"
**And** if I block a date with existing bookings, warning shows with affected bookings
