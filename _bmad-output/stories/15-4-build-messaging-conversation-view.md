### Story 15.4: Build Messaging Conversation View

As a vendor or traveler,
I want to send and receive messages about a booking,
So that I can coordinate special requests.

**Acceptance Criteria:**

**Given** I tap a message thread
**When** the conversation view loads
**Then** I see:
  - Header: other party name, experience title
  - Message bubbles: my messages (right, teal), their messages (left, gray)
  - Each message shows: text, timestamp, read receipt (✓✓)
  - Text input at bottom with send button
**When** I type and tap send
**Then** message saves to messages table (sender_id, receiver_id, conversation_id, content, sent_at)
**And** message appears immediately in my view
**And** message delivers to other party (real-time if online, otherwise on next load)
**When** other party sends a message
**Then** it appears in my view (poll every 10 seconds, or websocket if implemented)
