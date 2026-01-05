# Story 1.2: Configure Tailwind CSS Design System

Status: review

## Story

As a developer,
I want Tailwind CSS 4.1.11 configured with the Bali-inspired design tokens,
so that all UI components follow the consistent design system.

## Acceptance Criteria

1. **Given** the initialized project from Story 1.1 **When** Tailwind CSS is configured with Vite plugin **Then** tailwind.config.js includes custom color palette (Deep Teal #0D7377, Warm Coral #FF6B6B, Golden Sand #F4D03F, Success #27AE60)
2. Custom fonts are configured (Plus Jakarta Sans, Inter)
3. Mobile-first breakpoints are set (sm: 640px, md: 768px, lg: 1024px)
4. Spacing system with 4px base unit is configured
5. Border radius tokens (12-16px cards, 8px buttons, 24px pills) are defined
6. A test component renders with Tailwind classes successfully

## Tasks / Subtasks

- [x] Task 1: Configure Tailwind color palette (AC: #1)
  - [x] Add Deep Teal #0D7377 as primary
  - [x] Add Warm Coral #FF6B6B as accent
  - [x] Add Golden Sand #F4D03F as highlight
  - [x] Add Success #27AE60
- [x] Task 2: Set up typography (AC: #2)
  - [x] Install Plus Jakarta Sans font
  - [x] Install Inter font
  - [x] Configure font families in Tailwind
- [x] Task 3: Configure breakpoints (AC: #3)
  - [x] Set sm: 640px, md: 768px, lg: 1024px
- [x] Task 4: Set up spacing and radius (AC: #4, #5)
  - [x] Configure 4px base spacing unit
  - [x] Add border radius tokens
- [x] Task 5: Create test component (AC: #6)
  - [x] Render component with design tokens
  - [x] Verify styles apply correctly

## Dev Notes

- Use OKLCH color values for consistency with PRD
- Tailwind 4.1.11 with Vite plugin (@tailwindcss/vite)

### References

- [Source: prd/pulau-prd.md#Color Selection]
- [Source: prd/pulau-prd.md#Font Selection]

## Dev Agent Record

### Agent Model Used
Claude 3.7 Sonnet (2026-01-05)

### Debug Log References
- Configured Bali-inspired color palette using OKLCH color space
- Added custom border radius tokens for cards, buttons, and pills
- Set up mobile-first breakpoints
- Verified fonts were already loaded in index.html

### Completion Notes List
1. ✅ Configured Bali-inspired color palette with OKLCH values
   - Primary: Deep Teal `oklch(0.48 0.09 210)` #0D7377
   - Accent: Warm Coral `oklch(0.68 0.17 25)` #FF6B6B
   - Highlight: Golden Sand `oklch(0.87 0.12 85)` #F4D03F
   - Success: Soft Green `oklch(0.65 0.14 155)` #27AE60
2. ✅ Typography configured with Plus Jakarta Sans (display) and Inter (body)
3. ✅ Fonts already loaded via Google Fonts in index.html
4. ✅ Mobile-first breakpoints set: sm: 640px, md: 768px, lg: 1024px
5. ✅ Border radius tokens: card (12px), button (8px), pill (24px)
6. ✅ 4px base spacing unit maintained via CSS variables
7. ✅ Created DesignSystemTest component for visual verification
8. ✅ All design system tests pass (11/11)
9. ✅ Production build succeeds
10. ✅ ESLint passes with 0 errors

### File List
- tailwind.config.js (modified: added Bali color palette, custom border radius, font families, breakpoints)
- src/components/DesignSystemTest.tsx (new: visual test component)
- src/__tests__/tailwind.test.ts (new: 11 design system configuration tests)

## Change Log

- 2026-01-05: Configured Bali-inspired Tailwind CSS design system
  - Added OKLCH color palette (primary, accent, highlight, success)
  - Configured custom border radius tokens (card, button, pill)
  - Set up mobile-first breakpoints (sm, md, lg)
  - Added font family configuration (Plus Jakarta Sans, Inter)
  - Created visual test component and automated tests
  - All tests pass, build succeeds

