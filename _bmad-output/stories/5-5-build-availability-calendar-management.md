### Story 5.5: Build Availability Calendar Management

As a vendor,
I want to manage which dates my experience is available,
So that travelers can only book when I'm operating.

**Acceptance Criteria:**

**Given** I am editing an experience
**When** I navigate to "Manage Availability" tab
**Then** I see a calendar UI for the next 12 months
**And** each date shows: Available (green), Limited Spots (yellow), Sold Out (red), Blocked (gray)
**When** I click a date
**Then** I can set: Status (Available/Blocked), Slots Available (number)
**And** changes save to experience_availability table (experience_id, date, slots_available, status)
**When** I select "Set Recurring Availability"
**Then** I can define: Days of week operating (checkboxes), Slots per day (number), Date range
**And** bulk records are created for matching dates
**And** blackout dates can be added to block specific days
**And** availability updates sync to customer views in real-time
