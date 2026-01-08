# Story 15.4: Build Messaging Conversation View

Status: ready-for-dev

## Story

As a vendor or traveler,
I want to send and receive messages about a booking,
So that I can coordinate special requests.

## Acceptance Criteria

### AC1: Conversation View Display
**Given** I tap a message thread
**When** the conversation view loads
**Then** I see:
  - Header: other party name, experience title
  - Message bubbles: my messages (right, teal), their messages (left, gray)
  - Each message shows: text, timestamp, read receipt (✓✓)
  - Text input at bottom with send button

### AC2: Send Message Functionality
**When** I type and tap send
**Then** message saves to messages KV namespace (sender_id, receiver_id, conversation_id, content, sent_at)
**And** message appears immediately in my view
**And** message delivers to other party (real-time if online, otherwise on next load)

### AC3: Receive Messages
**When** other party sends a message
**Then** it appears in my view (poll every 10 seconds, or websocket if implemented)

## Tasks / Subtasks

### Task 1: Build Conversation View UI (AC: #1)
- [ ] Create ConversationView component with header, message list, input footer
- [ ] Design message bubbles (sent: teal right-aligned, received: gray left-aligned)
- [ ] Add header with back button, other party name, experience title
- [ ] Display timestamp below each message (small gray text)
- [ ] Implement read receipt indicators (single check: sent, double check: read)

### Task 2: Load and Display Messages (AC: #1)
- [ ] Query messages KV namespace by conversation_id, ordered by sent_at ASC
- [ ] Render message bubbles in scrollable container
- [ ] Auto-scroll to bottom on initial load and new messages
- [ ] Group messages by date with date separators ("Today", "Yesterday", date)
- [ ] Show sender's avatar next to received messages

### Task 3: Implement Send Message Logic (AC: #2)
- [ ] Build MessageInput component with text area and send button
- [ ] On send, insert message into messages KV namespace with metadata
- [ ] Clear input field after successful send
- [ ] Add message to local state optimistically (before server confirms)
- [ ] Show sending indicator (spinner) until server confirms

### Task 4: Real-time Message Delivery (AC: #2, #3)
- [ ] Implement polling mechanism (fetch new messages every 10 seconds)
- [ ] Alternative: Set up WebSocket or SSE for real-time push
- [ ] Update conversation view when new messages arrive
- [ ] Mark messages as read when viewed (update is_read = true)
- [ ] Trigger notification badge update in thread list

### Task 5: Handle Edge Cases and Accessibility (AC: #1, #2, #3)
- [ ] Handle empty conversation state (no messages yet)
- [ ] Prevent sending empty messages (disable send button if blank)
- [ ] Show error toast if message send fails with retry option
- [ ] Ensure text input expands for multiline messages (max 5 lines)
- [ ] Add ARIA labels for message bubbles and input field

## Dev Notes

### Technical Implementation
- Component location: `src/components/messaging/ConversationView.tsx`
- Message query pattern:
```typescript
const messages = await db.messages
  .where('conversation_id', '=', conversationId)
  .orderBy('sent_at', 'asc')
  .join('users', 'users.id', '=', 'messages.sender_id')
  .select(['messages.*', 'users.name as sender_name', 'users.avatar_url'])
  .execute();
```

### Send Message Mutation
```typescript
const newMessage = await db.messages.insert({
  conversation_id: conversationId,
  sender_id: currentUserId,
  receiver_id: otherPartyId,
  experience_id: experienceId,
  content: messageText,
  sent_at: new Date(),
  is_read: false
}).execute();
```

### Polling Strategy
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const newMessages = await fetchNewMessages(lastMessageId);
    if (newMessages.length > 0) {
      setMessages(prev => [...prev, ...newMessages]);
      markMessagesAsRead(newMessages);
    }
  }, 10000); // Poll every 10 seconds
  return () => clearInterval(interval);
}, [conversationId, lastMessageId]);
```

### Read Receipt Logic
- Single check (✓): Message sent successfully (exists in Spark KV store)
- Double check (✓✓): Message read by receiver (is_read = true)
- Update is_read when:
  - Receiver opens conversation view
  - Receiver scrolls message into viewport

### Design System
- Sent message bubble: `bg-teal-500 text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl` (no bottom-right radius)
- Received message bubble: `bg-gray-100 text-gray-900 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl`
- Message timestamp: `text-xs text-gray-500 mt-1`
- Input field: Rounded pill with send icon button (PaperPlaneIcon)

### Message Grouping
- Group consecutive messages from same sender (no avatar/name repeat)
- Add date separator when day changes:
  ```typescript
  if (prevMessage && !isSameDay(message.sent_at, prevMessage.sent_at)) {
    renderDateSeparator(message.sent_at);
  }
  ```

### Accessibility
- Message bubbles: `role="log"` for auto-announcing new messages
- Input field: `aria-label="Type your message"`
- Send button: `aria-label="Send message"`, disabled when empty
- Keyboard: Enter to send (Shift+Enter for new line)

### Performance Optimization
- Virtual scrolling for long conversations (react-window)
- Cache messages with Spark useKV
- Optimistic UI updates for instant feedback
- Debounce typing indicators (future enhancement)

## References

- [Source: planning-artifacts/epics/epic-15.md#Epic 15, Story 15.4]
- [Related: Story 15.3 - Message Thread List]
- [Related: Story 15.5 - Pre-Booking Questions]
- [Database Schema: messages KV namespace]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
