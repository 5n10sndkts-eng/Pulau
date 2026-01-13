# Epic 15: Real-time Availability & Messaging

**Goal:** Customers see real-time experience availability, vendors update availability calendars instantly, and both parties communicate via messaging system for special requests and booking coordination.

### Story 15.1: Display Real-time Availability on Experience Pages

As a traveler, I want to see current availability for experiences, so that I can book dates that work.

**Acceptance Criteria:**

- **Given** experience detail page **When** availability section loads **Then** I see a 60-day calendar with Green/Yellow/Red/Gray status colors
- **When** available date tapped **Then** it selects and displays remaining slots

### Story 15.2: Enable Vendor Calendar Quick Updates

As a vendor, I want to quickly update availability from my phone, so that I can manage cancellations on the go.

**Acceptance Criteria:**

- **Given** vendor availability view **When** date tapped **Then** quick edit modal opens for Slots and Status toggle
- **When** saved **Then** change reflects on customer pages within 1 second

### Story 15.3: Create Messaging Thread List

As a vendor or traveler, I want to see all my message conversations, so that I can communicate about bookings.

**Acceptance Criteria:**

- **Given** Messages screen **When** loaded **Then** I see a list of conversation threads with name, photo, context, preview, and unread badges
- **And** threads are sorted by last_message_at DESC

### Story 15.4: Build Messaging Conversation View

As a vendor or traveler, I want to send and receive messages about a booking, so that I can coordinate special requests.

**Acceptance Criteria:**

- **Given** conversation thread tapped **When** view loads **Then** I see message bubbles (teal/gray) with read receipts (✓✓)
- **When** sending **Then** message saves and appears immediately; poll/websocket handles incoming delivery

### Story 15.5: Implement Pre-Booking Questions

As a traveler, I want to ask the operator a question before booking, so that I can clarify details.

**Acceptance Criteria:**

- **Given** experience detail page **When** "Message Operator" tapped **Then** a modal opens with pre-filled context
- **When** sent **Then** thread is created and user is navigated to the conversation view
