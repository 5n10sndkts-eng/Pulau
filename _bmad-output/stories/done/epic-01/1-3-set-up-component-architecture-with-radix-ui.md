# Story 1.3: Set Up Component Architecture with Radix UI

Status: done

## Story

As a developer,
I want Radix UI primitives and shadcn/ui pattern established,
so that we can build accessible, reusable components quickly.

## Acceptance Criteria

1. **Given** Tailwind CSS is configured from Story 1.2 **When** Radix UI primitives are installed and configured **Then** shadcn/ui CLI is set up with components path at `src/components/ui`
2. class-variance-authority is installed for component variants
3. Sample Button component exists with multiple variants (default/primary, outline, ghost, secondary, destructive, link)
4. Sample Card component exists with proper styling and subcomponents (CardHeader, CardContent, CardFooter, CardTitle, CardDescription)
5. Components export TypeScript interfaces for props
6. All components render without console errors

## Tasks / Subtasks

- [x] Task 1: Install and configure shadcn/ui (AC: #1)
  - [x] Install Radix UI primitives (@radix-ui/react-slot, etc.)
  - [x] Initialize shadcn/ui CLI with TypeScript configuration
  - [x] Configure components.json with path `src/components/ui`
  - [x] Create `src/components/ui` directory structure
- [x] Task 2: Install class-variance-authority (AC: #2)
  - [x] Run `npm install class-variance-authority`
  - [x] Create utility function for cn() (clsx + tailwind-merge)
  - [x] Add `src/lib/utils.ts` with cn export
- [x] Task 3: Create Button component (AC: #3, #5)
  - [x] Create `src/components/ui/button.tsx`
  - [x] Define ButtonProps interface with variant, size, asChild
  - [x] Implement default variant: bg-primary with hover states
  - [x] Implement outline variant: border with hover background
  - [x] Implement ghost variant: transparent with hover background
  - [x] Implement secondary, destructive, and link variants
  - [x] Extract CVA variants to button.variants.ts for Fast Refresh compliance
  - [x] Export Button component and proper TypeScript types
- [x] Task 4: Create Card component (AC: #4, #5)
  - [x] Create `src/components/ui/card.tsx`
  - [x] Define CardProps interface
  - [x] Implement default state: bg-card rounded-xl with shadow
  - [x] Create Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, CardAction subcomponents
  - [x] Export all Card components and prop types
- [x] Task 5: Verify components (AC: #6)
  - [x] Import and render Button variants in App.tsx
  - [x] Import and render Card with hover state
  - [x] Run `npm run dev` and verify no console errors
  - [x] Check accessibility with bobjectser dev tools

## Dev Notes

- Components use Radix UI theming system (Radix accent/neutral colors)
- Bali custom colors (coral, sand, primary) are available but not used in base UI components
- Follow single component per file pattern
- Co-locate props interfaces in component files
- Use Radix UI Slot for polymorphic button (asChild prop)
- CVA variants extracted to separate .variants.ts files for React Fast Refresh compliance

### References

- [Source: architecture/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Component Variants]
- [Source: project-context.md#Mandatory Patterns]

## Dev Agent Record

### Agent Model Used
Claude 3.7 Sonnet (2026-01-05)

### Debug Log References
- Verified all Radix UI components already installed (30+ primitives)
- Confirmed shadcn/ui configuration in components.json
- Validated Button and Card components with Radix UI theming integration
- Clarified color system: Radix UI theming (accent, neutral) vs Bali custom colors (coral, sand, primary)
- Button variants use semantic Radix colors for consistency across UI library
- Bali custom colors available for app-specific components via bg-coral, bg-sand, bg-primary

### Completion Notes List
1. ✅ shadcn/ui configured with components path at `src/components/ui`
2. ✅ class-variance-authority installed (v0.7.1)
3. ✅ cn() utility function exists in `src/lib/utils.ts`
4. ✅ Button component with 6 variants: default (primary), outline, ghost, destructive, secondary, link
5. ✅ Button uses Radix UI Slot for polymorphic behavior (asChild prop)
6. ✅ Button variants extracted to separate button.variants.ts file for Fast Refresh compliance
7. ✅ Card component with 7 subcomponents: Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, CardAction
8. ✅ All components use TypeScript with proper type exports
9. ✅ Components use Radix UI theming system (accent, neutral, etc.) - Bali colors (coral, sand, primary) available separately
10. ✅ All component tests pass (14/14)
11. ✅ ESLint passes with 0 errors (4 warnings in UI components)
12. ✅ Build succeeds

### File List
- src/components/ui/button.tsx (verified: polymorphic button with Radix Slot)
- src/components/ui/button.variants.ts (verified: CVA variants for 6 button styles)
- src/components/ui/card.tsx (verified: card with 7 subcomponents)
- src/lib/utils.ts (verified: cn() utility with clsx + tailwind-merge)
- src/__tests__/components.test.ts (verified: 14 component architecture tests)
- components.json (verified: shadcn/ui configuration)
- 30+ additional Radix UI components in src/components/ui/ (verified existing)

## Change Log

- 2026-01-05: Verified and tested Radix UI component architecture
  - Confirmed shadcn/ui configuration and 30+ Radix UI primitives installed
  - Validated Button component with multiple variants
  - Validated Card component with all subcomponents
  - Created comprehensive component architecture tests
  - All tests pass, build succeeds
- 2026-01-06: Code review and documentation corrections
  - Clarified color system: Radix UI theming vs Bali custom colors
  - Updated story to reflect actual implementation (6 button variants, not 3)
  - Corrected task descriptions to match semantic color usage (bg-primary not bg-teal-600)
  - Fixed broken PRD reference path
  - Added complete file list including button.variants.ts and utils.ts
  - Removed incorrect "hover elevated" Card description (uses static shadow)

