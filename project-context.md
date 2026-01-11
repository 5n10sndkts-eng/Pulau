---
project_name: 'Pulau'
user_name: 'Moe'
date: '2026-01-11'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 42
optimized_for_llm: true
existing_patterns_found: 12
architecture_version: '2026-01-08'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Framework
- **React**: 19.0.0 (latest with new JSX transform)
- **TypeScript**: 5.7.2 (strict null checks enabled)
- **Vite**: 7.2.6 (build tool + dev server with SWC)
- **React Router DOM**: 7.11.0 (Standard routing)
- **Node Package Manager**: NPM with workspace support

### GitHub Spark Framework
- **@github/spark**: >=0.43.1 <1
- **Critical**: Uses Spark's `useKV` hook for localStorage state management
- **Critical**: Requires `sparkPlugin()` and `createIconImportProxy()` in vite.config.ts

### UI & Styling
- **Tailwind CSS**: 4.1.11 with @tailwindcss/vite plugin
- **Radix UI**: Complete component library (30+ primitives)
- **Framer Motion**: 12.23.26 for animations
- **Lucide React**: 0.562.0 for icons
- **Phosphor Icons**: 2.1.7 (proxied via Spark plugin)

### State & Data Management
- **@tanstack/react-query**: 5.83.1 for server state
- **@github/spark/hooks**: useKV for client-side persistence (localStorage wrapper)
- **React Hook Form**: 7.54.2 with Zod 4.3.4 for form validation

### UI Components & Utilities
- **Sonner**: 2.0.1 (toast notifications)
- **date-fns**: 3.6.0 (date manipulation)
- **class-variance-authority**: 0.7.1 (CVA for component variants)
- **clsx** + **tailwind-merge**: Class name utilities

### Development Tools
- **ESLint**: 9.28.0 with typescript-eslint
- **React Hooks ESLint Plugin**: Enforces hooks rules
- **React Refresh Plugin**: Fast refresh for development
- **@vitejs/plugin-react-swc**: SWC-based Fast Refresh

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

**TypeScript Configuration:**
- ✅ **Strict null checks enabled** - All code must handle `null` and `undefined` explicitly
- ✅ **Module resolution: bundler** - Use modern ESM imports, no CommonJS
- ✅ **Path aliases configured** - ALWAYS use `@/*` for imports from `src/`, never relative paths like `../../../`
- ✅ **JSX: react-jsx** - Use React 19's automatic JSX transform
  - ❌ **NEVER import React** in component files unless using hooks directly from 'react'
  - ✅ Only import specific hooks: `import { useState, useEffect } from 'react'`
- ✅ **Target: ES2020** - Modern JavaScript features available (optional chaining, nullish coalescing, etc.)

**Import/Export Patterns:**
- ✅ **Named exports ONLY** - `export function ComponentName() {}` (never default exports)
- ✅ **Import from `@/` alias** - Example: `import { Button } from '@/components/ui/button'`
- ✅ **Type imports are explicit** - Import types from `@/lib/types`
- ✅ **Group imports logically** - External packages → Internal @/ imports → React hooks
- ✅ **No unused imports** - ESLint will error on unused imports

**Type Safety Rules:**
- ✅ **Props interfaces co-located** - Define props interface immediately above component
  ```typescript
  interface HomeScreenProps {
    trip: Trip
    onCategorySelect: (categoryId: string) => void
  }
  export function HomeScreen({ trip, onCategorySelect }: HomeScreenProps) {}
  ```
- ✅ **No implicit `any`** - All function parameters and returns should be typed
- ✅ **Strict null checks** - Use optional chaining `?.` and nullish coalescing `??`
- ✅ **Discriminated unions for state** - Use `type` property as discriminant for type narrowing
  ```typescript
  type Screen = 
    | { type: 'home' }
    | { type: 'category'; categoryId: string }
  ```
- ✅ **Record types for object maps** - `Record<string, TripItem[]>` instead of `{ [key: string]: TripItem[] }`

**Spark Framework Specific:**
- 🚨 **CRITICAL: useKV can return null** - Always provide defensive fallback
  ```typescript
  const [user, setUser] = useKV<User>('key', defaultUser)
  const safeUser = user || defaultUser  // Required pattern!
  ```
- 🚨 **CRITICAL: useKV updater functions must handle null**
  ```typescript
  setUser((current) => {
    const base = current || defaultUser  // Always check!
    return { ...base, newField: value }
  })
  ```
- ✅ **Generic type parameters required** - `useKV<Type>('key', default)` - always specify type

**Optional Props Pattern:**
- ✅ **Default values in destructuring** - `readOnly = false` when using `readOnly?: boolean`
- ✅ **Mark optional with `?:`** - `readOnly?: boolean` in interface

---

### Framework-Specific Rules (React + Spark)

**Component Structure:**
- ✅ **PascalCase for feature components** - `TripBuilder.tsx`, `HomeScreen.tsx` (match component name)
- ✅ **kebab-case for UI primitives** - `button.tsx`, `card.tsx` in `/components/ui/`
- ✅ **Named exports for all components** - `export function ComponentName()`
  - ⚠️ **EXCEPTION: App.tsx uses default export** - Required for Vite entry point
- ✅ **Props interface above component** - Define interface immediately before component function
- ✅ **Single component per file** - Each file exports one primary component

**Code Organization:**
```
src/
  components/
    [FeatureComponent].tsx      # Top-level features (PascalCase)
    checkout/                    # Feature-specific folders
    ui/                         # Radix primitives only (kebab-case files)
  lib/
    types.ts                    # ALL TypeScript type definitions
    helpers.ts                  # Pure utility functions
    mockData.ts                 # Static data arrays (mock backend)
  hooks/
    use-[name].ts              # Custom hooks (kebab-case)
```

**State Management Patterns:**
- ✅ **Spark useKV for persistence** - `useKV<Type>('key', default)` from `@github/spark/hooks`
- ✅ **useState for local UI state** - Non-persisted component state
- ✅ **Discriminated unions for routing** - App.tsx routing uses discriminated union
  ```typescript
  type Screen = 
    | { type: 'home' }
    | { type: 'category'; categoryId: string }
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'home' })
  ```
- 🚨 **CRITICAL: Always provide default to useKV** - Second parameter is required fallback
- 🚨 **CRITICAL: Check for null in useKV updaters** - Pattern: `const base = current || defaultValue`

**Routing Pattern:**
- ✅ **React Router DOM v7** - Standard routing with `<Outlet />` layouts
- ✅ **Navigation** - Use `useNavigate()` hook and `<Link />` components
- 🚨 **NO window.location** - Never force full page reloads
- ✅ **Route Definition** - Defined in `App.tsx` using `Routes` and `Route` components

**Data Layer (Backend Integration):**
- ✅ **Supabase backend configured** - PostgreSQL database with RLS
- ✅ **Service Layer pattern** - All Supabase calls go through `lib/*Service.ts` files
- ✅ **TanStack Query hooks** - Data fetching via `hooks/use*.ts` files
- ✅ **Offline Strategy** - Hybrid: TanStack Query for cache, `useNetworkSync` for Tickets
- ✅ **Components use hooks only** - NEVER call Supabase directly from components
- ✅ **Helpers in lib/helpers.ts** - Utility functions for filtering, formatting, calculations

**React Hooks Usage:**
- ✅ **Import hooks explicitly** - `import { useState, useEffect } from 'react'`
- ✅ **Follow hooks rules** - ESLint enforces (no conditional calls)
- ✅ **Dependencies in useEffect** - Always specify dependency array
- ✅ **Updater functions for state** - Use `setState(prev => ...)` when reading previous state

**Event Handler Patterns:**
- ✅ **Handlers prefixed with `handle`** - `handleQuickAdd`, `handleRemoveItem`, `handleCheckout`
- ✅ **Callback props prefixed with `on`** - `onBack`, `onCategorySelect`, `onRemoveItem`

**Component Communication:**
- ✅ **Props drilling** - Pass state and updaters through props (no Context API)
- ✅ **Toast for feedback** - `toast.success()` from `sonner` for user confirmations
- ✅ **Toaster in App root** - `<Toaster />` component must be rendered in App.tsx

**Animation Patterns:**
- ✅ **Framer Motion** - Use `motion` components and `AnimatePresence`
- ✅ **Wrap conditionals** - `<AnimatePresence>` around conditionally rendered content

**Error Handling:**
- ✅ **Error boundary at root** - `react-error-boundary` wraps App in main.tsx
- ✅ **Dev mode rethrows** - ErrorFallback rethrows in dev for better DX
- ✅ **Production shows fallback** - User-friendly error UI in production

**Spark Framework Specifics:**
- 🚨 **Vite plugin casting required** - `sparkPlugin() as PluginOption` in vite.config.ts
- 🚨 **Icon proxy casting required** - `createIconImportProxy() as PluginOption`
- ✅ **Spark initialization** - `import "@github/spark/spark"` in main.tsx

**Import Order Convention:**
1. React imports (`useState`, `useEffect`)
2. External libraries (`@github/spark/hooks`, `lucide-react`)
3. `@/` internal imports (`@/components/ui/button`)
4. Type imports from `@/lib/types`
5. Relative imports (rare, avoid when possible)

---

### Code Quality & Style Rules

**File Naming Conventions:**
- ✅ **Feature components**: PascalCase.tsx (`TripBuilder.tsx`, `HomeScreen.tsx`)
- ✅ **UI components**: kebab-case.tsx (`button.tsx`, `card.tsx`, `input.tsx`)
- ✅ **Custom hooks**: kebab-case.ts (`use-mobile.ts`)
- ✅ **Utilities**: camelCase.ts (`helpers.ts`, `types.ts`, `mockData.ts`)

**ESLint Rules:**
- ✅ **TypeScript recommended rules** - Uses `typescript-eslint` recommended config
- ✅ **React hooks rules enforced** - No conditional hooks, proper dependencies
- ✅ **React refresh rules** - Component-only exports for Fast Refresh
- ✅ **No unused variables** - ESLint will error

**Tailwind CSS Patterns:**
- ✅ **Utility-first styling** - Use Tailwind classes, no custom CSS files
- ✅ **Theme customization in tailwind.config.js** - Design tokens for colors, fonts
- ✅ **Class composition with cn()** - Use `cn()` helper from `@/lib/utils` for conditional classes
- ✅ **Responsive design** - Mobile-first breakpoints (`sm:`, `md:`, `lg:`)

**Component Styling Patterns:**
- ✅ **Design system colors** - Use semantic tokens (`primary`, `secondary`, `destructive`, `muted`)
- ✅ **Spacing system** - Tailwind spacing scale (`p-4`, `gap-2`, `space-y-4`)
- ✅ **Typography** - `font-display` for headings, default for body
- ✅ **Variants with CVA** - Use `class-variance-authority` for component variants

**Code Formatting & Documentation:**
- ✅ **Indentation**: 2 spaces (enforced by ESLint)
- ✅ **Comments**: Explain "WHY" something is done, not "WHAT" the code does
- ✅ **No Dead Code**: Remove unused imports and commented-out code immediately
- ✅ **Arrow Functions**: Preferred for handlers and callbacks

---

### Critical Don't-Miss Rules

**Spark Framework Gotchas:**
- 🚨 **NEVER forget useKV null checks** - Most common bug: forgetting `const safe = value || default`
- 🚨 **NEVER skip plugin casting** - Vite plugins MUST be cast: `sparkPlugin() as PluginOption`
- ❌ **DON'T use localStorage directly** - Always use `useKV` hook instead
- ❌ **DON'T import React in components** - React 19 JSX transform handles this

**TypeScript Anti-Patterns:**
- ❌ **NEVER use `any` type** - Use proper types or `unknown` if truly dynamic
- ❌ **DON'T use relative imports** - Use `@/` path alias instead of `../../../`
- ❌ **DON'T skip optional chaining** - Helpers return undefined, always use `?.`
- ❌ **NEVER mutate state directly** - Always use updater functions with immutable patterns

**Component Anti-Patterns:**
- ❌ **DON'T use default exports** - Except App.tsx (Vite requirement)
- ❌ **DON'T put props in separate files** - Props interfaces live above component
- ❌ **DON'T create nested component functions** - Extract to separate files instead
- ❌ **DON'T skip Toaster component** - Must be rendered in App.tsx for toast notifications

**Data Layer Mistakes:**
- 🚨 **NEVER call Supabase from components** - Always use hooks from `hooks/use*.ts`
- ❌ **DON'T skip service layer** - All database calls go through `lib/*Service.ts`
- ❌ **DON'T throw errors from services** - Return `{ data: null, error: string }` instead
- ❌ **DON'T use flat query keys** - Use hierarchical arrays: `['experiences', id]`
- ❌ **DON'T skip null checks on helpers** - Functions can return `undefined`

**Routing Mistakes:**
- 🚨 **NEVER install react-router** - App uses discriminated union state routing
- ❌ **DON'T create route files** - All routing logic lives in App.tsx
- ❌ **DON'T use URLs for navigation** - Change `currentScreen` state object instead

**Performance Gotchas:**
- ⚠️ **Avoid unnecessary re-renders** - Use React.memo sparingly, profile first
- ⚠️ **Don't overuse Framer Motion** - Animate only user-facing transitions
- ⚠️ **Test with React DevTools** - Check for unnecessary re-renders

**Common Mistakes to Avoid:**
- ❌ **Adding dependencies without reason** - Check if existing libraries solve the problem
- ❌ **Creating custom hooks prematurely** - Extract only when reused 3+ times
- ❌ **Skipping error boundaries** - Already configured, don't remove or bypass
- ❌ **Forgetting responsive design** - Always test mobile breakpoints

---

## Development Workflow

**Running the Project:**
```bash
npm run dev        # Start Vite dev server (hot reload)
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

**Key Commands:**
- ✅ **Dev server runs on default Vite port** - Usually `http://localhost:5173`
- ✅ **Hot reload enabled** - SWC Fast Refresh for instant updates
- ✅ **ESLint on save** - Configure editor to auto-lint

---

## Project Architecture Summary

**Current State:**
- ✅ Single-page application (SPA) with client-side routing
- ✅ Supabase backend (PostgreSQL + Auth + Edge Functions)
- ✅ localStorage persistence via Spark useKV
- ✅ Component-based architecture with Radix UI primitives
- ✅ Error boundary configured for production

**Backend Integration Architecture:**
- ✅ Supabase PostgreSQL with RLS policies
- ✅ Supabase Auth (Email/Password, Magic Link, OAuth)
- ✅ Service Layer pattern (`lib/*Service.ts`)
- ✅ TanStack Query hooks (`hooks/use*.ts`)
- ✅ Edge Functions for business logic (`supabase/functions/`)

---

## Backend Integration Rules

### Database Naming (PostgreSQL)

| Element | Convention | Example |
|---------|------------|---------|
| Tables | `snake_case` plural | `users`, `experiences`, `bookings` |
| Columns | `snake_case` | `user_id`, `created_at`, `is_active` |
| Foreign Keys | `{table}_id` | `user_id`, `experience_id` |

### API Response Pattern

**All services MUST return discriminated unions:**
```typescript
type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string }

// Example usage:
const result = await getExperiences()
if (result.error) {
  toast.error(result.error)
  return
}
// result.data is guaranteed to be T here
```

### Service Layer Pattern

**File naming:** `lib/*Service.ts` (camelCase + Service)
```typescript
// lib/experienceService.ts
export async function getExperiences(): Promise<ApiResponse<Experience[]>> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
```

### TanStack Query Hook Pattern

**File naming:** `hooks/use*.ts` (use + PascalCase)
```typescript
// hooks/useExperiences.ts
export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: () => getExperiences(),
  })
}

export function useExperience(id: string) {
  return useQuery({
    queryKey: ['experiences', id],
    queryFn: () => getExperience(id),
  })
}
```

### Query Key Hierarchy

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
```

### Optimistic Updates

| Mutation Type | Optimistic? | Rationale |
|---------------|-------------|-----------|
| Add to wishlist | ✅ Yes | Low-risk, instant feedback |
| Add/remove from trip | ✅ Yes | User expects immediate response |
| Create booking | ❌ No | High-stakes, server validation required |
| Process payment | ❌ No | Must confirm server success |

### Component Data Pattern

```typescript
// Standard component pattern
const { data, isLoading, error, refetch } = useExperiences()

if (isLoading) return <Skeleton />
if (error) return <ErrorState message={error} onRetry={refetch} />
if (!data?.length) return <EmptyState message="No experiences found" />
return <ExperienceList experiences={data} />
```

### Loading & Error State Conventions

| Context | Pattern | Component |
|---------|---------|-----------|
| Data fetching | Skeleton placeholders | `<Skeleton />` |
| Mutations | Button loading state | `<LoadingButton />` |
| Errors | Friendly error UI | `<ErrorState />` |
| Empty results | Empty state | `<EmptyState />` |

### Edge Function Pattern

**Folder naming:** `kebab-case` in `supabase/functions/`
```
supabase/functions/
  checkout/index.ts
  create-booking/index.ts
  process-payment/index.ts
```

### Testing Rules

**Infrastructure:**
- ✅ **Infrastructure**: Vitest (Unit) + Playwright (E2E) + MSW (API Mocking)
- ✅ **Mocking Mandate**: Unit tests MUST mock `lib/*Service` layer. NEVER hit real Supabase.

**Critical One-Line Rules:**
- ✅ **Offline First**: ALL PWA features (like Tickets) MUST be verified with network disabled (Playwright)
- ✅ **Co-location**: Tests live with source: `feature.tsx` -> `feature.test.tsx`
- ✅ **Behavior Driven**: Test user interactions, not internal state

### Code Quality & Style Rules

**Standards:**
- ✅ **One Component, One File**: Except closely coupled sub-components
- ✅ **Naming**: PascalCase for Components, camelCase for logic/hooks
- ✅ **Imports**: Grouped: React -> External -> Internal (`@/`) -> Styles

**Documentation:**
- ✅ **Why not What**: Comments should explain intent, not syntax
- ✅ **No Dead Code**: Commented-out code is forbidden

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-01-11
