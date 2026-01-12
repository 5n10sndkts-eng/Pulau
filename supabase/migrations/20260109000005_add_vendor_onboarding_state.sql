-- ================================================
-- Migration: Add Vendor Onboarding State Column
-- Story: 22.4 - Implement Vendor Onboarding State Machine
-- Phase: 2a - Core Transactional
-- ================================================
-- Adds onboarding_state column to vendors table for
-- tracking vendor progression through KYC verification.
-- ================================================

-- ================================================
-- CREATE ENUM TYPE
-- ================================================

-- Vendor onboarding states following the defined state machine:
-- REGISTERED → KYC_SUBMITTED → KYC_VERIFIED → BANK_LINKED → ACTIVE
-- With rejection and suspension branches
create type vendor_onboarding_state as enum (
  'registered',       -- Initial state after vendor registration
  'kyc_submitted',    -- Stripe Connect onboarding initiated
  'kyc_verified',     -- Identity verification complete
  'kyc_rejected',     -- Verification failed (can retry)
  'bank_linked',      -- Bank account connected
  'active',           -- Full platform access
  'suspended'         -- Account suspended by admin
);

-- ================================================
-- ADD COLUMN
-- ================================================

alter table public.vendors
  add column if not exists onboarding_state vendor_onboarding_state default 'registered';

-- ================================================
-- MIGRATE EXISTING DATA
-- ================================================

-- Set state based on existing columns for vendors that were already onboarded
update public.vendors
set onboarding_state =
  case
    when stripe_onboarding_complete = true and instant_book_enabled = true then 'active'::vendor_onboarding_state
    when stripe_onboarding_complete = true then 'bank_linked'::vendor_onboarding_state
    when stripe_account_id is not null then 'kyc_submitted'::vendor_onboarding_state
    else 'registered'::vendor_onboarding_state
  end
where onboarding_state = 'registered';

-- ================================================
-- INDEXES
-- ================================================

-- Index for filtering vendors by onboarding state
create index if not exists idx_vendors_onboarding_state
  on public.vendors(onboarding_state);

-- ================================================
-- COMMENTS
-- ================================================

comment on column public.vendors.onboarding_state is 'Current state in vendor onboarding state machine';
