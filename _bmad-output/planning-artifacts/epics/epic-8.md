## Epic 8: Trip Canvas & Itinerary Building

**Goal:** Travelers visually build custom trip itineraries by adding experiences with calendar/list view toggle, real-time pricing calculation, date management, unscheduled items section, and offline persistence.

### Story 8.1: Create Trip Data Model and Persistence

As a developer,
I want a trip data model with Spark KV persistence,
So that trip data survives page refreshes and offline use.

**Acceptance Criteria:**

**Given** the application loads
**When** useKV hook initializes for trips
**Then** trips are stored with structure: { id, user_id, name, start_date, end_date, items[], status, created_at, updated_at }
**And** trip_items have structure: { id, trip_id, experience_id, scheduled_date, scheduled_time, guest_count, notes, created_at }
**And** default empty trip is created for new users
**And** null safety pattern is applied: `const safeTrip = trip || defaultTrip`
**And** updater functions check for null: `setTrip(current => { const base = current || defaultTrip; ... })`
**And** trip data persists across browser sessions

### Story 8.2: Build Trip Canvas Home View

As a traveler,
I want to see my trip overview on the home screen,
So that I can quickly understand my planned activities.

**Acceptance Criteria:**

**Given** I am on the home screen with an active trip
**When** the trip canvas section loads
**Then** I see trip header: trip name (editable), date range (or "Dates not set")
**And** trip summary bar shows: item count, total days, total price
**And** below header I see trip items organized by day
**And** each day section shows: day number, date, scheduled items
**And** each item card displays: time, experience title, duration, price, guest count
**And** "View Full Trip" button expands to detailed trip builder
**When** trip has no items
**Then** empty state shows: suitcase illustration, "Your trip canvas is empty", "Start Exploring" button

### Story 8.3: Implement Quick Add Experience to Trip

As a traveler browsing experiences,
I want to quickly add activities to my trip,
So that I can build my itinerary without leaving the browse view.

**Acceptance Criteria:**

**Given** I am viewing an experience card in any browse context
**When** I tap "+ Quick Add" button
**Then** experience is added to my active trip as unscheduled item
**And** item flies to trip bar with animation (150ms ease-out)
**And** trip bar price updates immediately to include new item
**And** trip item record created: { experience_id, guest_count: 1, scheduled_date: null }
**And** toast displays "Added to trip"
**When** I tap Quick Add for an experience already in trip
**Then** toast displays "Already in your trip"
**And** no duplicate is created

### Story 8.4: Create Detailed Trip Builder Screen

As a traveler,
I want a full-screen trip builder to organize my itinerary,
So that I can see all details and make adjustments.

**Acceptance Criteria:**

**Given** I tap "View Full Trip" or navigate to trip builder
**When** the trip builder screen loads
**Then** I see header with: back button, trip name (editable inline), share button
**And** date picker shows: arrival date, departure date (with calendar modal)
**And** trip items are grouped by scheduled date
**And** "Unscheduled" section shows items without dates
**And** sticky footer shows: item count, total price, "Continue to Booking" button
**And** total price calculates: SUM(experience.price × guest_count) for all items

### Story 8.5: Build Calendar View Toggle

As a traveler,
I want to switch between calendar and list views of my trip,
So that I can visualize my itinerary in my preferred format.

**Acceptance Criteria:**

**Given** I am on the trip builder screen
**When** I see the view toggle (Calendar | List)
**Then** default view is List (timeline)
**When** I tap "Calendar"
**Then** view switches to monthly calendar grid
**And** days with activities show colored dots (one dot per item)
**And** tapping a day shows that day's items in a bottom sheet
**And** current day is highlighted
**When** I tap "List"
**Then** view switches to vertical timeline
**And** items grouped by day with connecting timeline lines
**And** smooth transition animation between views (200ms)

### Story 8.6: Implement Item Scheduling (Drag to Date)

As a traveler,
I want to schedule unscheduled items to specific days,
So that my itinerary has a logical flow.

**Acceptance Criteria:**

**Given** I have unscheduled items in my trip
**When** I long-press an unscheduled item
**Then** item becomes draggable with visual feedback (slight elevation, opacity change)
**When** I drag the item over a day section
**Then** day section highlights as drop target
**When** I release the item on a day
**Then** item moves to that day's section with animation
**And** trip_items.scheduled_date updates to the selected date
**And** item appears at end of that day's list
**When** I tap "Assign to Day" on an unscheduled item
**Then** date picker modal opens
**And** I can select a date from trip date range
**And** item updates and moves to selected day

### Story 8.7: Add Guest Count Adjustment per Item

As a traveler,
I want to adjust guest count for each experience in my trip,
So that pricing reflects my actual group size.

**Acceptance Criteria:**

**Given** I am viewing a trip item in the builder
**When** I tap the guest count
**Then** a stepper control appears (- 1 +)
**And** minimum is 1 guest, maximum is experience.group_size_max
**When** I adjust guest count
**Then** item price updates: experience.price × new_guest_count
**And** trip total updates immediately
**And** trip_items.guest_count persists to storage
**And** guest count displays as "2 guests" format

### Story 8.8: Implement Remove Item from Trip

As a traveler,
I want to remove experiences from my trip,
So that I can change my plans.

**Acceptance Criteria:**

**Given** I am viewing a trip item
**When** I swipe left on the item (mobile) or hover to reveal delete (desktop)
**Then** red "Remove" action appears
**When** I tap "Remove"
**Then** item is removed from trip_items
**And** item animates out (fade + slide)
**And** trip total recalculates
**And** toast displays "Removed from trip" with "Undo" action (5 seconds)
**When** I tap "Undo"
**Then** item is restored to trip
**And** no confirmation modal for removal (non-destructive, can re-add)

### Story 8.9: Handle Date Not Set Flow

As a traveler who hasn't set trip dates,
I want to browse and add items without dates,
So that I can plan before committing to dates.

**Acceptance Criteria:**

**Given** my trip has no dates set (start_date and end_date are null)
**When** I add items to trip
**Then** all items go to "Unscheduled" section
**And** trip builder shows "Set your dates" prompt at top
**When** I tap "Continue to Booking" without dates
**Then** modal prompts: "When are you traveling?"
**And** date picker with "Set Dates" and "Skip for now" buttons
**When** I set dates
**Then** unscheduled items remain unscheduled (not auto-assigned)
**And** I can now drag items to specific days

### Story 8.10: Real-Time Price Calculation Display

As a traveler,
I want to see my trip total update in real-time,
So that I always know my current spend.

**Acceptance Criteria:**

**Given** I have items in my trip
**When** viewing any trip context (canvas, builder, or checkout)
**Then** price breakdown shows:
  - Subtotal: SUM(each item's price × guest_count)
  - Service Fee: subtotal × 0.10 (10%)
  - Total: subtotal + service_fee
**And** all prices formatted with currency symbol (e.g., "$125.00")
**When** I add, remove, or adjust guest count
**Then** all price values update within 100ms
**And** animations highlight changed values briefly

---
