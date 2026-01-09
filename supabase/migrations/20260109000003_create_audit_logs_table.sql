-- ================================================
-- Migration: Create Audit Logs Table
-- Story: 21.3 - Create Audit Logs Table
-- Phase: 2a - Core Transactional
-- ================================================
-- Immutable audit log for compliance and reconciliation.
-- 7-year retention requirement for tax/legal compliance.
-- No UPDATE or DELETE allowed - enforced at RLS and trigger level.
-- ================================================

-- ================================================
-- TABLE: audit_logs
-- ================================================
-- Critical financial event log for compliance

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  actor_id uuid references auth.users(id),
  actor_type text not null,
  metadata jsonb not null default '{}',
  stripe_event_id text,
  created_at timestamptz not null default now(),

  -- Data integrity constraints
  constraint valid_actor_type check (actor_type in ('user', 'vendor', 'system', 'stripe'))
);

-- Comment on table and columns for documentation
comment on table public.audit_logs is 'Immutable audit log for compliance - 7 year retention';
comment on column public.audit_logs.event_type is 'Event type: booking.created, payment.succeeded, etc.';
comment on column public.audit_logs.entity_type is 'Entity type: booking, payment, vendor, slot';
comment on column public.audit_logs.entity_id is 'UUID of the entity being logged';
comment on column public.audit_logs.actor_id is 'User ID of the actor (null for system/stripe events)';
comment on column public.audit_logs.actor_type is 'Actor type: user, vendor, system, stripe';
comment on column public.audit_logs.metadata is 'Additional context as JSONB';
comment on column public.audit_logs.stripe_event_id is 'Stripe webhook event ID for reconciliation';

-- ================================================
-- INDEXES
-- ================================================
-- Index for entity queries (most common pattern)
create index idx_audit_logs_entity
  on public.audit_logs(entity_type, entity_id);

-- Index for date range queries
create index idx_audit_logs_created_at
  on public.audit_logs(created_at);

-- Index for Stripe webhook reconciliation
create index idx_audit_logs_stripe_event
  on public.audit_logs(stripe_event_id)
  where stripe_event_id is not null;

-- Index for actor-based queries
create index idx_audit_logs_actor
  on public.audit_logs(actor_id)
  where actor_id is not null;

-- Index for event type queries
create index idx_audit_logs_event_type
  on public.audit_logs(event_type);

-- ================================================
-- IMMUTABILITY TRIGGERS
-- ================================================
-- Prevent any UPDATE operations
create or replace function public.audit_logs_prevent_update()
returns trigger as $$
begin
  raise exception 'UPDATE operations are not allowed on audit_logs table';
end;
$$ language plpgsql;

create trigger audit_logs_no_update
  before update on public.audit_logs
  for each row execute function public.audit_logs_prevent_update();

-- Prevent any DELETE operations
create or replace function public.audit_logs_prevent_delete()
returns trigger as $$
begin
  raise exception 'DELETE operations are not allowed on audit_logs table';
end;
$$ language plpgsql;

create trigger audit_logs_no_delete
  before delete on public.audit_logs
  for each row execute function public.audit_logs_prevent_delete();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
alter table public.audit_logs enable row level security;

-- INSERT Policy: Allow authenticated users to insert (for Edge Functions)
-- Edge Functions run with service_role, but we allow authenticated too for flexibility
create policy "audit_logs_insert_authenticated"
  on public.audit_logs
  for insert
  to authenticated
  with check (true);

-- NO SELECT policy for authenticated users
-- Read access is service role only (Edge Functions for admin queries)

-- NO UPDATE policy (immutable)
-- NO DELETE policy (immutable + 7-year retention)
