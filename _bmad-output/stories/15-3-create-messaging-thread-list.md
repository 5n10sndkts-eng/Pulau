# Story 15.3: Create Messaging Thread List

Status: ready-for-dev

## Story

As a vendor or traveler,
I want to see all my message conversations,
So that I can communicate about bookings.

## Acceptance Criteria

### AC1: Messages Screen Navigation
**Given** I navigate to "Messages" (inbox icon in header)
**When** the messages screen loads
**Then** I see list of conversation threads

### AC2: Thread List Display
**And** each thread shows:
  - Other party's name and photo
  - Experience name (context)
  - Last message preview (truncated)
  - Timestamp
  - Unread badge (if new messages)
**And** threads sorted by last_message_at DESC
**And** threads load from messages table grouped by conversation_id

### AC3: Thread Navigation
**When** I tap a thread
**Then** I open the full conversation view

## Tasks / Subtasks

### Task 1: Build Message Thread List Component (AC: #1, #2)
- [ ] Create MessageThreadList component with scrollable list container
- [ ] Build ThreadListItem component showing avatar, names, preview, timestamp
- [ ] Implement unread badge indicator (count of unread messages)
- [ ] Add empty state for users with no conversations
- [ ] Apply mobile-first responsive layout

### Task 2: Query and Group Conversation Threads (AC: #2)
- [ ] Query messages table, group by conversation_id
- [ ] Join with users table to get other party's name and photo
- [ ] Join with experiences table to get experience context
- [ ] Get last message per conversation (MAX(sent_at) or latest record)
- [ ] Sort threads by last_message_at DESC

### Task 3: Display Thread Metadata (AC: #2)
- [ ] Show other party's avatar (circular, 48px) and full name
- [ ] Display experience name as subtitle/context (gray text)
- [ ] Truncate last message preview to 60 characters with ellipsis
- [ ] Format timestamp as relative time ("2m ago", "1h ago", "Yesterday")
- [ ] Add unread badge (coral circle with count) if has_unread = true

### Task 4: Implement Thread Navigation (AC: #3)
- [ ] Add tap handler to each ThreadListItem
- [ ] Navigate to ConversationView with conversation_id parameter
- [ ] Mark thread as read when opened (update unread_count to 0)
- [ ] Apply active/pressed state styling on tap
- [ ] Pass experience context to conversation view

### Task 5: Optimize Performance and Accessibility (AC: #1, #2, #3)
- [ ] Implement virtual scrolling for long thread lists (react-window)
- [ ] Cache thread list data with Spark useKV (refresh every 30s)
- [ ] Add pull-to-refresh gesture on mobile
- [ ] Ensure 44x44px touch targets for each thread item
- [ ] Add ARIA labels for screen readers (unread count, timestamp)

## Dev Notes

### Technical Implementation
- Component location: `src/components/messaging/MessageThreadList.tsx`
- Use Spark useKV for caching thread list queries
- Database query pattern:
```typescript
const threads = await db.messages
  .select([
    'conversation_id',
    'MAX(sent_at) as last_message_at',
    'content as last_message',
    db.raw('COUNT(CASE WHEN is_read = false AND receiver_id = ? THEN 1 END) as unread_count', [currentUserId])
  ])
  .where('sender_id', '=', currentUserId)
  .orWhere('receiver_id', '=', currentUserId)
  .groupBy('conversation_id')
  .join('users', 'users.id', '=', db.raw('CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END', [currentUserId]))
  .join('experiences', 'experiences.id', '=', 'messages.experience_id')
  .orderBy('last_message_at', 'desc')
  .execute();
```

### Conversation Grouping
- conversation_id format: `{experience_id}_{user1_id}_{user2_id}` (alphabetically sorted user IDs)
- Determine "other party" based on current user: if sender_id = me, other = receiver_id, else other = sender_id
- Unread messages: WHERE receiver_id = currentUserId AND is_read = false

### Relative Timestamp Formatting
```typescript
const formatRelativeTime = (timestamp: Date) => {
  const diff = Date.now() - timestamp.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return timestamp.toLocaleDateString();
};
```

### Design System
- Thread item: Card with `hover:bg-gray-50` effect
- Avatar: 48px circular image with fallback initials
- Unread badge: Coral (`bg-coral-500`) circle, white text, positioned top-right
- Last message preview: Gray text (`text-gray-600`), truncated with `line-clamp-1`
- Timestamp: Small gray text (`text-sm text-gray-500`)

### Empty State
- Icon: InboxIcon (lucide-react)
- Message: "No conversations yet"
- CTA: "Browse experiences to start messaging operators"

### Accessibility
- Each thread item is a focusable button with full thread info in aria-label
- Unread badge announced: "X unread messages"
- Keyboard navigation: Tab through threads, Enter to open
- Focus ring visible on keyboard navigation

## References

- [Source: epics.md#Epic 15, Story 15.3]
- [Related: Story 15.4 - Messaging Conversation View]
- [Database Schema: messages, users, experiences tables]
- [Design: Message Thread UI Pattern]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
