## Epic 1: Foundation & Technical Infrastructure

**Goal:** Development environment established with GitHub Spark, React 19, TypeScript strict mode (enforced via tsconfig), Tailwind CSS, component architecture, build tooling, and all technical foundations for rapid feature development.

### Story 1.1: Initialize GitHub Spark Project with TypeScript

As a developer,
I want the GitHub Spark project initialized with TypeScript strict mode and all build tools configured,
So that we have a solid foundation for type-safe development.

**Acceptance Criteria:**

**Given** a new project repository
**When** the GitHub Spark template is initialized
**Then** the project includes @github/spark SDK, useKV hook, Vite 7.2.6, and TypeScript 5.7.2 with strict mode enabled
**And** path aliases `@/*` → `./src/*` are configured in tsconfig.json
**And** ESLint with TypeScript and React Hooks rules is configured
**And** npm install completes without errors
**And** npm run dev starts the development server successfully

### Story 1.2: Configure Tailwind CSS Design System

As a developer,
I want Tailwind CSS 4.1.11 configured with the Bali-inspired design tokens,
So that all UI components follow the consistent design system.

**Acceptance Criteria:**

**Given** the initialized project from Story 1.1
**When** Tailwind CSS is configured with Vite plugin
**Then** tailwind.config.js includes custom color palette (Deep Teal #0D7377, Warm Coral #FF6B6B, Golden Sand #F4D03F, Success #27AE60)
**And** custom fonts are configured (Plus Jakarta Sans, Inter)
**And** mobile-first breakpoints are set (sm: 640px, md: 768px, lg: 1024px)
**And** spacing system with 4px base unit is configured
**And** border radius tokens (12-16px cards, 8px buttons, 24px pills) are defined
**And** a test component renders with Tailwind classes successfully

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

### Story 1.4: Configure Animation Library and Icon System

As a developer,
I want Framer Motion and Phosphor icons configured,
So that we can implement smooth animations and consistent iconography.

**Acceptance Criteria:**

**Given** component architecture is established from Story 1.3
**When** Framer Motion and Phosphor icons are installed
**Then** Framer Motion AnimatePresence wrapper is available for route transitions
**And** Phosphor icons library is imported with rounded style and 2px stroke
**And** Sonner toast library is configured for notifications
**And** sample animation (button click with scale) works smoothly at 60fps
**And** sample icons render (House, Compass, Heart, User)
**And** reduced-motion media query support is implemented

### Story 1.5: Establish TypeScript Type Safety Patterns

As a developer,
I want TypeScript strict mode patterns and discriminated unions documented,
So that the codebase maintains type safety throughout development.

**Acceptance Criteria:**

**Given** all previous configuration stories are complete
**When** TypeScript strict mode is enforced
**Then** tsconfig.json has `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
**And** example discriminated union for screen routing is documented (e.g., Screen type with kind property)
**And** example Record type for key-value mappings is documented
**And** null safety patterns are documented (optional chaining, nullish coalescing)
**And** no `any` types are used in example code
**And** pre-existing type errors are documented for resolution in future stories

---
