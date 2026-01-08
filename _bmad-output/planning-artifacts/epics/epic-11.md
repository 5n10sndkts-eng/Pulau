# Epic 11: Booking Management & History

**Goal:** Users view booking history with upcoming/past tabs, manage active trips, access booking confirmations and references, utilize "Book Again" to duplicate past trips, and experience active trip mode during travel dates.

### Story 11.1: Create Booking History Screen
As a traveler, I want to view all my bookings in one place, so that I can manage my travel plans.

**Acceptance Criteria:**
- **Given** My Trips screen **When** loaded **Then** I see tabs for "Upcoming", "Past", and "All"
- **And** booking cards show name, dates, item count, total price, and colored status badge
- **And** empty states provide CTAs to "Explore experiences"

### Story 11.2: Build Booking Detail View
As a traveler, I want to view complete details of a booking, so that I can access all confirmation information.

**Acceptance Criteria:**
- **Given** booking detail screen **Then** I see a read-only trip view with booking reference and status
- **And** operator contact info and meeting point details are accessible
- **And** screen displays "Need Help?" support link

### Story 11.3: Implement "Book Again" Functionality
As a traveler who enjoyed a past trip, I want to quickly rebook the same experiences, so that I can plan a return visit easily.

**Acceptance Criteria:**
- **Given** past booking **When** I tap "Book Again" **Then** a new trip is created copying all items
- **And** items become unscheduled; dates return to null
- **And** I navigate to Trip Builder to set new dates

### Story 11.4: Add Booking Status Tracking
As a traveler, I want to see the status of my bookings, so that I know if they're confirmed or need attention.

**Acceptance Criteria:**
- **Given** booking records **Then** status badges show appropriate colors: Confirmed (Green), Pending (Yellow), Cancelled (Gray), Completed (Teal)
- **And** status automatically updates when payment succeeds or trip dates pass

### Story 11.5: Create Active Trip Mode
As a traveler during my booked trip, I want an enhanced home screen experience, so that I can easily access today's activities.

**Acceptance Criteria:**
- **Given** today is within trip range **When** home screen loads **Then** it transforms to "Active Trip Mode"
- **And** displays "Day X", today's schedule, and quick directions for activities
- **And** returns to normal mode once the trip ends

### Story 11.6: Implement Booking Cancellation Flow
As a traveler who needs to cancel, I want to cancel my booking according to policy, so that I can get a refund if eligible.

**Acceptance Criteria:**
- **Given** confirmed booking **When** I tap "Cancel" **Then** modal displays policy and refund calculation
- **When** confirmed **Then** status updates to 'cancelled' and refund initiates via gateway
- **And** confirmation email is sent
