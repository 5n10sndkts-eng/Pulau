# Story 6.10: Show Cancellation Policy and Policies

Status: ready-for-dev

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

- [ ] Task 1: Create GoodToKnow component (AC: #1, #2)
  - [ ] Create `src/components/experience/GoodToKnow.tsx`
  - [ ] Accept policy data as props
  - [ ] Section header: "Good to Know" (20px, bold)
  - [ ] White card background with padding
- [ ] Task 2: Display Cancellation Policy (AC: #1)
  - [ ] Subheader: "Cancellation Policy" with calendar X icon
  - [ ] Display friendly policy text
  - [ ] Highlight key terms (e.g., "24 hours", "Full refund")
  - [ ] Handle missing policy with default text
- [ ] Task 3: Display What to Bring (AC: #1, #3)
  - [ ] Subheader: "What to Bring" with backpack icon
  - [ ] Parse comma-separated items
  - [ ] Display as bulleted list
  - [ ] Each item on own line
  - [ ] Handle empty list gracefully
- [ ] Task 4: Display Health & Safety (AC: #1, #3)
  - [ ] Subheader: "Health & Safety" with shield icon
  - [ ] Display safety notes text
  - [ ] Parse into bullet points if multiple items
  - [ ] Consider icon for COVID or special notes
  - [ ] Only show section if notes exist
- [ ] Task 5: Style and layout (AC: #2)
  - [ ] Clear visual hierarchy
  - [ ] Section dividers between subsections
  - [ ] Icon + title alignment
  - [ ] Sufficient spacing for readability
  - [ ] Mobile-friendly padding

## Dev Notes

- Cancellation policy is critical for booking confidence
- Use friendly language, avoid legal jargon
- "What to Bring" helps travelers prepare
- Health & Safety may include COVID protocols

### References

- [Source: epics.md#Story 6.10]
- [Source: prd/pulau-prd.md#Policies and Information]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

