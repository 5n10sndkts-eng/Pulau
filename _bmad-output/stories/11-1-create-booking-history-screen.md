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
