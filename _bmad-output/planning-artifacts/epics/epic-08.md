# Epic 8: Trip Canvas & Itinerary Building

**Goal:** Travelers visually build custom trip itineraries by adding experiences with calendar/list view toggle, real-time pricing calculation, date management, unscheduled items section, and offline persistence.

### Story 8.1: Create Trip Data Model and Persistence
As a developer, I want a trip data model with Spark KV persistence, so that trip data survives page refreshes and offline use.

**Acceptance Criteria:**
- **Given** app loads **When** useKV initializes **Then** trips and trip_items are stored with correct structure
- **And** default empty trip is created for new users
- **And** persistence works across browser sessions

### Story 8.2: Build Trip Canvas Home View
As a traveler, I want to see my trip overview on the home screen, so that I can quickly understand my planned activities.

**Acceptance Criteria:**
- **Given** home screen with active trip **Then** I see trip header with name and summary bar (count, total price)
- **And** items are organized by day sections
- **When** no items **Then** empty state displays with "Start Exploring" button

### Story 8.3: Implement Quick Add Experience to Trip
As a traveler browsing experiences, I want to quickly add activities to my trip, so that I can build my itinerary without leaving the browse view.

**Acceptance Criteria:**
- **Given** browse view **When** I tap "+ Quick Add" **Then** item is added to trip as an unscheduled item
- **And** item flies to trip bar and price updates immediately
- **And** toast displays "Added to trip"

### Story 8.4: Create Detailed Trip Builder Screen
As a traveler, I want a full-screen trip builder to organize my itinerary, so that I can see all details and make adjustments.

**Acceptance Criteria:**
- **Given** detailed trip builder screen **When** page loads **Then** I see header with name, date pickers, and organized day sections
- **And** "Unscheduled" section shows items without dates
- **And** sticky footer shows grand total price and "Continue to Booking"

### Story 8.5: Build Calendar View Toggle
As a traveler, I want to switch between calendar and list views of my trip, so that I can visualize my itinerary in my preferred format.

**Acceptance Criteria:**
- **Given** on trip builder **When** view is toggled **Then** switching occurs between monthly grid and vertical timeline
- **And** calendar shows dots for activities; List shows day groups with connector lines
- **And** smooth transition animation plays between views

### Story 8.6: Implement Item Scheduling (Drag to Date)
As a traveler, I want to schedule unscheduled items to specific days, so that my itinerary has a logical flow.

**Acceptance Criteria:**
- **Given** unscheduled items **When** I long-press and drag to a day section **Then** record is updated with selected date
- **And** "Assign to Day" button also opens a date picker for assignment

### Story 8.7: Add Guest Count Adjustment per Item
As a traveler, I want to adjust guest count for each experience in my trip, so that pricing reflects my actual group size.

**Acceptance Criteria:**
- **Given** viewing item in builder **When** I adjust the stepper (- 1 +) **Then** item price and trip total update immediately
- **And** max guest count is capped by experience's group_size_max

### Story 8.8: Implement Remove Item from Trip
As a traveler, I want to remove experiences from my trip, so that I can change my plans.

**Acceptance Criteria:**
- **Given** viewing item **When** I swipe left (mobile) or click Remove **Then** item is removed from the trip
- **And** toast displays "Removed from trip" with a 5-second "Undo" action

### Story 8.9: Handle Date Not Set Flow
As a traveler who hasn't set trip dates, I want to browse and add items without dates, so that I can plan before committing to dates.

**Acceptance Criteria:**
- **Given** no trip dates set **When** items are added **Then** they go to "Unscheduled" section
- **When** I tap "Continue to Booking" **Then** system prompts to set dates first

### Story 8.10: Real-Time Price Calculation Display
As a traveler, I want to see my trip total update in real-time, so that I always know my current spend.

**Acceptance Criteria:**
- **Given** active trip **Then** breakdown shows Subtotal, 10% Service Fee, and Grand Total
- **When** any change occurs (add/remove/guests) **Then** all values update within 100ms
