# Story 17.1: Create Empty State Components

Status: ready-for-dev

## Story

As a user with no data,
I want to see helpful empty states,
So that I know what to do next.

## Acceptance Criteria

### AC1: Empty State Rendering
**Given** a list/screen has no data
**When** empty state renders
**Then** appropriate illustration and messaging displays:
  - Empty Trip: suitcase illustration, "Your trip canvas is empty", "Start Exploring" CTA
  - No Search Results: magnifying glass, "No experiences match '[query]'", "Try different keywords" + "Clear Filters"
  - Empty Wishlist: heart outline, "Your wishlist is empty", "Browse Experiences" CTA
  - No Bookings: calendar, "No upcoming trips", "Plan Your Adventure" CTA
  - No Filter Results: filter icon, "No experiences match these filters", "Clear Filters" button

### AC2: Call-to-Action Navigation
**And** CTAs navigate to appropriate screens
**And** illustrations are lightweight SVGs

## Tasks / Subtasks

### Task 1: Create Empty State Component System (AC: #1)
- [ ] Build reusable EmptyState component with props for icon, title, description, CTA
- [ ] Create EmptyStateIllustration component for SVG icons
- [ ] Design 5 empty state variants (trip, search, wishlist, bookings, filters)
- [ ] Apply consistent spacing and typography from design system
- [ ] Ensure mobile-first responsive layout

### Task 2: Design Empty Trip State (AC: #1, #2)
- [ ] Add suitcase SVG illustration (lightweight, ~2KB)
- [ ] Set title: "Your trip canvas is empty"
- [ ] Add description: "Start adding experiences to build your perfect Bali adventure"
- [ ] Include "Start Exploring" CTA button navigating to explore screen
- [ ] Use teal primary button styling

### Task 3: Design No Search Results State (AC: #1, #2)
- [ ] Add magnifying glass SVG illustration
- [ ] Dynamic title: "No experiences match '[query]'"
- [ ] Add suggestions: "Try different keywords or broaden your search"
- [ ] Include "Clear Filters" button (if filters applied)
- [ ] Show "Browse All Experiences" secondary CTA

### Task 4: Design Empty Wishlist State (AC: #1, #2)
- [ ] Add heart outline SVG illustration
- [ ] Set title: "Your wishlist is empty"
- [ ] Add description: "Save experiences you love to plan your trip later"
- [ ] Include "Browse Experiences" CTA navigating to explore
- [ ] Use secondary button styling

### Task 5: Design No Bookings State (AC: #1, #2)
- [ ] Add calendar SVG illustration
- [ ] Set title: "No upcoming trips"
- [ ] Add description: "Book your first experience and start your adventure"
- [ ] Include "Plan Your Adventure" CTA navigating to home
- [ ] Show inspirational message

### Task 6: Design No Filter Results State (AC: #1, #2)
- [ ] Add filter/funnel SVG illustration
- [ ] Set title: "No experiences match these filters"
- [ ] Add description: "Try adjusting your filters or browse all experiences"
- [ ] Include "Clear Filters" button to reset filters
- [ ] Show current filter count

### Task 7: Optimize Illustrations (AC: #2)
- [ ] Create lightweight SVG illustrations (<5KB each)
- [ ] Use simple line art with brand colors (teal, coral)
- [ ] Ensure illustrations scale well on all screen sizes
- [ ] Add proper viewBox and preserveAspectRatio attributes
- [ ] Optimize SVGs with SVGO tool

## Dev Notes

### Component Structure
File: `src/components/ui/EmptyState.tsx`
```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon, title, description, primaryAction, secondaryAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-32 h-32 mb-6 text-gray-300">
        {icon}
      </div>
      <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="font-body text-base text-gray-600 mb-8 max-w-md">
          {description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="btn-primary"
          >
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="btn-secondary"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
};
```

### Usage Examples

**Empty Trip**:
```tsx
<EmptyState
  icon={<SuitcaseIcon />}
  title="Your trip canvas is empty"
  description="Start adding experiences to build your perfect Bali adventure"
  primaryAction={{
    label: "Start Exploring",
    onClick: () => navigate({ type: 'explore' })
  }}
/>
```

**No Search Results**:
```tsx
<EmptyState
  icon={<SearchIcon />}
  title={`No experiences match "${searchQuery}"`}
  description="Try different keywords or broaden your search"
  primaryAction={{
    label: "Clear Filters",
    onClick: () => clearFilters()
  }}
  secondaryAction={{
    label: "Browse All",
    onClick: () => navigate({ type: 'explore' })
  }}
/>
```

**Empty Wishlist**:
```tsx
<EmptyState
  icon={<HeartIcon />}
  title="Your wishlist is empty"
  description="Save experiences you love to plan your trip later"
  primaryAction={{
    label: "Browse Experiences",
    onClick: () => navigate({ type: 'explore' })
  }}
/>
```

### SVG Illustrations
Store in `src/assets/illustrations/`

Example optimized SVG:
```svg
<!-- suitcase-empty.svg -->
<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="24" y="48" width="80" height="64" rx="4" stroke="currentColor" stroke-width="2"/>
  <path d="M48 48V32a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v16" stroke="currentColor" stroke-width="2"/>
  <line x1="24" y1="64" x2="104" y2="64" stroke="currentColor" stroke-width="2"/>
</svg>
```

### Design Tokens
- Icon size: 128px (w-32 h-32)
- Icon color: text-gray-300 (light gray)
- Title: font-heading text-2xl font-semibold text-gray-900
- Description: font-body text-base text-gray-600
- Max width for description: 448px (max-w-md)
- Vertical spacing: py-12 (48px top/bottom padding)

### Accessibility
- Illustrations use `role="img"` and `aria-label` for screen readers
- Focus management: Primary CTA gets auto-focus when empty state displays
- Keyboard navigation: Tab through CTAs, Enter to activate
- ARIA live region announces empty state changes

## References

- [Source: epics.md#Epic 17, Story 17.1]
- [Design: Empty State Patterns]
- [Related: All list/collection screens]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
