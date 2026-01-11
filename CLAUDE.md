# CLAUDE.md - Pulau Project Guide

## Project Overview

**Pulau** is a premium travel experience marketplace connecting travelers with authentic local tours, activities, and hospitality services in Bali. It enables travelers to build custom trip itineraries while allowing local vendors to list and manage their experiences.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 5.7, Vite 7 |
| Styling | Tailwind CSS 4, Radix UI primitives, Framer Motion |
| Backend | Supabase (Auth, PostgreSQL, RLS, Edge Functions, Realtime) |
| State | React Query (TanStack Query v5), React Context |
| Forms | React Hook Form + Zod v4 validation |
| Testing | Vitest (unit), Playwright (e2e), React Testing Library |
| Icons | Phosphor Icons, Lucide React |

## Quick Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build (tsc + vite)
npm run test         # Run Vitest unit tests
npm run test:run     # Run tests once (CI mode)
npm run test:e2e     # Run Playwright e2e tests
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
```

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/               # Base UI components (Radix-based, shadcn style)
│   ├── auth/             # Authentication (PasswordReset, etc.)
│   ├── checkout/         # Checkout flow (ConfirmationStep, etc.)
│   ├── vendor/           # Vendor portal (QRScanner, VendorBookings, etc.)
│   ├── admin/            # Admin components (AdminBookingSearch, RefundModal)
│   └── booking/          # Booking components (TicketPage, OfflineBanner)
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state management
├── hooks/                # Custom hooks
│   ├── useRealtimeSlots.ts   # Supabase realtime subscriptions
│   ├── useOnlineStatus.ts    # Network status detection
│   ├── useNetworkSync.ts     # Offline sync handling
│   └── usePayment.ts         # Payment flow hook
├── lib/                  # Services and utilities
│   ├── supabase.ts           # Supabase client config
│   ├── database.types.ts     # Generated DB types
│   ├── authService.ts        # Auth operations
│   ├── bookingService.ts     # Booking CRUD
│   ├── dataService.ts        # Data fetching
│   ├── experienceService.ts  # Experience management
│   ├── paymentService.ts     # Stripe integration
│   ├── realtimeService.ts    # Realtime subscriptions
│   ├── auditService.ts       # Audit logging
│   ├── slotService.ts        # Time slot management
│   ├── tripService.ts        # Trip/itinerary management
│   ├── vendorService.ts      # Vendor operations
│   ├── vendorOnboardService.ts  # Vendor Stripe Connect
│   ├── vendorStateMachine.ts    # Vendor onboarding state
│   ├── conflictDetection.ts     # Booking conflict logic
│   ├── helpers.ts            # Utility functions
│   ├── types.ts              # Shared TypeScript types
│   └── mockData.ts           # Dev/test mock data
├── screens/              # Screen-level components
│   └── vendor/           # Vendor screens
│       ├── experience-form/  # Multi-step experience creation
│       └── ExperienceImageUploadScreen.tsx
└── __tests__/            # Test files

supabase/
├── migrations/           # SQL migrations (chronological)
└── functions/            # Edge Functions (Deno)
    ├── checkout/         # Stripe checkout session
    ├── generate-ticket/  # Ticket PDF generation
    ├── process-refund/   # Refund processing
    ├── vendor-onboard/   # Vendor Stripe Connect
    ├── vendor-payout-status/  # Payout status check
    └── webhook-stripe/   # Stripe webhooks

_bmad-output/             # BMAD methodology artifacts
├── stories/              # User stories (epics 25-28)
├── sprint-status.yaml    # Current sprint tracking
└── planning-artifacts/   # Architecture, PRD docs
```

## Key Architectural Patterns

### TypeScript Configuration
- **Strict mode enabled** with `strictNullChecks`, `noImplicitAny`, `noUncheckedIndexedAccess`
- Path alias: `@/*` maps to `./src/*`
- Target: ES2020, JSX: react-jsx

### Database Types
- Generated types in `src/lib/database.types.ts`
- Use `Database['public']['Tables']['table_name']['Row']` for row types
- All DB operations should use typed Supabase client

### State Management
- **React Query** for server state (caching, refetching, mutations)
- **React Context** for auth state (`AuthContext`)
- **Supabase Realtime** for live updates (slots, bookings)

### Component Patterns
- UI components in `components/ui/` follow shadcn/ui patterns
- Use `class-variance-authority` (CVA) for component variants
- Animations via Framer Motion with `motion.variants.ts` presets
- Form validation with Zod schemas + React Hook Form

### Error Handling
- Use `ErrorBoundary` from `react-error-boundary`
- Custom `ErrorFallback.tsx` component
- Toast notifications via `sonner`

## Supabase Integration

### Client Setup
```typescript
import { supabase } from '@/lib/supabase';
```

### RLS (Row Level Security)
All tables have RLS enabled. Policies enforce:
- Users can only read/write their own data
- Vendors can manage their own experiences
- Public read for published experiences

### Edge Functions
Located in `supabase/functions/`. Each has:
- `index.ts` - Main handler (Deno)
- Invoked via `supabase.functions.invoke('function-name', { body })`

### Realtime Subscriptions
```typescript
import { realtimeService } from '@/lib/realtimeService';
// Subscribe to slot changes
realtimeService.subscribeToSlots(experienceId, callback);
```

## Testing

### Unit Tests (Vitest)
- Test files: `*.test.ts` or in `__tests__/`
- Config: `vitest.config.ts`
- Run specific: `npm test -- path/to/file.test.ts`

### E2E Tests (Playwright)
- Located in `e2e/` directory
- Config: `playwright.config.ts`
- Run: `npm run test:e2e`

### Test Utilities
- Setup file: `src/__tests__/setup.ts`
- Mock auth: `src/lib/authService.mock.ts`

## Design System

### Colors (Bali-inspired)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#0D7377` | Deep teal, ocean waters |
| Accent | `#FF6B6B` | Warm coral, sunset warmth |
| Golden | `#F4D03F` | Sand, highlights/ratings |
| Success | `#27AE60` | Confirmations |

### Typography
- Display: Plus Jakarta Sans
- Body: Inter

### Component Library
Base components in `src/components/ui/`:
- Dialog, Sheet, Drawer (overlays)
- Button, Input, Select, Checkbox (forms)
- Card, Table, Tabs (layout)
- Toast via Sonner

## Current Development Focus

The project is implementing **Epics 25-28**:
- **Epic 25**: Real-time slot availability (Supabase Realtime)
- **Epic 26**: Offline ticket access (PWA, service workers)
- **Epic 27**: Vendor check-in & operations (QR scanning)
- **Epic 28**: Admin refunds & audit logging

Sprint tracking: `_bmad-output/sprint-status.yaml`

## Important Conventions

1. **Imports**: Use `@/` alias for src imports
2. **Types**: Prefer explicit types, avoid `any`
3. **Null safety**: Use optional chaining, nullish coalescing
4. **Components**: One component per file, named exports preferred
5. **Services**: Keep business logic in `lib/` services, not components
6. **Mutations**: Use React Query `useMutation` for data changes
7. **Forms**: Zod schema first, then React Hook Form integration

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Common Tasks

### Adding a new component
1. Create in appropriate `src/components/` subdirectory
2. Use existing UI primitives from `components/ui/`
3. Add Zod schema if form-related

### Adding a Supabase migration
1. Create file in `supabase/migrations/` with timestamp prefix
2. Use descriptive snake_case name
3. Include RLS policies for new tables

### Adding an Edge Function
1. Create directory in `supabase/functions/`
2. Add `index.ts` with Deno handler
3. Handle CORS and auth verification

## Troubleshooting

- **Type errors after DB changes**: Regenerate types with Supabase CLI
- **Vite port conflict**: Use `npm run kill` to free port 5000
- **Test failures**: Check `src/__tests__/setup.ts` for proper mocking
