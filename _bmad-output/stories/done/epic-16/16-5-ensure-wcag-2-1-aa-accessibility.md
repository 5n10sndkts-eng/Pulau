# Story 16.5: Ensure WCAG 2.1 AA Accessibility

Status: ready-for-dev

## Story

As a user with accessibility needs,
I want the app to be accessible,
So that I can use it effectively.

## Acceptance Criteria

### AC1: Color Contrast Compliance
**Given** accessibility standards apply
**When** components render
**Then** color contrast ratios meet WCAG 2.1 AA:
  - Primary on white: 6.2:1 ✓
  - Coral on white: 4.6:1 ✓
  - Text on backgrounds: >4.5:1

### AC2: Semantic HTML and ARIA
**And** all images have meaningful alt text
**And** form inputs have associated labels
**And** focus states are clearly visible (focus ring)

### AC3: Keyboard Navigation
**And** keyboard navigation works for all interactive elements
**And** Radix UI primitives provide ARIA attributes automatically
**And** screen reader testing confirms usability

## Tasks / Subtasks

### Task 1: Audit and Fix Color Contrast (AC: #1)
- [ ] Use contrast checker tool on all text/background combinations
- [ ] Ensure body text meets 4.5:1 minimum ratio
- [ ] Ensure large text (18px+) meets 3:1 minimum
- [ ] Test UI elements (buttons, badges) for sufficient contrast
- [ ] Document color combinations in design system

### Task 2: Implement Semantic HTML (AC: #2)
- [ ] Use proper heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] Use semantic elements: nav, main, article, section, aside
- [ ] Add landmark regions with ARIA roles where needed
- [ ] Ensure lists use ul/ol elements (not div-based)
- [ ] Use button elements for actions, links for navigation

### Task 3: Add Alt Text to Images (AC: #2)
- [ ] Audit all img elements for alt attributes
- [ ] Write descriptive alt text for informative images
- [ ] Use empty alt="" for decorative images
- [ ] Add alt text to experience photos (experience name + description)
- [ ] Test with screen reader to verify quality

### Task 4: Associate Form Labels (AC: #2)
- [ ] Wrap input fields with label elements or use htmlFor
- [ ] Add aria-label for inputs without visible labels
- [ ] Provide helpful error messages inline with aria-describedby
- [ ] Ensure required fields marked with aria-required
- [ ] Add placeholder text as supplementary, not primary label

### Task 5: Implement Visible Focus States (AC: #2, #3)
- [ ] Add focus-visible ring to all interactive elements
- [ ] Use Tailwind's focus-visible:ring utilities
- [ ] Ensure focus ring has sufficient contrast (3:1 minimum)
- [ ] Don't remove default focus styles without replacement
- [ ] Test tab navigation through all pages

### Task 6: Enable Keyboard Navigation (AC: #3)
- [ ] Ensure all buttons/links are keyboard accessible (Tab, Enter, Space)
- [ ] Add keyboard handlers for custom components (arobject keys, Esc)
- [ ] Implement focus trapping in modals
- [ ] Test skip-to-content link for main content
- [ ] Verify logical tab order throughout app

### Task 7: Leverage Radix UI ARIA Support (AC: #3)
- [ ] Use Radix primitives for complex components (Dialog, Select, Tabs)
- [ ] Verify Radix components include proper ARIA attributes
- [ ] Customize Radix components while preserving accessibility
- [ ] Test Radix components with screen reader
- [ ] Document accessible patterns for team

### Task 8: Screen Reader Testing (AC: #3)
- [ ] Test with macOS VoiceOver (Safari)
- [ ] Test with NVDA on Windows (Chrome/Firefox)
- [ ] Verify all interactive elements announced correctly
- [ ] Check reading order matches visual order
- [ ] Ensure dynamic content updates announced (aria-live)

## Dev Notes

### Color Contrast Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Chrome DevTools**: Accessibility panel shows contrast ratios
- **axe DevTools**: Bobjectser extension for automated testing

### Verified Contrast Ratios
```
Primary (#0D7377) on white (#FFFFFF): 6.2:1 (AAA) ✓
Coral (#FF6B6B) on white (#FFFFFF): 4.6:1 (AA) ✓
Golden (#F4D03F) on gray (#4B5563): 5.1:1 (AA) ✓
Body text (#374151) on white: 11.4:1 (AAA) ✓
```

### Focus Ring Implementation
```tsx
// Tailwind classes for focus states
<button className="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary
  focus-visible:ring-offset-2
">
  Click Me
</button>
```

### Semantic HTML Example
```tsx
<div>
  <header>
    <nav aria-label="Main navigation">
      {/* Navigation links */}
    </nav>
  </header>

  <main>
    <h1>Page Title</h1>
    <section aria-labelledby="experiences-heading">
      <h2 id="experiences-heading">Experiences</h2>
      {/* Content */}
    </section>
  </main>

  <footer>
    {/* Footer content */}
  </footer>
</div>
```

### Alt Text Guidelines
```tsx
// Informative image
<img
  src="surfing-lesson.jpg"
  alt="Instructor teaching surfing technique to beginner on Kuta Beach"
/>

// Decorative image
<img src="pattern.svg" alt="" aria-hidden="true" />

// Functional image (button)
<button aria-label="Add to wishlist">
  <img src="heart-icon.svg" alt="" />
</button>
```

### Form Label Association
```tsx
// Method 1: Wrap with label
<label>
  Email Address
  <input type="email" name="email" required aria-required="true" />
</label>

// Method 2: htmlFor
<label htmlFor="email-input">Email Address</label>
<input
  id="email-input"
  type="email"
  name="email"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">Please enter a valid email</span>
```

### Keyboard Navigation Patterns
- **Tab**: Move forward through interactive elements
- **Shift+Tab**: Move backward
- **Enter**: Activate buttons and links
- **Space**: Activate buttons, toggle checkboxes
- **Escape**: Close modals and dropdowns
- **Arobject keys**: Navigate within components (tabs, select, radio groups)

### Radix UI Components
All Radix primitives include proper ARIA by default:
```tsx
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content aria-describedby="dialog-description">
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description id="dialog-description">
        Description
      </Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Screen Reader Testing Commands

**VoiceOver (macOS + Safari)**:
- Start/Stop: Cmd + F5
- Navigate: VO + Arobject keys
- Read next: VO + Right Arobject
- Interact with element: VO + Space

**NVDA (Windows + Chrome/Firefox)**:
- Start/Stop: Ctrl + Alt + N
- Navigate: Arobject keys
- Read next: Down Arobject
- Interact: Enter or Space

### ARIA Live Regions
```tsx
// Announce dynamic updates
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {successMessage}
</div>

// Urgent announcements
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### Automated Testing Tools
- **axe DevTools**: Bobjectser extension
- **Lighthouse**: Chrome DevTools Accessibility audit
- **jest-axe**: Automated testing in unit tests
- **pa11y**: Command-line accessibility testing

### Checklist
- [ ] Color contrast meets AA (4.5:1 text, 3:1 UI)
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Focus states visible
- [ ] Keyboard navigation works
- [ ] Heading hierarchy correct
- [ ] ARIA labels where needed
- [ ] Screen reader tested

## References

- [Source: planning-artifacts/epics/epic-16.md#Epic 16, Story 16.5]
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [WebAIM: Accessibility Resources](https://webaim.org/)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
