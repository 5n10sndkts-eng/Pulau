## Epic 17: Edge Cases & Error Handling

**Goal:** Users experience graceful handling of edge cases: empty states, network interruption, sold-out experiences, error boundaries, and consistent error messaging.

### Story 17.1: Create Empty State Components

As a user with no data,
I want to see helpful empty states,
So that I know what to do next.

**Acceptance Criteria:**

**Given** a list/screen has no data
**When** empty state renders
**Then** appropriate illustration and messaging displays:
  - Empty Trip: suitcase illustration, "Your trip canvas is empty", "Start Exploring" CTA
  - No Search Results: magnifying glass, "No experiences match '[query]'", "Try different keywords" + "Clear Filters"
  - Empty Wishlist: heart outline, "Your wishlist is empty", "Browse Experiences" CTA
  - No Bookings: calendar, "No upcoming trips", "Plan Your Adventure" CTA
  - No Filter Results: filter icon, "No experiences match these filters", "Clear Filters" button
**And** CTAs navigate to appropriate screens
**And** illustrations are lightweight SVGs

### Story 17.2: Implement Network Interruption Handling

As a user with poor connectivity,
I want the app to handle offline gracefully,
So that I don't lose my data.

**Acceptance Criteria:**

**Given** the device loses network connection
**When** a network request fails
**Then** cached data (from Spark useKV) continues to display
**And** "Last updated [timestamp]" indicator shows data freshness
**And** "Retry" button appears on failed sections
**And** toast displays "You're offline. Some features unavailable."
**When** I tap "Retry"
**Then** request attempts again
**And** success replaces error state
**When** network returns
**Then** data syncs automatically in background
**And** "Back online" toast displays

### Story 17.3: Handle Sold Out Experiences

As a traveler,
I want to know when experiences are unavailable,
So that I can find alternatives.

**Acceptance Criteria:**

**Given** an experience has no available slots (slots_available = 0 for all dates)
**When** experience card displays
**Then** "Currently Unavailable" badge overlay on image
**And** card is slightly desaturated (80% opacity)
**And** "Quick Add" button disabled
**When** I tap the card to view details
**Then** detail page shows availability calendar (all red)
**And** "Join Waitlist" button appears
**And** "Similar Experiences" section shows alternatives in same category
**When** I join waitlist
**Then** my email saved to waitlist table (experience_id, user_id, created_at)
**And** toast: "You'll be notified when spots open"

### Story 17.4: Implement Error Boundaries

As a user,
I want the app to recover from errors gracefully,
So that one bug doesn't crash everything.

**Acceptance Criteria:**

**Given** an unhandled JavaScript error occurs
**When** the error boundary catches it
**Then** friendly error UI displays instead of white screen:
  - Illustration of confused character
  - "Something went wrong"
  - "Try refreshing the page" suggestion
  - "Report Problem" link
  - "Go Home" button
**And** error details logged to console (dev mode)
**And** error reported to monitoring service (production)
**When** user taps "Go Home"
**Then** navigation resets to home screen
**And** error state clears

### Story 17.5: Create Consistent Error Messaging

As a user encountering errors,
I want clear error messages,
So that I understand what went wrong.

**Acceptance Criteria:**

**Given** various error conditions
**When** errors display
**Then** error messages are user-friendly (not technical):
  - Network: "Unable to connect. Check your internet connection."
  - Payment: "Payment couldn't be processed. Please try again."
  - Validation: "[Field] is required" (inline)
  - Not Found: "This experience is no longer available."
  - Server: "Something went wrong on our end. Please try again later."
**And** error toasts use destructive variant (red/coral)
**And** inline errors use red border and helper text
**And** all errors are recoverable (retry button or clear instructions)

---
