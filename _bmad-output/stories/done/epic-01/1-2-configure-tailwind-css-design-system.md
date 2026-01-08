# Story 1.2: Configure Tailwind CSS Design System

Status: done

## Story

As a developer,
I want Tailwind CSS 4.1.11 configured with the Bali-inspired design tokens,
so that all UI components follow the consistent design system.

## Acceptance Criteria

1. **Given** the initialized project from Story 1.1 **When** Tailwind CSS is configured with Vite plugin **Then** tailwind.config.js includes custom color palette (Deep Teal #0D7377 as primary, Warm Coral #FF6B6B as secondary/coral, Golden Sand #F4D03F as secondary/sand, Success #27AE60)
2. Custom fonts are configured (Plus Jakarta Sans, Inter, Caveat)
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

- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Color Selection]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Font Selection]

## Dev Agent Record

### Agent Model Used
Claude 3.7 Sonnet (2026-01-05)

### Debug Log References
- Configured Bali-inspired color palette using OKLCH color space
- Added custom border radius tokens for cards, buttons, and pills
- Set up mobile-first breakpoints
- Verified fonts were already loaded in index.html
- Fixed duplicate `accent` color key conflict with Radix UI (renamed to `coral` and `sand`)
- Updated all components using old color names to new semantic names
- Added Caveat font test for PRD compliance

### Completion Notes List
1. ✅ Configured Bali-inspired color palette with OKLCH values
   - Primary: Deep Teal `oklch(0.48 0.09 210)` #0D7377
   - Coral (secondary): Warm Coral `oklch(0.68 0.17 25)` #FF6B6B
   - Sand (secondary): Golden Sand `oklch(0.87 0.12 85)` #F4D03F
   - Success: Soft Green `oklch(0.65 0.14 155)` #27AE60
2. ✅ Typography configured with Plus Jakarta Sans (display), Inter (body), and Caveat (accent)
3. ✅ Fonts already loaded via Google Fonts in index.html
4. ✅ Mobile-first breakpoints set: sm: 640px, md: 768px, lg: 1024px
5. ✅ Border radius tokens: card (12px), button (8px), pill (24px)
6. ✅ 4px base spacing unit maintained via CSS variables
7. ✅ Created DesignSystemTest component for visual verification
8. ✅ All design system tests pass (12/12) including Caveat font validation
9. ✅ Production build succeeds
10. ✅ ESLint passes with 0 errors (4 warnings in UI components)
11. ✅ Color names aligned with PRD terminology (coral/sand as secondary colors)

### File List
- tailwind.config.js (modified: added Bali color palette as `coral` and `sand`, custom border radius, font families, breakpoints)
- src/components/DesignSystemTest.tsx (modified: updated to use `coral` and `sand` color names)
- src/components/SavedScreen.tsx (modified: updated Heart icon to use `coral`)
- src/components/DestinationSelector.tsx (modified: updated badges to use `coral`)
- src/components/ExploreScreen.tsx (modified: updated badges and icons to use `coral`)
- src/components/checkout/ReviewStep.tsx (modified: updated card styling to use `coral`)
- src/components/checkout/ConfirmationStep.tsx (modified: updated alert styling to use `coral`)
- src/__tests__/tailwind.test.ts (modified: 12 design system tests including Caveat font)

## Change Log

- 2026-01-05: Configured Bali-inspired Tailwind CSS design system
  - Added OKLCH color palette (primary, accent, highlight, success)
  - Configured custom border radius tokens (card, button, pill)
  - Set up mobile-first breakpoints (sm, md, lg)
  - Added font family configuration (Plus Jakarta Sans, Inter)
  - Created visual test component and automated tests
  - All tests pass, build succeeds
- 2026-01-06: Code review fixes for color naming conflicts
  - Renamed `accent` → `coral` and `highlight` → `sand` to avoid Radix UI conflict
  - Updated DesignSystemTest and 5 app components to use new color names
  - Added Caveat font test (12 total Tailwind tests now pass)
  - Aligned color terminology with PRD (coral/sand as "secondary colors")
  - Fixed broken documentation references to PRD file path

