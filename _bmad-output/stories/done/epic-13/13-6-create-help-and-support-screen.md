# Story 13.6: Create Help and Support Screen

Status: done

## Story

As a user needing assistance,
I want to access help and support,
So that I can resolve issues.

## Acceptance Criteria

### AC 1: Help Screen Display

**Given** I tap "Help & Support" from profile
**When** the help screen loads
**Then** I see sections: FAQ accordion, "Contact Us" with email link, "Live Chat" button (if implemented), "Report a Problem" form link

### AC 2: FAQ Topics

**Given** FAQ section is displayed
**When** I view the topics
**Then** I see FAQ topics: Booking, Payments, Cancellations, Account

### AC 3: FAQ Expansion

**Given** I tap a FAQ question
**When** the answer displays
**Then** answer expands below

### AC 4: Contact Email

**Given** I tap "Contact Us"
**When** the action executes
**Then** email client opens with support@pulau.app

## Tasks / Subtasks

### Task 1: Create Help Screen (AC: #1)

- [x] Create screen in `app/profile/help.tsx`
- [x] Add FAQ accordion section
- [x] Add "Contact Us" button
- [x] Add "Report a Problem" link

### Task 2: Build FAQ Accordion (AC: #2, #3)

- [x] Create FAQ data structure
- [x] Build expandable FAQ items
- [x] Categorize by topic
- [x] Implement expand/collapse animation

### Task 3: Implement Contact Actions (AC: #4)

- [x] Add email link using Linking.openURL
- [x] Optionally add live chat integration (Intercom/Zendesk)
- [x] Add problem report form

## Dev Notes

### FAQ Data

```typescript
const faqs = [
  {
    category: 'Booking',
    questions: [
      { q: 'How do I book?', a: 'Add experiences...' },
      { q: 'Can I modify?', a: 'Yes, go to...' },
    ],
  },
  // ...
];
```

### Email Link

```typescript
Linking.openURL('mailto:support@pulau.app?subject=Support%20Request');
```

## References

- [Source: planning-artifacts/epics/epic-13.md#Epic 13 - Story 13.6]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
