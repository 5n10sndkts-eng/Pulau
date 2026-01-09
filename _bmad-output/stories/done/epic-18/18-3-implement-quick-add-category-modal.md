# Story 18.3: Implement Quick Add Category Modal

Status: done

## Story

As a traveler,
I want quick access to categories from anywhere,
so that I can add experiences without extra navigation.

## Acceptance Criteria

1. **Given** I tap the Quick Add tab (center plus icon) **When** the modal opens **Then** bottom sheet slides up with category grid containing 6 category cards (same as home screen), "Quick Add to Trip" header, drag handle at top, and ability to tap outside or swipe down to dismiss
2. **When** I tap a category **Then** modal dismisses **And** I navigate to that category's bobjectse screen **And** bobjectse screen has "Back to Trip" in header (returns to trip builder)

## Tasks / Subtasks

- [x] Task 1: Create QuickAddModal component (AC: #1)
  - [x] Create `src/components/navigation/QuickAddModal.tsx`
  - [x] Implement bottom sheet with slide-up animation (framer-motion)
  - [x] Add drag handle at top (8px height, 32px width, rounded, coral/teal)
  - [x] Style with backdrop overlay (60% opacity black)
  - [x] Add "Quick Add to Trip" header text (h3, font-heading)
- [x] Task 2: Render category grid in modal (AC: #1)
  - [x] Import category data from `src/data/categories.ts`
  - [x] Render 6 category cards in 2x3 grid
  - [x] Reuse CategoryCard component from home screen
  - [x] Add proper spacing (gap-4) and padding (p-6)
- [x] Task 3: Implement modal interactions (AC: #1, #2)
  - [x] Handle tap outside to dismiss (onClick on backdrop)
  - [x] Handle swipe down gesture to dismiss (drag threshold 100px)
  - [x] Handle category tap → close modal and navigate
  - [x] Add exit animation (slide down + fade out)
- [x] Task 4: Integrate with bottom navigation (AC: #2)
  - [x] Update BottomNavigation to trigger modal on Quick Add tap
  - [x] Pass navigation handler to modal component
  - [x] Store modal open/close state in App component
- [x] Task 5: Handle category navigation (AC: #2)
  - [x] Navigate to CategoryBobjectseScreen with categoryId
  - [x] Set navigation context to indicate "from trip builder"
  - [x] Update CategoryBobjectseScreen header to show "Back to Trip" when appropriate
  - [x] "Back to Trip" should navigate to trip builder screen

## Dev Notes

- Use framer-motion for smooth slide-up/down animations
- Bottom sheet should respect safe area insets on mobile devices
- Modal should be accessible (escape key to close, focus trap)
- Category grid should match home screen styling exactly
- Follow mobile-first patterns with touch-friendly tap targets

### Project Structure Notes

- QuickAddModal is a shared navigation component
- Reuses CategoryCard component from home screen
- Integrates with existing discriminated union routing system
- Navigation state should track "backTo" context for proper return flow

### References

- [Source: planning-artifacts/epics/epic-18.md#Story 18.3]
- [Source: architecture/architecture.md#Navigation Patterns]
- [Source: architecture/architecture.md#Animation Library]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

