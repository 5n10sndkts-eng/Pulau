### Story 26.1: Implement Service Worker for Ticket Caching

As a **traveler**,
I want my tickets cached for offline access,
So that I can show my ticket even without internet.

**Acceptance Criteria:**

**Given** I have a confirmed booking
**When** I view my ticket page while online
**Then** the Service Worker caches:

- Ticket page HTML/JS/CSS
- QR code image
- Booking metadata (experience name, time, meeting point)
  **And** cached data persists for 30 days
  **And** cache is updated when I view the ticket online

---
