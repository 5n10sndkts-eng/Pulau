# Story 6.10: Show Cancellation Policy and Policies

Status: done

## Story

As a traveler,
I want to understand the cancellation policy,
so that I know my options if plans change.

## Acceptance Criteria

1. **Given** I am on an experience detail page **When** I scroll to "Good to Know" section **Then** I see subsections:
   - **Cancellation Policy**: Friendly language (from experiences.cancellation_policy), e.g., "Free cancellation up to 24 hours before. Full refund, no questions asked."
   - **What to Bring**: Comma-separated list (from experiences.what_to_bring), e.g., "Sunscreen, swimwear, camera"
   - **Health & Safety**: Any relevant notes (from experiences.health_safety_notes)
2. Section has clear typography hierarchy (title 20px bold, content 16px regular)
3. Policies display with bullet points for easy scanning

## Tasks / Subtasks

- [x] Task 1: Create GoodToKnow component (AC: #1, #2)
  - [x] Create `src/components/experience/GoodToKnow.tsx`
  - [x] Accept policy data as props
  - [x] Section header: "Good to Know" (20px, bold)
  - [x] White card background with padding
- [x] Task 2: Display Cancellation Policy (AC: #1)
  - [x] Subheader: "Cancellation Policy" with calendar X icon
  - [x] Display friendly policy text
  - [x] Highlight key terms (e.g., "24 hours", "Full refund")
  - [x] Handle missing policy with default text
- [x] Task 3: Display What to Bring (AC: #1, #3)
  - [x] Subheader: "What to Bring" with backpack icon
  - [x] Parse comma-separated items
  - [x] Display as bulleted list
  - [x] Each item on own line
  - [x] Handle empty list gracefully
- [x] Task 4: Display Health & Safety (AC: #1, #3)
  - [x] Subheader: "Health & Safety" with shield icon
  - [x] Display safety notes text
  - [x] Parse into bullet points if multiple items
  - [x] Consider icon for COVID or special notes
  - [x] Only show section if notes exist
- [x] Task 5: Style and layout (AC: #2)
  - [x] Clear visual hierarchy
  - [x] Section dividers between subsections
  - [x] Icon + title alignment
  - [x] Sufficient spacing for readability
  - [x] Mobile-friendly padding

## Dev Notes

- Cancellation policy is critical for booking confidence
- Use friendly language, avoid legal jargon
- "What to Bring" helps travelers prepare
- Health & Safety may include COVID protocols

### References

- [Source: planning-artifacts/epics/epic-06.md#Story 6.10]
- [Source: prd/pulau-prd.md#Policies and Information]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

