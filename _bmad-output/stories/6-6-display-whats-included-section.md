### Story 6.6: Display "What's Included" Section

As a traveler viewing an experience,
I want to see what's included in the price,
So that I know what I'm paying for.

**Acceptance Criteria:**

**Given** I am on an experience detail page from Story 6.5
**When** I scroll to "What's Included" section
**Then** I see two subsections:

- "What's Included" with green checkmarks (✓)
- "Not Included" with X marks (✗)
  **And** included items load from experience_inclusions where is_included = true
  **And** excluded items load from experience_inclusions where is_included = false
  **And** each item displays as a list item with icon and text
  **And** section has white card background with 20px padding
  **And** items are displayed in the order they were added by vendor
