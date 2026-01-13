# Epic 20: Backend Integration (Supabase)

**Status:** Draft
**Owner:** Tea (Test Architect)
**Priority:** High
**Context:** Migration from local storage prototype to production-ready Supabase backend.

## Executive Summary

This epic covers the migration of the Pulau application from a client-side prototype using `localStorage` to a robust, scalable backend using **Supabase**. This includes setting up the project, defining the PostgreSQL schema based on our TypeScript types, migrating authentication to Supabase Auth, implementing Row Level Security (RLS) for data protection, and refactoring the data access layer.

## Objectives

1.  **Production Auth:** Secure authentication using Supabase Auth (Email/Password) replacing the mock service.
2.  **Persistent Data:** Relational database storage for Users, Vendors, Experiences, Trips, and Bookings.
3.  **Security:** robust RLS policies ensuring users only access their own data and vendors manage their own listings.
4.  **Type Safety:** End-to-end type safety using generated Supabase types mapped to our existing domain types.

## Scope

### In Scope

- Supabase project initialization.
- Database schema creation (DDL) mirroring `src/lib/types.ts`.
- Authentication flow migration (Login, Register, Profile).
- RLS Policy definition and implementation.
- Data service layer implementation (`src/lib/supabase.ts` and service modules).
- Migration of existing `localStorage` logic to async Supabase calls.

### Out of Scope

- Payment gateway integration (Stripe) - Scheduled for Epic 21.
- Complex search algorithms (PostGIS) - Scheduled for later optimization.
- Image bucket storage migration (CDN) - We will use placeholder URLs or simple bucket upload for now.

## Stories

### Story 20.1: Setup & Initialization

**Goal:** Initialize the Supabase client and environment.

- [ ] Create Supabase project (User action required or mock for local dev).
- [ ] Install `@supabase/supabase-js`.
- [ ] Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] Initialize `src/lib/supabase.ts` client.
- [ ] **Verification:** Simple connection test logging to console.

### Story 20.2: Database Schema (DDL)

**Goal:** Create the PostgreSQL tables matching `src/lib/types.ts`.

- [ ] **Profiles Table:** Links to `auth.users`.
  - `id` (UUID, PK, ref `auth.users`)
  - `email`, `full_name`, `avatar_url`, `created_at`
- [ ] **Vendors Table:**
  - `id` (UUID, PK)
  - `owner_id` (UUID, ref `auth.users`)
  - `business_name`, `status`, `verified`
- [ ] **Experiences Table:**
  - `id`, `vendor_id`, `title`, `description`, `price_amount`, `category`, `status`, etc.
- [ ] **Trips Table:**
  - `id`, `user_id`, `status`, `dates`, `totals`.
- [ ] **TripItems Table:**
  - Items within a trip.
- [ ] **Bookings Table:**
  - `id`, `trip_id`, `experience_id`, `status`.
- [ ] **Verification:** Run SQL migration in Supabase SQL Editor.

### Story 20.3: Auth Migration

**Goal:** Replace `authService.ts` mock with real Supabase Auth.

- [ ] Update `AuthContext.tsx` to use `supabase.auth.onAuthStateChange`.
- [ ] Implement `login(email, password)` using `supabase.auth.signInWithPassword`.
- [ ] Implement `register(email, password)` using `supabase.auth.signUp`.
- [ ] Implement `logout()` using `supabase.auth.signOut`.
- [ ] Ensure `User` object in app state is hydrated from `public.profiles`.
- [ ] **Verification:** E2E `auth.spec.ts` passes with real (or mocked network) Supabase calls.

### Story 20.4: RLS Policies (Security)

**Goal:** Secure the database.

- [ ] **Profiles:** Users can read/update their own profile. Public can read basic info (name/avatar).
- [ ] **Experiences:** Public read access. Vendors can create/update their own.
- [ ] **Trips/Bookings:** Users can only read/update their own trips.
- [ ] **Verification:** Test negative cases (user A trying to read user B's trip).

### Story 20.5: Data Layer Refactor

**Goal:** Replace `useKV` / `localStorage` with Supabase services.

- [ ] Create `src/services/experienceService.ts` (fetch, search, filter).
- [ ] Create `src/services/tripService.ts` (CRUD for trips).
- [ ] Update UI components to use these async services instead of direct state/storage access.
- [ ] **Verification:** Manual smoke test of "Create Trip" flow.

## Technical Considerations

- **Type Generation:** We should use `supabase gen types` if possible, or manually map for now to keep it simple.
- **Mocking for Tests:** We will need to decide whether to mock `supabase-js` or use a test project for E2E. For now, we'll likely mock the network calls or use the existing mock service pattern but pointing to Supabase interfaces.
