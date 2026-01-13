### Story 16.5: Ensure WCAG 2.1 AA Accessibility

As a user with accessibility needs,
I want the app to be accessible,
So that I can use it effectively.

**Acceptance Criteria:**

**Given** accessibility standards apply
**When** components render
**Then** color contrast ratios meet WCAG 2.1 AA:

- Primary on white: 6.2:1 ✓
- Coral on white: 4.6:1 ✓
- Text on backgrounds: >4.5:1
  **And** all images have meaningful alt text
  **And** form inputs have associated labels
  **And** focus states are clearly visible (focus ring)
  **And** keyboard navigation works for all interactive elements
  **And** Radix UI primitives provide ARIA attributes automatically
  **And** screen reader testing confirms usability

---
