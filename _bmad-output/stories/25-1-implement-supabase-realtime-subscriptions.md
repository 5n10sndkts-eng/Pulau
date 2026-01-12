### Story 25.1: Implement Supabase Realtime Subscriptions

As a **traveler**,
I want to see availability update in real-time,
So that I know the current booking status without refreshing.

**Acceptance Criteria:**

**Given** I am viewing an experience detail page
**When** another user books a slot I'm viewing
**Then** the availability count updates within 500ms
**And** if a slot becomes sold out, the UI updates immediately
**And** I see a subtle animation indicating the change
**And** subscription is automatically cleaned up when I leave the page

---
