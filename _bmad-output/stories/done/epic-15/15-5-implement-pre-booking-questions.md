# Story 15.5: Implement Pre-Booking Questions

Status: done

## Story

As a traveler,
I want to ask the operator a question before booking,
So that I can clarify details.

## Acceptance Criteria

### AC1: Message Operator Button
**Given** I am on an experience detail page
**When** I tap "Message Operator" button
**Then** new message compose modal opens
**And** experience context auto-attached to message

### AC2: Message Composition
**And** placeholder text: "Ask about this experience..."
**When** I send the message
**Then** conversation thread created if none exists

### AC3: Message Delivery and Navigation
**And** message delivered to vendor
**And** I'm navigated to the conversation thread
**And** vendor receives notification of new message

## Tasks / Subtasks

### Task 1: Add "Message Operator" Button to Experience Page (AC: #1)
- [x] Place "Message Operator" button below experience details (above "Add to Trip")
- [x] Style as secondary button (outline style, not primary)
- [x] Add MessageCircle icon from lucide-react
- [x] Ensure button is visible on mobile and desktop layouts
- [x] Handle tap to open message compose modal

### Task 2: Build Message Compose Modal (AC: #1, #2)
- [x] Create MessageComposeModal component with slide-up animation
- [x] Display experience name and photo as context header
- [x] Add text area input with placeholder: "Ask about this experience..."
- [x] Include character counter (max 500 characters)
- [x] Add "Send" (primary) and "Cancel" (secondary) buttons

### Task 3: Create or Find Conversation Thread (AC: #2)
- [x] Check if conversation thread exists between user and vendor for this experience
- [x] If exists, use existing conversation_id
- [x] If not, generate new conversation_id: `{experienceId}_{userId}_{vendorId}`
- [x] Attach experience_id to message for context
- [x] Validate vendor exists and is active before creating thread

### Task 4: Send Message and Navigate (AC: #3)
- [x] On send, insert message into messages KV namespace with all metadata
- [x] Mark message as unread (is_read = false) for vendor
- [x] Close modal after successful send
- [x] Navigate user to full conversation view (Story 15.4)
- [x] Show success feedback: "Message sent to operator"

### Task 5: Trigger Vendor Notification (AC: #3)
- [x] Create notification record in notifications KV namespace (type: 'new_message')
- [x] Send push notification to vendor if they have push enabled
- [x] Send email notification to vendor email address
- [x] Include experience name and message preview in notification
- [x] Link notification to conversation thread

## Dev Notes

### Technical Implementation
- Component location: `src/components/messaging/MessageComposeModal.tsx`
- Button location: Experience detail page, in CTA section
- Use Radix Dialog primitive for modal

### Conversation ID Generation
```typescript
const generateConversationId = (experienceId: string, userId: string, vendorId: string) => {
  const sortedUsers = [userId, vendorId].sort();
  return `${experienceId}_${sortedUsers[0]}_${sortedUser[1]}`;
};
```

### Check for Existing Thread
```typescript
const existingThread = await db.messages
  .where('conversation_id', 'LIKE', `${experienceId}_%`)
  .where('sender_id', 'in', [userId, vendorId])
  .where('receiver_id', 'in', [userId, vendorId])
  .first()
  .execute();
```

### Send Message Logic
```typescript
const sendPreBookingMessage = async (content: string) => {
  const conversationId = generateConversationId(experienceId, userId, vendorId);

  const message = await db.messages.insert({
    conversation_id: conversationId,
    sender_id: userId,
    receiver_id: vendorId,
    experience_id: experienceId,
    content,
    sent_at: new Date(),
    is_read: false
  }).execute();

  await createNotification({
    user_id: vendorId,
    type: 'new_message',
    title: 'New message about your experience',
    body: `${userName}: ${content.substring(0, 100)}...`,
    data: { conversation_id: conversationId, message_id: message.id }
  });

  return conversationId;
};
```

### Vendor Notification
- Notification types: push (if enabled), email, in-app badge
- Email template: "New inquiry about [Experience Name]"
- Push notification: "You have a new message from [User Name]"
- Link to conversation in vendor dashboard

### Design System
- Button: Secondary variant `variant="outline" size="lg"`
- Modal: Bottom sheet on mobile, centered dialog on desktop
- Text area: `min-height: 120px`, auto-expand up to 300px
- Character counter: Gray text, turns red when approaching limit

### Error Handling
- Validate message content is not empty before sending
- Handle vendor not found error gracefully
- Show error toast if send fails: "Message failed to send. Try again."
- Implement retry mechanism with exponential backoff

### Accessibility
- Button: `aria-label="Message the operator with questions"`
- Modal: Focus trap, Escape to close
- Text area: `aria-label="Ask your question"`
- Character counter: Announced to screen readers when limit approached

## References

- [Source: planning-artifacts/epics/epic-15.md#Epic 15, Story 15.5]
- [Related: Story 15.3 - Message Thread List]
- [Related: Story 15.4 - Conversation View]
- [Database Schema: messages, notifications KV namespaces]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

