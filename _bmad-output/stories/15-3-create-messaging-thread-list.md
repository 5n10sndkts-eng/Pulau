### Story 15.3: Create Messaging Thread List

As a vendor or traveler,
I want to see all my message conversations,
So that I can communicate about bookings.

**Acceptance Criteria:**

**Given** I navigate to "Messages" (inbox icon in header)
**When** the messages screen loads
**Then** I see list of conversation threads
**And** each thread shows:
  - Other party's name and photo
  - Experience name (context)
  - Last message preview (truncated)
  - Timestamp
  - Unread badge (if new messages)
**And** threads sorted by last_message_at DESC
**And** threads load from messages table grouped by conversation_id
**When** I tap a thread
**Then** I open the full conversation view
