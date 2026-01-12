# Pulau Development Instructions

## Project Context

**Pulau** is a premium Bali travel experience marketplace built with React 19, TypeScript, and Supabase. It connects travelers with local tour operators through a visual trip-building interface and enables vendors to manage their offerings.

## Critical Patterns

### TypeScript Strict Mode

- **Strict null checks** are enabled: always handle `undefined` cases with optional chaining or null assertions
- **No unchecked indexed access**: array/object access returns `T | undefined`, requiring explicit checks
- Use path alias `@/*` for all imports from `src/`: `import { supabase } from '@/lib/supabase'`
- Types auto-generated in `src/lib/database.types.ts` - use `Database['public']['Tables']['table_name']['Row']` for DB types

### State Management Architecture

1. **Server state**: Use TanStack Query (React Query v5) for all data fetching, caching, and mutations
2. **Auth state**: `AuthContext` provides `user`, `session`, `signIn`, `signOut` - wrap usage in `useAuth()` hook
3. **Trip state**: `TripContext` manages shopping cart/itinerary - use `useTrip()` for adding/removing experiences
4. **Realtime**: Supabase subscriptions for live slot updates - see `src/hooks/useRealtimeSlots.ts` pattern

### Component System (shadcn/ui Pattern)

All UI components in `src/components/ui/` follow this structure:
- Variants defined separately in `*.variants.ts` using `class-variance-authority` (cva)
- Components import variants and use `cn()` utility to merge classNames
- Always destructure `asChild` prop for polymorphic components using `@radix-ui/react-slot`

**Example pattern:**
```tsx
import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva("base-classes", {
  variants: { variant: {...}, size: {...} },
  defaultVariants: {...}
})

// In component file:
function Button({ variant, size, asChild, ...props }: 
  ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size }))} {...props} />
}
```

### Service Layer Pattern

All business logic lives in `src/lib/*Service.ts` files, NOT in components:
- `authService.ts` - Login, signup, session management
- `bookingService.ts` - CRUD for bookings with payment validation
- `experienceService.ts` - Experience listing, filtering, availability
- `tripService.ts` - Shopping cart operations with localStorage persistence
- `paymentService.ts` - Stripe integration, must validate vendor payment status before checkout

**Always** import services, never inline Supabase calls in components. Services handle error formatting and logging.

### Supabase Edge Functions (Deno)

Located in `supabase/functions/*/index.ts`:
- Use Deno imports: `https://deno.land/std@0.168.0/http/server.ts`
- Required CORS headers for all responses (see `checkout/index.ts` for template)
- Invoke from client: `supabase.functions.invoke('function-name', { body: {...} })`
- **Critical**: Edge functions run server-side with Row Level Security (RLS) - create service role client for admin operations

**Edge function pattern:**
```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    // ... logic
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

### Form Handling

Always use React Hook Form + Zod v4 for forms:
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ email: z.string().email(), ... })
const form = useForm({ resolver: zodResolver(schema) })
```

Validation errors appear via `form.formState.errors` - display with Sonner toast or inline error text.

## Development Workflows

### Running the App

- **Dev mode**: `npm run dev` (Vite on port 5173)
- **Mock mode**: `npm run dev:test` (no Supabase required, uses `VITE_USE_MOCK_AUTH=true`)
- **Build**: `npm run build` (TypeScript compilation + Vite build with source maps for Sentry)
- **Type check**: `npm run type-check` (runs before commits - must pass)

### Testing Strategy

1. **Unit tests** (Vitest): Run `npm test` for watch mode, `npm run test:run` for CI
   - Setup in `src/__tests__/setup.ts` with jsdom environment
   - Mock Supabase calls in tests - see existing patterns in `src/__tests__/`
   
2. **E2E tests** (Playwright): Run `npm run test:e2e` 
   - Tests in `tests/e2e/` directory
   - Use `baseURL: 'http://localhost:5173'` - starts dev server automatically
   - Retry on failure in CI (2x), screenshots on failure

### Working with Supabase

**Local development:**
```bash
# .env.example contains template
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**RLS is always enabled** - test policies by switching user contexts. Anonymous users can read published experiences, authenticated users manage their own bookings.

**Realtime subscriptions** for slot inventory:
```typescript
import { realtimeService } from '@/lib/realtimeService'

realtimeService.subscribeToSlots(experienceId, (slots) => {
  // Update UI with live availability
})
```

### BMAD Methodology

This project uses the `_bmad-output/` workflow system:
- **User stories** in `_bmad-output/stories/` follow Epic.Story format (e.g., `epic-25-story-2.md`)
- **Sprint status** tracked in `_bmad-output/sprint-status.yaml` - update story status as you work
- **Implementation artifacts** (sequence diagrams, traceability) stored in `_bmad-output/implementation-artifacts/`

When implementing features, reference the story file for acceptance criteria and update sprint status to `in-progress` → `review` → `done`.

## Common Gotchas

1. **Don't** call Supabase directly in components - use service layer
2. **Don't** forget `noUncheckedIndexedAccess` - array access requires null checks: `items[0]?.name`
3. **Don't** use relative imports outside `src/` - always use `@/` alias
4. **Do** check vendor `stripe_account_id` before enabling checkout (see `paymentService.ts`)
5. **Do** use `sonner` toast for user feedback, not console.log
6. **Do** wrap async operations in try/catch and show error toasts
7. **Do** use Framer Motion variants from existing components for consistent animations

## Key Files Reference

- `src/lib/types.ts` - Core domain types (Experience, Booking, Provider, etc.)
- `src/lib/database.types.ts` - Auto-generated Supabase types (don't edit manually)
- `docs/architecture.md` - System architecture and data flow diagrams
- `PRD.md` - Product requirements and feature specifications
- `CLAUDE.md` - Extended development guide with examples
