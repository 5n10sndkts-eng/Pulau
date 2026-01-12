## Epic 15: Real-time Availability & Messaging

**Goal:** Customers see real-time experience availability, vendors update availability calendars instantly, and both parties communicate via messaging system for special requests and booking coordination.

### Story 15.1: Display Real-time Availability on Experience Pages

As a traveler,
I want to see current availability for experiences,
So that I can book dates that work.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** the availability section loads
**Then** I see a calendar showing next 60 days
**And** each date shows availability status:
  - Green: Available (slots > 50%)
  - Yellow: Limited (slots 1-50%)
  - Red: Sold Out (slots = 0)
  - Gray: Not Operating (no availability record)
**And** availability loads from experience_availability table
**When** I tap an available date
**Then** date selects and "Add to Trip" prefills with that date
**And** slots remaining displays: "X spots left"

### Story 15.2: Enable Vendor Calendar Quick Updates

As a vendor,
I want to quickly update availability from my phone,
So that I can manage cancellations on the go.

**Acceptance Criteria:**

**Given** I am a vendor viewing my experience availability
**When** I tap a date on the calendar
**Then** quick edit modal opens with:
  - Date displayed
  - Slots Available (number input)
  - Status toggle: Available / Blocked
  - "Save" and "Cancel" buttons
**When** I save changes
**Then** experience_availability record updates immediately
**And** change reflects on customer-facing pages within 1 second
**And** toast confirms "Availability updated"
**And** if I block a date with existing bookings, warning shows with affected bookings

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

### Story 15.5: Implement Pre-Booking Questions

As a traveler,
I want to ask the operator a question before booking,
So that I can clarify details.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I tap "Message Operator" button
**Then** new message compose modal opens
**And** experience context auto-attached to message
**And** placeholder text: "Ask about this experience..."
**When** I send the message
**Then** conversation thread created if none exists
**And** message delivered to vendor
**And** I'm navigated to the conversation thread
**And** vendor receives notification of new message

---
