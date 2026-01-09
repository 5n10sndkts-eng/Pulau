---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['pulau-prd.md', 'project-context.md', 'docs/architecture.md']
workflowType: 'architecture'
project_name: 'Pulau'
user_name: 'Moe'
date: '2026-01-05'
lastStep: 8
status: 'complete'
completedAt: '2026-01-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The Pulau application delivers 6 core features forming a complete travel booking experience:

1. **Trip Canvas Building** - Visual itinerary builder with calendar view, real-time pricing, and item management
2. **Experience Discovery** - Categorized browsing with filters (difficulty/duration/price), personalized recommendations
3. **Experience Detail Pages** - Rich media galleries, provider profiles, reviews, dynamic pricing calculator
4. **Multi-Step Checkout** - 4-step wizard (Review → Traveler Details → Payment → Confirmation)
5. **Onboarding Preferences** - 3-screen preference capture for personalization engine
6. **Booking Dashboard** - Trip history with status tracking, rebooking functionality

**Non-Functional Requirements:**
- **Performance**: Instant filter updates, <10 min trip building workflow
- **Offline Resilience**: Local data persistence via Spark KV
- **Mobile-First**: 44x44px touch targets, responsive breakpoints at 640px/768px/1024px
- **Accessibility**: WCAG 2.1 AA color contrast, semantic HTML, Radix primitives
- **Animation**: Physics-based transitions (150-500ms), reduced-motion support

**Scale & Complexity:**
- Primary domain: Web SPA (Mobile-First React Application)
- Complexity level: Medium-High
- Estimated architectural components: 15-20 distinct modules
- Current state: Frontend complete, backend mock, no auth/testing

### Technical Constraints & Dependencies

| Constraint | Impact |
|------------|--------|
| GitHub Spark Platform | Must use @github/spark SDK, useKV hook, Vite plugins |
| Client-Side Only | All business logic in browser, localStorage limits (~5MB) |
| No Backend Currently | Mock data architecture, API integration needed for production |
| React 19 | Automatic JSX transform, concurrent features available |
| TypeScript Strict | Null safety, explicit types, no `any` |

### Cross-Cutting Concerns Identified

1. **State Persistence** - Spark useKV with null-safety patterns across all features
2. **Error Handling** - Error boundary at root, consistent error UI patterns
3. **Form Validation** - Zod schemas with React Hook Form for checkout/onboarding
4. **User Feedback** - Sonner toast system for confirmations and errors
5. **Responsive Design** - Mobile-first Tailwind with sm/md/lg breakpoints
6. **Animation Consistency** - Framer Motion with AnimatePresence patterns
7. **Type Safety** - Discriminated unions, Record types, strict null checks

---

## Starter Template Evaluation

### Primary Technology Domain

**Web SPA (Mobile-First React Application)** - Brownfield project with established tech stack.

### Starter Template Used

**GitHub Spark Template** - GitHub's internal starter for Spark platform applications.

**Initialization (Already Complete):**
```bash
# Project initialized via GitHub Spark Template
# Timestamp: January 2026
```

### Architectural Decisions Established by Starter

**Language & Runtime:**
- TypeScript 5.7.2 with strict mode enabled
- ES2020 target for modern JavaScript features
- Bundler module resolution for ESM imports
- Path aliases: `@/*` → `./src/*`

**Styling Solution:**
- Tailwind CSS 4.1.11 with Vite plugin integration
- Design tokens for colors, typography, spacing
- Mobile-first responsive breakpoints (sm/md/lg)
- class-variance-authority for component variants

**Build Tooling:**
- Vite 7.2.6 with SWC-based React plugin
- Optimized production builds with code splitting
- GitHub Spark plugins (sparkPlugin, createIconImportProxy)

**Component Architecture:**
- Radix UI primitives for accessible interactions
- shadcn/ui pattern for wrapped components
- Single component per file convention
- Props interfaces co-located with components

**State Management:**
- Spark useKV for persistent localStorage state
- React useState for local UI state
- Discriminated unions for screen routing

**Development Experience:**
- Hot Module Replacement via Vite
- ESLint with TypeScript and React Hooks rules
- Error boundary for production error handling

### Brownfield Project Status

This is an existing project with frontend implementation complete. Architecture decisions focus on:
1. Establishing consistency patterns for continued development
2. Planning backend integration architecture
3. Defining testing infrastructure
4. Documenting gaps for production readiness

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database platform: Supabase (PostgreSQL)
- Authentication: Supabase Auth (all methods)
- API pattern: Hybrid (SDK + Edge Functions)
- Data layer: Service Layer + TanStack Query hooks

**Important Decisions (Shape Architecture):**
- RLS policies for user/vendor data isolation
- Edge Functions for checkout/payment/booking flows
- Service layer abstraction for Supabase calls

**Deferred Decisions (Post-MVP):**
- Frontend hosting platform selection
- Advanced caching strategies
- Realtime subscriptions scope

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Supabase (PostgreSQL) | Already configured, relational data fits travel domain |
| ORM/Client | @supabase/supabase-js | Native TypeScript, RLS integration |
| Type Generation | Supabase CLI | Auto-generate types from schema |
| Migrations | Supabase migrations | Version-controlled SQL files |
| Caching | TanStack Query | Already in stack, handles client-side cache |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth Provider | Supabase Auth | Integrated with database, handles sessions |
| Auth Methods | Email/Password, Magic Link, OAuth (Google, Apple) | Full coverage for travel audience |
| Authorization | Row Level Security (RLS) | Database-level enforcement |
| Role Separation | User/Vendor via RLS policies | Data isolation by role |
| API Security | Supabase RLS + Edge Function validation | Defense in depth |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data Access | Supabase JS SDK | Direct access with RLS protection |
| Business Logic | Supabase Edge Functions | Server-side validation for payments/bookings |
| Error Handling | Consistent error shapes + existing boundaries | Unified UX for errors |
| Realtime | Supabase Realtime (as needed) | Available for booking status updates |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data Layer | Service Layer + TanStack Query hooks | Separation of concerns, testable |
| Services Location | `lib/services/*.ts` | Supabase calls isolated |
| Hooks Location | `hooks/use*.ts` | React integration with caching |
| Component Access | Via hooks only | Components never call Supabase directly |
| Existing Patterns | Unchanged | Routing, state, UI patterns preserved |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | Supabase | Already configured with MCP |
| Frontend Hosting | TBD | Not blocking, decide before launch |
| CI/CD | GitHub Actions | Lint, type-check, build on PR |
| Environment Config | .env.local + platform vars | Standard approach |

### Decision Impact Analysis

**Implementation Sequence:**
1. Define Supabase schema (tables, relationships)
2. Configure RLS policies
3. Set up Supabase Auth
4. Create service layer (`lib/services/`)
5. Create TanStack Query hooks (`hooks/`)
6. Migrate components from mockData to hooks
7. Implement Edge Functions for checkout flow

**Cross-Component Dependencies:**
- Auth must be configured before RLS policies work
- Schema must exist before service layer can be typed
- Service layer must exist before hooks can wrap it
- Hooks must exist before components can migrate from mockData

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Addressed:** 12 areas where AI agents could make different choices

### Naming Patterns

**Database Naming (PostgreSQL/Supabase):**
| Element | Convention | Example |
|---------|------------|---------|
| Tables | `snake_case` plural | `users`, `experiences`, `bookings` |
| Columns | `snake_case` | `user_id`, `created_at`, `is_active` |
| Foreign Keys | `{table}_id` | `user_id`, `experience_id` |
| Indexes | `idx_{table}_{column}` | `idx_users_email` |

**Service Layer Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| File names | `camelCase` + Service | `experienceService.ts`, `bookingService.ts` |
| Functions | `camelCase` verb-first | `getExperiences()`, `createBooking()` |
| Exports | Named exports only | `export async function getExperiences()` |
| Test files | Co-located `.test.ts` | `experienceService.test.ts` |

**Hook Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| File names | `use` + PascalCase | `useExperiences.ts`, `useBooking.ts` |
| Hook functions | `use` + PascalCase | `useExperiences()`, `useExperience(id)` |
| Query keys | Hierarchical arrays | `['experiences']`, `['experiences', id]` |
| Test files | Co-located `.test.ts` | `useExperiences.test.ts` |

**Edge Function Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Folder names | `kebab-case` | `checkout/`, `create-booking/` |
| Entry point | `index.ts` | `supabase/functions/checkout/index.ts` |

### Format Patterns

**API Response Format (Discriminated Union):**
```typescript
// All services and Edge Functions return this shape
type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string }

// TypeScript narrows correctly:
const result = await getExperiences()
if (result.error) {
  toast.error(result.error)
  return
}
// result.data is guaranteed to be T here
```

**JSON Field Naming:**
- Database → `snake_case` (PostgreSQL convention)
- TypeScript/JSON responses → `camelCase` (JS convention)
- Supabase auto-transforms between them

### Structure Patterns

**Service Layer Organization:**
```
src/lib/services/
  experienceService.ts       # Experience CRUD
  experienceService.test.ts  # Co-located tests
  bookingService.ts          # Booking operations
  bookingService.test.ts
  tripService.ts             # Trip management
  authService.ts             # Auth helpers
  vendorService.ts           # Vendor operations
```

**Hook Organization:**
```
src/hooks/
  useExperiences.ts          # Experience queries
  useExperiences.test.ts     # Co-located tests
  useBookings.ts             # Booking queries/mutations
  useTrips.ts                # Trip queries/mutations
  useAuth.ts                 # Auth state hook
```

**Feedback Components:**
```
src/components/feedback/
  Skeleton.tsx               # Reusable skeleton components
  ErrorState.tsx             # Standard error UI
  EmptyState.tsx             # "No results" states
  LoadingButton.tsx          # Button with spinner
```

**Edge Functions Organization:**
```
supabase/functions/
  checkout/index.ts          # Checkout flow
  create-booking/index.ts    # Booking creation
  process-payment/index.ts   # Payment processing
```

### Communication Patterns

**TanStack Query Keys:**
```typescript
// List queries
['experiences']
['bookings']
['trips']

// Single item queries
['experiences', experienceId]
['bookings', bookingId]

// Filtered queries
['bookings', { status: 'pending' }]
['experiences', { categoryId: 'adventure' }]
```

**Query Pattern:**
```typescript
export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: () => getExperiences(),
  })
}
```

**Mutation Pattern with Optimistic Updates:**
```typescript
export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onMutate: async (newBooking) => {
      await queryClient.cancelQueries({ queryKey: ['bookings'] })
      const previous = queryClient.getQueryData(['bookings'])
      queryClient.setQueryData(['bookings'], (old) => [...old, newBooking])
      return { previous }
    },
    onError: (err, newBooking, context) => {
      queryClient.setQueryData(['bookings'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
```

**Optimistic Update Categorization:**
| Mutation Type | Optimistic? | Rationale |
|---------------|-------------|-----------|
| Add to wishlist | ✅ Yes | Low-risk, instant feedback expected |
| Add to trip | ✅ Yes | Low-risk, enhances browsing flow |
| Remove from trip | ✅ Yes | User expects immediate response |
| Create booking | ❌ No | High-stakes, server validation required |
| Process payment | ❌ No | Must confirm server success |
| Update profile | ⚠️ Depends | Field sensitivity determines approach |

### Process Patterns

**Error Handling Flow:**
1. Service layer returns `{ data: null, error: 'message' }`
2. Hook passes error to component
3. Component shows toast via Sonner: `toast.error(error)`
4. Error boundary catches unhandled exceptions

**Loading State Conventions:**
| Context | Pattern | Component |
|---------|---------|-----------|
| Data fetching | Skeleton placeholders | `<Skeleton />` |
| Mutations | Button loading state | `<LoadingButton />` |
| Page transitions | Full-page skeleton | `<PageSkeleton />` |

**Error State Conventions:**
| Error Type | UI Response |
|------------|-------------|
| Network errors | "Connection lost" + retry button |
| Not found | Friendly empty state |
| Permission denied | Redirect to appropriate screen |
| Validation errors | Inline field errors |

**Standard Component Pattern:**
```typescript
const { data, isLoading, error, refetch } = useExperiences()

if (isLoading) return <Skeleton />
if (error) return <ErrorState message={error} onRetry={refetch} />
if (!data?.length) return <EmptyState message="No experiences found" />
return <ExperienceList experiences={data} />
```

### Testing Patterns

**Test Infrastructure:**
| Tool | Purpose |
|------|---------|
| Vitest | Test runner (Vite-native, fast) |
| @testing-library/react | Component testing |
| MSW | API mocking (optional) |

**Test File Convention:**
- All tests use `.test.ts` extension
- Tests are co-located with source files
- Services tested with mocked Supabase client
- Hooks tested with mocked services
- Components tested with mocked hooks

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `snake_case` for all database objects
- Return discriminated `{ data, error }` from all service functions
- Use hierarchical query keys for TanStack Query
- Place services in `lib/services/`, hooks in `hooks/`
- Never call Supabase directly from components
- Co-locate test files with source files
- Use optimistic updates only for low-risk mutations

**Anti-Patterns to Avoid:**
- ❌ `camelCase` table names (`userProfiles` → use `user_profiles`)
- ❌ Throwing errors from services (return `{ data: null, error }` instead)
- ❌ Flat query keys (`'experiences'` → use `['experiences']`)
- ❌ Supabase calls in components (use hooks)
- ❌ Default exports in services/hooks (use named exports)
- ❌ Optimistic updates for payment/booking creation
- ❌ Spinners for data loading (use skeletons)

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
pulau/
├── .env                          # Local environment (gitignored)
├── .env.example                  # Environment template
├── .env.local                    # Supabase keys (gitignored)
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI/CD
├── .gitignore
├── .nvmrc                        # Node version
├── components.json               # shadcn/ui config
├── eslint.config.js              # ESLint flat config
├── index.html                    # Vite entry point
├── package.json
├── package-lock.json
├── playwright.config.ts          # E2E test config
├── project-context.md            # AI agent rules (THE BIBLE)
├── README.md
├── tailwind.config.js            # Tailwind design tokens
├── tsconfig.json
├── vite.config.ts                # Vite + Spark plugins
├── vitest.config.ts              # Unit test config
│
├── docs/                         # Project documentation
│
├── public/
│   └── assets/                   # Static assets
│
├── supabase/
│   ├── migrations/               # Database migrations (SQL)
│   │   └── *.sql                 # Version-controlled schema
│   └── functions/                # Edge Functions (TO ADD)
│       ├── checkout/
│       │   └── index.ts
│       ├── create-booking/
│       │   └── index.ts
│       └── process-payment/
│           └── index.ts
│
├── src/
│   ├── App.tsx                   # Root component + routing
│   ├── main.tsx                  # Entry point + providers
│   ├── ErrorFallback.tsx         # Error boundary UI
│   ├── index.css                 # Global styles
│   ├── main.css                  # Tailwind imports
│   │
│   ├── components/
│   │   ├── ui/                   # Radix/shadcn primitives (kebab-case)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── feedback/             # Loading/error states (TO ADD)
│   │   │   ├── Skeleton.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingButton.tsx
│   │   ├── auth/                 # Auth components
│   │   │   ├── CustomerRegister.tsx
│   │   │   ├── CustomerLogin.tsx
│   │   │   └── ...
│   │   ├── checkout/             # Checkout flow
│   │   │   ├── CheckoutFlow.tsx
│   │   │   └── ...
│   │   └── [Feature].tsx         # Feature components (PascalCase)
│   │
│   ├── screens/
│   │   └── vendor/               # Vendor portal screens
│   │       ├── experience-form/
│   │       └── ...
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx       # Auth provider
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts         # Existing hooks
│   │   ├── useExperiences.ts     # TanStack Query hooks (TO ADD)
│   │   ├── useBookings.ts
│   │   ├── useTrips.ts
│   │   └── useAuth.ts
│   │
│   ├── lib/
│   │   ├── types.ts              # TypeScript types
│   │   ├── database.types.ts     # Supabase generated types
│   │   ├── helpers.ts            # Pure utility functions
│   │   ├── utils.ts              # cn() helper
│   │   ├── mockData.ts           # Mock data (to be deprecated)
│   │   ├── supabase.ts           # Supabase client
│   │   ├── null-safety.ts        # Spark useKV helpers
│   │   │
│   │   ├── authService.ts        # Auth operations
│   │   ├── authService.mock.ts   # Auth mocks for testing
│   │   ├── experienceService.ts  # Experience CRUD
│   │   ├── bookingService.ts     # Booking operations
│   │   ├── tripService.ts        # Trip management
│   │   ├── vendorService.ts      # Vendor operations
│   │   ├── dataService.ts        # Data access utilities
│   │   └── conflictDetection.ts  # Conflict detection logic
│   │
│   ├── tests/                    # Co-located service tests
│   │   └── experienceService.test.ts
│   │
│   └── __tests__/                # Legacy test location
│
├── tests/                        # E2E tests (Playwright)
│   └── e2e/
│
├── test-results/                 # Playwright artifacts
└── playwright-report/            # Playwright reports
```

### Architectural Boundaries

**API Boundaries:**
| Boundary | Location | Access Pattern |
|----------|----------|----------------|
| Supabase Database | `supabase/migrations/` | RLS-protected via SDK |
| Supabase Auth | `lib/authService.ts` | Supabase Auth SDK |
| Edge Functions | `supabase/functions/` | HTTP via Supabase client |
| External Services | Via Edge Functions | Server-side only |

**Component Boundaries:**
| Layer | Location | Allowed Dependencies |
|-------|----------|---------------------|
| Components | `components/` | Hooks, lib/types, lib/helpers |
| Hooks | `hooks/` | Services, lib/types |
| Services | `lib/*Service.ts` | Supabase client, lib/types |
| UI Primitives | `components/ui/` | None (pure components) |

**Data Flow:**
```
Component → Hook → Service → Supabase SDK → PostgreSQL (RLS)
     ↑         ↓
     └── TanStack Query (cache)
```

### Requirements to Structure Mapping

**Epic Mapping:**
| Epic | Primary Location | Supporting Files |
|------|------------------|------------------|
| Customer Auth | `components/auth/`, `lib/authService.ts` | `contexts/AuthContext.tsx` |
| Experience Discovery | `components/`, `lib/experienceService.ts` | `hooks/useExperiences.ts` |
| Trip Building | `components/TripBuilder.tsx`, `lib/tripService.ts` | `hooks/useTrips.ts` |
| Checkout Flow | `components/checkout/` | `supabase/functions/checkout/` |
| Vendor Portal | `screens/vendor/`, `lib/vendorService.ts` | — |
| Booking Management | `components/TripsDashboard.tsx`, `lib/bookingService.ts` | `hooks/useBookings.ts` |

**Cross-Cutting Concerns:**
| Concern | Location |
|---------|----------|
| Type Definitions | `lib/types.ts`, `lib/database.types.ts` |
| Error Handling | `ErrorFallback.tsx`, `components/feedback/ErrorState.tsx` |
| Loading States | `components/feedback/Skeleton.tsx` |
| Toast Notifications | Sonner via `components/ui/sonner.tsx` |
| Form Validation | Zod schemas in feature components |

### Integration Points

**Internal Communication:**
- Components consume hooks (never services directly)
- Hooks wrap services with TanStack Query
- Services return `{ data, error }` discriminated unions
- State flows down via props (no Context except Auth)

**External Integrations:**
| Service | Integration Point | Auth Method |
|---------|-------------------|-------------|
| Supabase Database | `lib/supabase.ts` | RLS + JWT |
| Supabase Auth | `lib/authService.ts` | Built-in |
| Supabase Storage | `lib/*Service.ts` | RLS |
| Payment Provider | `supabase/functions/process-payment/` | Server-side secrets |

### File Organization Notes

**Existing Structure Preserved:**
- Services live in `lib/` (not `lib/services/`)
- This is acceptable—service files are clearly named `*Service.ts`
- Hooks will be added to existing `hooks/` folder

**New Additions Required:**
1. `components/feedback/` — Loading/error state components
2. `hooks/useExperiences.ts`, `useBookings.ts`, `useTrips.ts` — TanStack Query hooks
3. `supabase/functions/` — Edge Functions for business logic

**Migration Path:**
- `mockData.ts` will be deprecated as services connect to Supabase
- Keep mockData.ts during transition for fallback/testing

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:
- Supabase PostgreSQL + TypeScript types via CLI generation
- TanStack Query integrates cleanly with Supabase SDK async calls
- RLS policies work with Supabase Auth JWT tokens
- Edge Functions share types with frontend via `database.types.ts`
- React 19 + Vite + TypeScript 5.7.2 are fully compatible

**Pattern Consistency:**
Implementation patterns support architectural decisions:
- `snake_case` database ↔ `camelCase` TypeScript (Supabase auto-transforms)
- Discriminated union `{ data, error }` used consistently service → hook → component
- Query key hierarchy matches data model relationships
- Naming conventions align with existing codebase patterns

**Structure Alignment:**
Project structure supports all architectural decisions:
- Services in `lib/` with `*Service.ts` naming enables clear boundaries
- Hooks in `hooks/` separate React integration from data access
- Edge Functions in `supabase/functions/` follow Supabase conventions
- Test files co-located with sources for maintainability

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All 19 epics have architectural support:
- Customer Auth (Epic 2) → Supabase Auth + authService + RLS
- Vendor Auth (Epic 3) → Supabase Auth + vendorService + role-based RLS
- Experience Management (Epic 5-6) → experienceService + TanStack Query hooks
- Trip Building (Epic 8-9) → tripService + conflict detection + local persistence
- Checkout Flow (Epic 10) → Edge Functions + payment processing
- Booking Dashboard (Epic 11) → bookingService + status tracking

**Functional Requirements Coverage:**
| FR Category | Architectural Support |
|-------------|----------------------|
| Trip Canvas Building | tripService + useTrips hook + Spark useKV |
| Experience Discovery | experienceService + useExperiences + filters |
| Experience Details | experienceService + reviews/ratings queries |
| Multi-Step Checkout | Edge Functions + form validation |
| Onboarding | Spark useKV + preference storage |
| Booking Dashboard | bookingService + status queries |

**Non-Functional Requirements Coverage:**
| NFR | Architectural Support |
|-----|----------------------|
| Performance (<10 min trip building) | TanStack Query caching + optimistic updates |
| Offline Resilience | Spark useKV + local persistence |
| Mobile-First | Existing Tailwind breakpoints preserved |
| Accessibility | Radix UI + WCAG patterns unchanged |
| Animation | Framer Motion patterns unchanged |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ All critical decisions documented with specific versions
- ✅ Implementation patterns comprehensive with code examples
- ✅ Consistency rules clear and enforceable
- ✅ Anti-patterns explicitly listed for avoidance

**Structure Completeness:**
- ✅ Complete directory tree with all existing and new files
- ✅ All files and directories defined with purposes
- ✅ Integration points clearly specified
- ✅ Component boundaries well-defined

**Pattern Completeness:**
- ✅ All potential conflict points addressed (12 areas)
- ✅ Naming conventions comprehensive for all layers
- ✅ Communication patterns fully specified
- ✅ Error handling and loading state patterns complete

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Gaps:**
| Gap | Mitigation |
|-----|------------|
| Payment provider not selected | Decision deferred—architecture supports any provider via Edge Functions |
| Frontend hosting not selected | Decision deferred—not blocking development |

**Nice-to-Have Improvements:**
- Realtime subscription patterns (can add when needed)
- Advanced caching strategies (TanStack Query sufficient for MVP)
- Monitoring/observability patterns (post-launch concern)

### Validation Issues Addressed

No critical or important issues found during validation. All architectural decisions are coherent, complete, and ready for implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH based on validation results

**Key Strengths:**
- Brownfield project with proven frontend patterns—architecture extends rather than replaces
- Supabase integration is well-understood with MCP already connected
- Clear separation of concerns (Component → Hook → Service → Supabase)
- Discriminated union pattern provides type-safe error handling
- Comprehensive naming conventions prevent AI agent conflicts

**Areas for Future Enhancement:**
- Payment provider integration (when selected)
- Realtime subscriptions for booking status updates
- Advanced caching for offline-first enhancement
- E2E test coverage expansion

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- The `project-context.md` file remains THE BIBLE for coding standards
- This architecture document extends project-context with backend integration patterns

**First Implementation Priority:**
Database schema creation via Supabase migrations, following the epic dependency order:
1. Core tables (users, experiences, bookings, trips)
2. RLS policies for user/vendor isolation
3. Auth configuration
4. Service layer migration from mockData

---

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-08
**Document Location:** `_bmad-output/planning-artifacts/architecture/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 15+ architectural decisions made
- 12 implementation patterns defined
- 6 main architectural components specified
- All 19 epics fully supported

**📚 AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Pulau. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
```bash
# Database schema creation via Supabase MCP
# 1. Create migrations for core tables
# 2. Configure RLS policies
# 3. Set up Auth
```

**Development Sequence:**
1. Initialize Supabase schema using documented migrations
2. Set up RLS policies for user/vendor isolation
3. Configure Supabase Auth (all methods)
4. Build service layer following `*Service.ts` pattern
5. Create TanStack Query hooks
6. Migrate components from mockData to hooks
7. Implement Edge Functions for checkout flow

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The Supabase + TanStack Query architecture provides a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

