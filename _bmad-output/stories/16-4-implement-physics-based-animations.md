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
