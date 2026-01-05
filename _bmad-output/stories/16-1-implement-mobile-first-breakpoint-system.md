# Story 16.1: Implement Mobile-First Breakpoint System

Status: ready-for-dev

## Story

As a developer,
I want consistent responsive breakpoints,
So that layouts adapt properly across devices.

## Acceptance Criteria

### AC1: Tailwind Breakpoint Configuration
**Given** Tailwind CSS is configured
**When** breakpoints are applied
**Then** breakpoints follow mobile-first approach:
  - Default (no prefix): mobile < 640px
  - sm: >= 640px (large phones, small tablets)
  - md: >= 768px (tablets)
  - lg: >= 1024px (desktops)

### AC2: Component Implementation
**And** all components use mobile-first classes
**And** testing confirms layouts at all breakpoints
**And** no horizontal scroll on any screen size

## Tasks / Subtasks

### Task 1: Configure Tailwind Breakpoints (AC: #1)
- [ ] Update tailwind.config.js with mobile-first breakpoint definitions
- [ ] Document breakpoint usage in design system documentation
- [ ] Create breakpoint reference guide for developers
- [ ] Verify breakpoints align with common device widths
- [ ] Test breakpoint values in browser dev tools

### Task 2: Implement Mobile-First Component Classes (AC: #2)
- [ ] Audit all components for responsive class usage
- [ ] Refactor components to use mobile-first approach (base styles first, then sm:, md:, lg:)
- [ ] Replace any max-width media queries with min-width approach
- [ ] Apply responsive utilities consistently (spacing, typography, layout)
- [ ] Document responsive patterns in component library

### Task 3: Create Responsive Layout Utilities (AC: #2)
- [ ] Build responsive grid system using Tailwind grid classes
- [ ] Create responsive container components with max-width constraints
- [ ] Add responsive padding/margin utilities for consistent spacing
- [ ] Implement responsive flex layouts for common patterns
- [ ] Create responsive visibility utilities (hide-on-mobile, show-on-desktop)

### Task 4: Test Across All Breakpoints (AC: #2)
- [ ] Test layouts at 320px (iPhone SE), 375px (iPhone 12), 428px (iPhone 14 Pro Max)
- [ ] Test at 640px (sm breakpoint), 768px (md breakpoint), 1024px (lg breakpoint)
- [ ] Verify no horizontal scroll at any width
- [ ] Check touch target sizes remain compliant at all breakpoints
- [ ] Test orientation changes (portrait to landscape)

### Task 5: Prevent Horizontal Scroll Issues (AC: #2)
- [ ] Add `overflow-x-hidden` to body if needed
- [ ] Ensure images use `max-w-full` to prevent overflow
- [ ] Check for fixed-width elements that don't respect container
- [ ] Validate grid/flex layouts don't cause overflow
- [ ] Test with browser zoom levels (100%, 125%, 150%)

## Dev Notes

### Tailwind Configuration
File: `tailwind.config.js`
```javascript
module.exports = {
  theme: {
    screens: {
      'sm': '640px',  // Large phones, small tablets
      'md': '768px',  // Tablets
      'lg': '1024px', // Desktops
      'xl': '1280px', // Large desktops (optional)
    },
  },
};
```

### Mobile-First Pattern Examples
```jsx
// Base styles for mobile, override with larger breakpoints
<div className="
  px-4 py-2                 // Mobile: 16px horizontal, 8px vertical
  sm:px-6 sm:py-3           // Small: 24px horizontal, 12px vertical
  md:px-8 md:py-4           // Medium: 32px horizontal, 16px vertical
  lg:px-12 lg:py-6          // Large: 48px horizontal, 24px vertical
">
  Content
</div>

// Grid layout responsive
<div className="
  grid grid-cols-1          // Mobile: 1 column
  sm:grid-cols-2            // Small: 2 columns
  md:grid-cols-3            // Medium: 3 columns
  lg:grid-cols-4            // Large: 4 columns
  gap-4
">
  Items
</div>
```

### Common Responsive Patterns
- **Cards**: Full width on mobile, grid on tablet+
- **Navigation**: Hamburger on mobile, full menu on desktop
- **Images**: Full width on mobile, constrained on desktop
- **Typography**: Smaller on mobile, larger on desktop (responsive text utilities)

### Testing Devices Reference
- **Mobile**: 320px-639px (iPhone SE, standard phones)
- **Small**: 640px-767px (large phones, small tablets)
- **Medium**: 768px-1023px (tablets, landscape phones)
- **Large**: 1024px+ (desktops, large tablets)

### Preventing Horizontal Scroll
- Use `max-w-full` on images: `<img className="max-w-full h-auto" />`
- Constrain containers: `<div className="max-w-7xl mx-auto px-4">`
- Avoid fixed widths: Use `w-full` instead of `w-[500px]`
- Test with `box-sizing: border-box` (default in Tailwind)

### Accessibility Considerations
- Ensure touch targets remain 44x44px minimum at all breakpoints
- Test font sizes scale appropriately (minimum 16px for body text)
- Verify color contrast remains compliant at all sizes
- Ensure keyboard navigation works across all layouts

## References

- [Source: epics.md#Epic 16, Story 16.1]
- [Tailwind Docs: Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Design System: Breakpoints and Spacing]
- [Related: Story 16.2 - Touch Target Compliance]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
