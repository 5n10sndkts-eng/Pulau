### Story 24.2: Build Checkout Review Screen

As a **traveler**,
I want to review my trip before payment,
So that I can verify all details are correct.

**Acceptance Criteria:**

**Given** I have items in my trip and click "Checkout"
**When** the checkout review screen loads
**Then** I see:
  - List of all experiences with dates, times, guest counts
  - Price breakdown per item
  - Platform fees (if displayed)
  - Total amount
  - Cancellation policy summary for each item
**And** I can remove items from checkout
**And** I can adjust guest counts (if availability allows)
**And** I see real-time availability status (e.g., "2 spots left")

---
