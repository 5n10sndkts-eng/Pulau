# Epic 17: Edge Cases & Error Handling

**Goal:** Users experience graceful handling of edge cases: empty states, network interruption, sold-out experiences, error boundaries, and consistent error messaging.

### Story 17.1: Create Empty State Components
As a user with no data, I want to see helpful empty states, so that I know what to do next.

**Acceptance Criteria:**
- **Given** no data **When** empty state renders **Then** appropriate lightweight SVG illustration and messaging displays
- **And** CTAs (e.g., "Start Exploring", "Plan Your Adventure") navigate to the correct screens

### Story 17.2: Implement Network Interruption Handling
As a user with poor connectivity, I want the app to handle offline gracefully, so that I don't lose my data.

**Acceptance Criteria:**
- **Given** lost network **Then** cached Spark useKV data displays with "Last updated" timestamps
- **And** toast notification and "Retry" buttons appear for failed sections
- **When** network returns **Then** background sync occurs automatically

### Story 17.3: Handle Sold Out Experiences
As a traveler, I want to know when experiences are unavailable, so that I can find alternatives.

**Acceptance Criteria:**
- **Given** no available slots **When** card displays **Then** "Currently Unavailable" badge overlay shows; card is desaturated
- **And** "Quick Add" is disabled; detail page shows "Join Waitlist" and "Similar Experiences" buttons

### Story 17.4: Implement Error Boundaries
As a user, I want the app to recover from errors gracefully, so that one bug doesn't crash everything.

**Acceptance Criteria:**
- **Given** unhandled JS error **When** caught **Then** friendly error UI displays with "Go Home" and "Report Problem" buttons
- **And** navigation resets to home screen on "Go Home" click

### Story 17.5: Create Consistent Error Messaging
As a user encountering errors, I want clear error messages, so that I understand what went wrong.

**Acceptance Criteria:**
- **Given** error condition **When** displayed **Then** messages are user-friendly (e.g., "Unable to connect", "Payment failed")
- **And** toasts use destructive styling; all errors are recoverable via clear instructions
