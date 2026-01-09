-- ================================================
-- Migration: Create Experience Slots Table
-- Story: 21.1 - Create Experience Slots Table
-- Phase: 2a - Core Transactional
-- ================================================
-- This table supports time-based availability management for experiences.
-- Used for real-time inventory tracking with row-level locking for atomic decrements.
-- ================================================

-- ================================================
-- TABLE: experience_slots
-- ================================================
-- Time-based availability slots for experiences
-- Supports multiple slots per day with capacity tracking

create table public.experience_slots (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  slot_date date not null,
  slot_time time not null,
  total_capacity integer not null,
  available_count integer not null,
  price_override_amount integer, -- NULL = use experience base price, stored in cents
  is_blocked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure no duplicate slots for same experience/date/time
  constraint unique_experience_slot unique (experience_id, slot_date, slot_time),

  -- Data integrity constraints
  constraint positive_capacity check (total_capacity > 0),
  constraint valid_available_count check (available_count >= 0 and available_count <= total_capacity)
);

-- Comment on table and columns for documentation
comment on table public.experience_slots is 'Time-based availability slots for experiences with capacity tracking';
comment on column public.experience_slots.price_override_amount is 'Price override in cents. NULL means use experience base price';
comment on column public.experience_slots.is_blocked is 'Whether this slot is blocked by vendor (e.g., for walk-ins or maintenance)';
comment on column public.experience_slots.available_count is 'Current available capacity. Decremented atomically on booking';

-- ================================================
-- INDEXES
-- ================================================
-- Index for querying slots by experience and date range (most common query pattern)
create index idx_experience_slots_experience_date
  on public.experience_slots(experience_id, slot_date);

-- Index for finding available slots (filtering by availability and block status)
create index idx_experience_slots_available
  on public.experience_slots(experience_id, slot_date, is_blocked)
  where available_count > 0 and is_blocked = false;

-- ================================================
-- UPDATED_AT TRIGGER
-- ================================================
-- Reuse existing handle_updated_at() function from complete_schema migration
drop trigger if exists set_experience_slots_updated_at on public.experience_slots;
create trigger set_experience_slots_updated_at
  before update on public.experience_slots
  for each row execute procedure public.handle_updated_at();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
alter table public.experience_slots enable row level security;

-- SELECT Policy: Public read access for all slots
-- All authenticated and anonymous users can view slots (for browsing experiences)
create policy "experience_slots_select_public"
  on public.experience_slots
  for select
  using (true);

-- INSERT Policy: Only vendors who own the experience can create slots
create policy "experience_slots_insert_vendor_owner"
  on public.experience_slots
  for insert
  with check (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_id
        and v.owner_id = auth.uid()
    )
  );

-- UPDATE Policy: Only vendors who own the experience can update slots
create policy "experience_slots_update_vendor_owner"
  on public.experience_slots
  for update
  using (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_slots.experience_id
        and v.owner_id = auth.uid()
    )
  );

-- DELETE Policy: Only vendors who own the experience can delete slots
create policy "experience_slots_delete_vendor_owner"
  on public.experience_slots
  for delete
  using (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_slots.experience_id
        and v.owner_id = auth.uid()
    )
  );
