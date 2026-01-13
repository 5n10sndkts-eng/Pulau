## Epic 16: Mobile-First Responsive Design

**Goal:** All features work seamlessly across mobile, tablet, and desktop with responsive breakpoints, touch targets, animations, design system, typography, spacing, and accessibility compliance.

### Story 16.1: Implement Mobile-First Breakpoint System

As a developer,
I want consistent responsive breakpoints,
So that layouts adapt properly across devices.

**Acceptance Criteria:**

**Given** Tailwind CSS is configured
**When** breakpoints are applied
**Then** breakpoints follow mobile-first approach:

- Default (no prefix): mobile < 640px
- sm: >= 640px (large phones, small tablets)
- md: >= 768px (tablets)
- lg: >= 1024px (desktops)
  **And** all components use mobile-first classes
  **And** testing confirms layouts at all breakpoints
  **And** no horizontal scroll on any screen size

### Story 16.2: Ensure Touch Target Compliance

As a mobile user,
I want all interactive elements to be easily tappable,
So that I don't accidentally tap the wrong thing.

**Acceptance Criteria:**

**Given** mobile users interact via touch
**When** interactive elements are rendered
**Then** all buttons, links, and tappable areas have minimum 44x44px touch target
**And** touch targets don't overlap
**And** increased tap padding on small elements (icons, close buttons)
**And** audit tool confirms compliance
**And** Tailwind classes like `min-h-[44px] min-w-[44px]` applied where needed

### Story 16.3: Apply Bali-Inspired Design System

As a user,
I want a cohesive visual experience,
So that the app feels polished and on-brand.

**Acceptance Criteria:**

**Given** design tokens are configured
**When** components render
**Then** colors match PRD specifications:

- Primary: Deep Teal #0D7377
- Secondary/Accent: Warm Coral #FF6B6B
- Highlight: Golden Sand #F4D03F
- Success: Soft Green #27AE60
- Backgrounds: Off-white, pure white cards
  **And** typography uses:
- Headings: Plus Jakarta Sans (Bold/SemiBold)
- Body: Inter (Regular/Medium)
  **And** border radius: 12-16px cards, 8px buttons, 24px pills
  **And** shadows: subtle elevation for cards and buttons

### Story 16.4: Implement Physics-Based Animations

As a user,
I want smooth, delightful animations,
So that the app feels responsive and premium.

**Acceptance Criteria:**

**Given** Framer Motion is configured
**When** animations trigger
**Then** animations use spring physics (not linear timing):

- Quick Add fly-to-trip: 150ms ease-out
- Heart pop: 200ms bounce
- Page transitions: 300ms ease-in-out (slide)
- Success confetti: 500ms
  **And** all animations run at 60fps
  **And** AnimatePresence wraps conditional elements for exit animations
  **When** user has reduced-motion preference
  **Then** animations are disabled (prefers-reduced-motion media query)

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
