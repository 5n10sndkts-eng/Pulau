-- ================================================
-- Migration: Create Payments Table
-- Story: 21.2 - Create Payments Table
-- Phase: 2a - Core Transactional
-- ================================================
-- This table tracks all Stripe payment records for reconciliation and auditing.
-- Supports the full payment lifecycle: pending → succeeded/failed → refunded/partially_refunded
-- ================================================

-- ================================================
-- TABLE: payments
-- ================================================
-- Stripe payment records linked to bookings
-- All monetary values stored in cents to avoid floating-point precision issues

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  stripe_payment_intent_id text unique not null,
  stripe_checkout_session_id text,
  amount integer not null,
  currency text not null default 'usd',
  platform_fee integer not null,
  vendor_payout integer not null,
  status text not null default 'pending',
  refund_amount integer default 0,
  refund_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Data integrity constraints
  constraint positive_amount check (amount > 0),
  constraint positive_platform_fee check (platform_fee >= 0),
  constraint positive_vendor_payout check (vendor_payout >= 0),
  constraint valid_refund_amount check (refund_amount >= 0 and refund_amount <= amount),
  constraint valid_status check (status in ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded')),
  constraint fee_payout_sum check (platform_fee + vendor_payout = amount)
);

-- Comment on table and columns for documentation
comment on table public.payments is 'Stripe payment records for booking transactions';
comment on column public.payments.amount is 'Total payment amount in cents';
comment on column public.payments.currency is 'ISO 4217 currency code, default USD';
comment on column public.payments.platform_fee is 'Platform fee in cents (typically 15% of amount)';
comment on column public.payments.vendor_payout is 'Amount to be paid to vendor in cents';
comment on column public.payments.status is 'Payment lifecycle status: pending, succeeded, failed, refunded, partially_refunded';
comment on column public.payments.refund_amount is 'Total refunded amount in cents';
comment on column public.payments.stripe_payment_intent_id is 'Stripe PaymentIntent ID for API operations';
comment on column public.payments.stripe_checkout_session_id is 'Stripe Checkout Session ID when payment originates from Checkout';

-- ================================================
-- INDEXES
-- ================================================
-- Index for querying payments by booking (most common query pattern)
create index idx_payments_booking_id
  on public.payments(booking_id);

-- Index for webhook lookups by Stripe Payment Intent ID
create index idx_payments_stripe_payment_intent
  on public.payments(stripe_payment_intent_id);

-- Index for status-based queries (e.g., find all pending payments)
create index idx_payments_status
  on public.payments(status);

-- ================================================
-- UPDATED_AT TRIGGER
-- ================================================
-- Reuse existing handle_updated_at() function from complete_schema migration
drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
  before update on public.payments
  for each row execute procedure public.handle_updated_at();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
alter table public.payments enable row level security;

-- SELECT Policy: Users can only see payments for their own bookings
-- Trace: payments → bookings → trips → user_id
create policy "payments_select_user_own_bookings"
  on public.payments
  for select
  using (
    exists (
      select 1 from public.bookings b
      join public.trips t on b.trip_id = t.id
      where b.id = payments.booking_id
        and t.user_id = auth.uid()
    )
  );

-- SELECT Policy: Vendors can see payments for bookings related to their experiences
-- Trace: payments → bookings → trips → trip_items → experiences → vendors → owner_id
-- Note: trip_items.experience_id is TEXT, experiences.id is UUID, so we cast
create policy "payments_select_vendor_experiences"
  on public.payments
  for select
  using (
    exists (
      select 1 from public.bookings b
      join public.trips t on b.trip_id = t.id
      join public.trip_items ti on ti.trip_id = t.id
      join public.experiences e on e.id = ti.experience_id::uuid
      join public.vendors v on e.vendor_id = v.id
      where b.id = payments.booking_id
        and v.owner_id = auth.uid()
    )
  );

-- NO INSERT/UPDATE/DELETE policies for authenticated users
-- All writes must go through service role (Edge Functions)
-- This ensures payment records can only be modified by trusted server-side code
