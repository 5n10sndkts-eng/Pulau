## Epic 9: Scheduling & Conflict Detection

**Goal:** System automatically detects when activities overlap in time, displays yellow warning banners with smart suggestions, and provides trip sharing via shareable links.

### Story 9.1: Implement Time Conflict Detection Algorithm

As a developer,
I want an algorithm that detects scheduling conflicts,
So that users are warned about overlapping activities.

**Acceptance Criteria:**

**Given** trip items have scheduled_date and scheduled_time
**When** conflict detection runs (on any item change)
**Then** algorithm checks: for each day, are any item time ranges overlapping?
**And** time range = scheduled_time to (scheduled_time + experience.duration_hours)
**And** conflicts identified when: itemA.end_time > itemB.start_time AND itemA.start_time < itemB.end_time
**And** conflict data stored: { item_ids: [id1, id2], overlap_minutes, date }
**And** algorithm runs in <50ms for up to 20 items per day

### Story 9.2: Display Conflict Warning Banners

As a traveler,
I want to see visual warnings when activities overlap,
So that I can fix scheduling issues.

**Acceptance Criteria:**

**Given** a scheduling conflict is detected from Story 9.1
**When** I view the trip builder
**Then** conflicting items show yellow warning banner
**And** banner displays: warning icon (⚠️), "Schedule conflict with [other item name]"
**And** banner background uses Golden Sand color (#F4D03F at 20% opacity)
**And** banner appears between the two conflicting item cards
**When** conflict is resolved (item moved or removed)
**Then** warning banner disappears with fade animation

### Story 9.3: Provide Smart Conflict Resolution Suggestions

As a traveler with a scheduling conflict,
I want suggestions to resolve the overlap,
So that I can quickly fix my itinerary.

**Acceptance Criteria:**

**Given** a conflict warning banner is displayed
**When** I tap the warning banner
**Then** a bottom sheet opens with resolution options:
  - "Move [Item A] to [suggested time]" (next available slot)
  - "Move [Item B] to [suggested time]"
  - "Move [Item A] to another day"
  - "Remove [Item A] from trip"
**And** suggestions are calculated based on item durations and available gaps
**When** I select a suggestion
**Then** the action is applied immediately
**And** conflict detection re-runs
**And** toast confirms "Conflict resolved"

### Story 9.4: Create Shareable Trip Links

As a traveler,
I want to share my trip plan with others,
So that travel companions can see the itinerary.

**Acceptance Criteria:**

**Given** I am on the trip builder screen
**When** I tap the share button (top right)
**Then** a share modal opens with options:
  - "Copy Link" - copies shareable URL to clipboard
  - "Share via..." - opens native share sheet (mobile)
**And** shareable link format: `https://pulau.app/trip/{share_token}`
**And** share_token is a unique UUID stored in trips.share_token
**When** someone opens the shared link
**Then** they see a read-only view of the trip
**And** read-only view shows: trip name, dates, all items with details, total price
**And** "Create your own trip" CTA at bottom
**And** shared trips do not require login to view

---
