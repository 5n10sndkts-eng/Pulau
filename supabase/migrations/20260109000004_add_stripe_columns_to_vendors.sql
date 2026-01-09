-- ================================================
-- Migration: Add Stripe Columns to Vendors Table
-- Story: 21.4 - Add Stripe Columns to Vendors Table
-- Phase: 2a - Core Transactional
-- ================================================
-- Adds Stripe Connect integration columns to vendors table
-- for payment processing and vendor onboarding state tracking.
-- ================================================

-- ================================================
-- ADD COLUMNS
-- ================================================

-- Stripe Connect account ID (e.g., acct_1234567890)
alter table public.vendors
  add column if not exists stripe_account_id text;

-- Stripe onboarding completion status
alter table public.vendors
  add column if not exists stripe_onboarding_complete boolean default false;

-- Instant book eligibility flag
alter table public.vendors
  add column if not exists instant_book_enabled boolean default false;

-- Last activity timestamp for stale detection
alter table public.vendors
  add column if not exists last_activity_at timestamptz;

-- ================================================
-- CONSTRAINTS
-- ================================================

-- Unique constraint on stripe_account_id (fraud prevention)
alter table public.vendors
  add constraint vendors_stripe_account_id_unique unique (stripe_account_id);

-- ================================================
-- INDEXES
-- ================================================

-- Index for Stripe webhook lookups by account ID
create index if not exists idx_vendors_stripe_account_id
  on public.vendors(stripe_account_id)
  where stripe_account_id is not null;

-- Index for traveler filtering by instant book status
create index if not exists idx_vendors_instant_book_enabled
  on public.vendors(instant_book_enabled)
  where instant_book_enabled = true;

-- ================================================
-- COMMENTS
-- ================================================

comment on column public.vendors.stripe_account_id is 'Stripe Connect Express account ID';
comment on column public.vendors.stripe_onboarding_complete is 'Whether Stripe KYC and bank linking is complete';
comment on column public.vendors.instant_book_enabled is 'Whether vendor is eligible for instant booking';
comment on column public.vendors.last_activity_at is 'Last vendor activity timestamp for stale detection';
