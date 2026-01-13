## Epic 11: Booking Management & History

**Goal:** Users view booking history with upcoming/past tabs, manage active trips, access booking confirmations and references, utilize "Book Again" to duplicate past trips, and experience active trip mode during travel dates.

### Story 11.1: Create Booking History Screen

As a traveler,
I want to view all my bookings in one place,
So that I can manage my travel plans.

**Acceptance Criteria:**

**Given** I navigate to Profile → My Trips
**When** the booking history screen loads
**Then** I see tabs: "Upcoming" (default), "Past", "All"
**And** each tab filters bookings by status and dates
**And** "Upcoming" shows: status = 'confirmed' AND trip.start_date >= today
**And** "Past" shows: trip.end_date < today OR status = 'completed'
**And** booking cards display: trip name, dates, item count, total price, status badge
**And** cards sorted by trip.start_date (nearest first for upcoming, most recent first for past)
**And** empty state shows: suitcase icon, "No [upcoming/past] trips", "Explore experiences" CTA

### Story 11.2: Build Booking Detail View

As a traveler,
I want to view complete details of a booking,
So that I can access all confirmation information.

**Acceptance Criteria:**

**Given** I tap a booking card from history
**When** the booking detail screen loads
**Then** I see read-only trip view identical to trip builder layout
**And** header shows: booking reference (copyable), status badge, booked date
**And** all trip items display with: date, time, experience details, guest count
**And** operator contact info visible for each experience
**And** meeting point info accessible
**And** price summary shows: what was paid, payment method last 4 digits
**And** "Need Help?" link to support
**And** screen is read-only (no editing capabilities)

### Story 11.3: Implement "Book Again" Functionality

As a traveler who enjoyed a past trip,
I want to quickly rebook the same experiences,
So that I can plan a return visit easily.

**Acceptance Criteria:**

**Given** I am viewing a past/completed booking
**When** I tap "Book Again" button
**Then** a new trip is created copying all items from the original booking
**And** new trip has: name = "[Original name] (Copy)", dates = null, status = 'planning'
**And** all trip_items are copied with: same experiences, same guest counts
**And** scheduled_dates are cleared (items become unscheduled)
**And** I am navigated to the trip builder with the new trip
**And** toast displays "Trip copied! Set your new dates."
**And** original booking remains unchanged

### Story 11.4: Add Booking Status Tracking

As a traveler,
I want to see the status of my bookings,
So that I know if they're confirmed or need attention.

**Acceptance Criteria:**

**Given** bookings have various statuses
**When** I view booking cards or details
**Then** status badges display with appropriate colors:

- "Confirmed" - green badge (#27AE60)
- "Pending" - yellow badge (#F4D03F)
- "Cancelled" - gray badge
- "Completed" - teal badge (#0D7377)
  **And** status stored in bookings.status enum
  **And** status updates based on:
- 'confirmed' after successful payment
- 'completed' after trip.end_date passes
- 'cancelled' if user cancels
  **And** status changes log to booking_status_history table

### Story 11.5: Create Active Trip Mode

As a traveler during my booked trip,
I want an enhanced home screen experience,
So that I can easily access today's activities.

**Acceptance Criteria:**

**Given** I have a confirmed booking AND today is within trip date range
**When** I open the app / view home screen
**Then** home screen transforms to "Active Trip Mode":

- Top banner: "Day X of your Bali adventure!"
- Countdown: "X days remaining"
- "Today's Schedule" section prominently displayed
- Today's items with times, meeting points, quick directions
  **And** each item has "View Details" expanding to full info
  **And** "View Full Itinerary" button shows complete trip
  **And** weather widget for Bali (if API available)
  **When** trip ends (after end_date)
  **Then** home screen returns to normal planning mode
  **And** past trip moves to "Past" tab

### Story 11.6: Implement Booking Cancellation Flow

As a traveler who needs to cancel,
I want to cancel my booking according to policy,
So that I can get a refund if eligible.

**Acceptance Criteria:**

**Given** I am viewing a confirmed booking detail
**When** I tap "Cancel Booking"
**Then** modal displays cancellation policy for each experience
**And** refund calculation shows:

- Full refund if > 24 hours before each experience
- Partial/no refund if within 24 hours
- Total refund amount
  **When** I confirm cancellation
  **Then** booking status updates to 'cancelled'
  **And** refund is initiated via payment gateway
  **And** cancellation confirmation email sent
  **And** toast displays "Booking cancelled. Refund processing."
  **And** cancelled booking remains visible in history (grayed out)

---
