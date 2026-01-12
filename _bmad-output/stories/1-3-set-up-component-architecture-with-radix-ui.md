### Story 1.3: Set Up Component Architecture with Radix UI

As a developer,
I want Radix UI primitives and shadcn/ui pattern established,
So that we can build accessible, reusable components quickly.

**Acceptance Criteria:**

**Given** Tailwind CSS is configured from Story 1.2
**When** Radix UI primitives are installed and configured
**Then** shadcn/ui CLI is set up with components path at `src/components/ui`
**And** class-variance-authority is installed for component variants
**And** sample Button component exists with three variants (primary teal filled, secondary coral outline, ghost text)
**And** sample Card component exists with hover states (default flat, hover elevated)
**And** components export TypeScript interfaces for props
**And** all components render without console errors
