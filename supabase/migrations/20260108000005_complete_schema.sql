-- Complete Schema Migration for Pulau
-- Story 20.2: Database Schema DDL
-- This migration adds all missing tables and columns to match the TypeScript types

-- ================================================
-- DESTINATIONS TABLE
-- ================================================
create table if not exists public.destinations (
  id text primary key,
  name text not null,
  country text not null,
  tagline text,
  hero_image text,
  currency text default 'USD',
  timezone text,
  active boolean default true,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.destinations enable row level security;

-- Destinations are publicly viewable
create policy "Destinations are viewable by everyone."
  on public.destinations for select
  using ( true );

-- Insert default destination (Bali)
insert into public.destinations (id, name, country, tagline, hero_image, currency, timezone, active)
values ('bali', 'Bali', 'Indonesia', 'Island of the Gods', '/images/bali-hero.jpg', 'USD', 'Asia/Makassar', true)
on conflict (id) do nothing;


-- ================================================
-- EXPAND VENDORS TABLE
-- ================================================
alter table public.vendors
add column if not exists owner_first_name text,
add column if not exists owner_last_name text,
add column if not exists phone text,
add column if not exists since_year integer default extract(year from now()),
add column if not exists photo text,
add column if not exists bio text,
add column if not exists response_time text default '< 1 hour',
add column if not exists rating numeric(2,1) default 0.0,
add column if not exists review_count integer default 0;


-- ================================================
-- EXPAND EXPERIENCES TABLE
-- ================================================
alter table public.experiences
add column if not exists destination_id text references public.destinations(id) default 'bali',
add column if not exists subcategory text,
add column if not exists price_per text default 'person' check (price_per in ('person', 'vehicle', 'group')),
add column if not exists duration_hours numeric(4,2),
add column if not exists start_time text,
add column if not exists group_size_min integer default 1,
add column if not exists group_size_max integer default 10,
add column if not exists difficulty text default 'Easy' check (difficulty in ('Easy', 'Moderate', 'Challenging')),
add column if not exists languages text[] default '{"English"}',
add column if not exists meeting_point_name text,
add column if not exists meeting_point_address text,
add column if not exists meeting_point_lat numeric(10,7),
add column if not exists meeting_point_lng numeric(10,7),
add column if not exists meeting_point_instructions text,
add column if not exists cancellation_policy text,
add column if not exists tags text[] default '{}',
add column if not exists published_at timestamptz;

-- Update experiences status constraint
alter table public.experiences drop constraint if exists experiences_status_check;
alter table public.experiences add constraint experiences_status_check
  check (status in ('draft', 'active', 'inactive', 'sold_out'));


-- ================================================
-- EXPERIENCE IMAGES TABLE
-- ================================================
create table if not exists public.experience_images (
  id uuid default gen_random_uuid() primary key,
  experience_id uuid references public.experiences(id) on delete cascade not null,
  image_url text not null,
  display_order integer default 0,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.experience_images enable row level security;

-- Images viewable by everyone for active experiences, or vendor for their own
create policy "Experience images are viewable by everyone for active experiences."
  on public.experience_images for select
  using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_images.experience_id
      and (e.status = 'active' or auth.uid() in (select owner_id from public.vendors where id = e.vendor_id))
    )
  );

create policy "Vendors can insert images for their own experiences."
  on public.experience_images for insert
  with check (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_images.experience_id and v.owner_id = auth.uid()
    )
  );

create policy "Vendors can update images for their own experiences."
  on public.experience_images for update
  using (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_images.experience_id and v.owner_id = auth.uid()
    )
  );

create policy "Vendors can delete images for their own experiences."
  on public.experience_images for delete
  using (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_images.experience_id and v.owner_id = auth.uid()
    )
  );


-- ================================================
-- EXPERIENCE INCLUSIONS TABLE (what's included / not included / what to bring)
-- ================================================
create table if not exists public.experience_inclusions (
  id uuid default gen_random_uuid() primary key,
  experience_id uuid references public.experiences(id) on delete cascade not null,
  item_text text not null,
  inclusion_type text not null check (inclusion_type in ('included', 'not_included', 'what_to_bring')),
  display_order integer default 0,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.experience_inclusions enable row level security;

create policy "Experience inclusions are viewable by everyone for active experiences."
  on public.experience_inclusions for select
  using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_inclusions.experience_id
      and (e.status = 'active' or auth.uid() in (select owner_id from public.vendors where id = e.vendor_id))
    )
  );

create policy "Vendors can insert inclusions for their own experiences."
  on public.experience_inclusions for insert
  with check (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_inclusions.experience_id and v.owner_id = auth.uid()
    )
  );

create policy "Vendors can update inclusions for their own experiences."
  on public.experience_inclusions for update
  using (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_inclusions.experience_id and v.owner_id = auth.uid()
    )
  );

create policy "Vendors can delete inclusions for their own experiences."
  on public.experience_inclusions for delete
  using (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_inclusions.experience_id and v.owner_id = auth.uid()
    )
  );


-- ================================================
-- EXPERIENCE AVAILABILITY TABLE
-- ================================================
create table if not exists public.experience_availability (
  id uuid default gen_random_uuid() primary key,
  experience_id uuid references public.experiences(id) on delete cascade not null,
  date date not null,
  slots_available integer not null default 10,
  slots_total integer not null default 10,
  status text default 'available' check (status in ('available', 'blocked', 'sold_out')),
  created_at timestamptz default now() not null,
  unique(experience_id, date)
);

-- Enable RLS
alter table public.experience_availability enable row level security;

create policy "Availability is viewable by everyone."
  on public.experience_availability for select
  using ( true );

create policy "Vendors can insert availability for their own experiences."
  on public.experience_availability for insert
  with check (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_availability.experience_id and v.owner_id = auth.uid()
    )
  );

create policy "Vendors can update availability for their own experiences."
  on public.experience_availability for update
  using (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_availability.experience_id and v.owner_id = auth.uid()
    )
  );

create policy "Vendors can delete availability for their own experiences."
  on public.experience_availability for delete
  using (
    exists (
      select 1 from public.experiences e
      join public.vendors v on e.vendor_id = v.id
      where e.id = experience_availability.experience_id and v.owner_id = auth.uid()
    )
  );


-- ================================================
-- REVIEWS TABLE
-- ================================================
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  experience_id uuid references public.experiences(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  author_name text not null,
  country text,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text,
  helpful_count integer default 0,
  verified_booking boolean default false,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone."
  on public.reviews for select
  using ( true );

create policy "Authenticated users can insert reviews."
  on public.reviews for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own reviews."
  on public.reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews."
  on public.reviews for delete
  using ( auth.uid() = user_id );


-- ================================================
-- EXPAND TRIPS TABLE
-- ================================================
alter table public.trips
add column if not exists name text,
add column if not exists subtotal numeric(10,2) default 0,
add column if not exists service_fee numeric(10,2) default 0,
add column if not exists total numeric(10,2) default 0,
add column if not exists booking_reference text,
add column if not exists booked_at timestamptz,
add column if not exists cancelled_at timestamptz,
add column if not exists cancellation_reason text,
add column if not exists share_token text unique;

-- Update trips status constraint
alter table public.trips drop constraint if exists trips_status_check;
alter table public.trips add constraint trips_status_check
  check (status in ('planning', 'booked', 'active', 'completed', 'cancelled'));


-- ================================================
-- EXPAND TRIP_ITEMS TABLE
-- ================================================
alter table public.trip_items
add column if not exists notes text;


-- ================================================
-- PAYMENT METHODS TABLE
-- ================================================
create table if not exists public.payment_methods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  payment_token text not null,
  last_four text not null,
  card_brand text not null check (card_brand in ('visa', 'mastercard', 'amex', 'discover')),
  expiry_month integer not null check (expiry_month >= 1 and expiry_month <= 12),
  expiry_year integer not null,
  is_default boolean default false,
  cardholder_name text not null,
  created_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- Enable RLS
alter table public.payment_methods enable row level security;

create policy "Users can view their own payment methods."
  on public.payment_methods for select
  using ( auth.uid() = user_id and deleted_at is null );

create policy "Users can insert their own payment methods."
  on public.payment_methods for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own payment methods."
  on public.payment_methods for update
  using ( auth.uid() = user_id );


-- ================================================
-- EXPAND PROFILES TABLE
-- ================================================
alter table public.profiles
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists has_completed_onboarding boolean default false,
add column if not exists email_verified boolean default false,
add column if not exists updated_at timestamptz default now();


-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
create index if not exists idx_experiences_vendor_id on public.experiences(vendor_id);
create index if not exists idx_experiences_category on public.experiences(category);
create index if not exists idx_experiences_status on public.experiences(status);
create index if not exists idx_experiences_destination on public.experiences(destination_id);
create index if not exists idx_experience_images_experience on public.experience_images(experience_id);
create index if not exists idx_experience_inclusions_experience on public.experience_inclusions(experience_id);
create index if not exists idx_experience_availability_date on public.experience_availability(experience_id, date);
create index if not exists idx_trips_user_id on public.trips(user_id);
create index if not exists idx_trips_status on public.trips(status);
create index if not exists idx_trip_items_trip on public.trip_items(trip_id);
create index if not exists idx_bookings_trip on public.bookings(trip_id);
create index if not exists idx_reviews_experience on public.reviews(experience_id);
create index if not exists idx_reviews_user on public.reviews(user_id);
create index if not exists idx_reviews_experience_rating on public.reviews(experience_id, rating);
create index if not exists idx_payment_methods_user on public.payment_methods(user_id);


-- ================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to experiences
drop trigger if exists set_experiences_updated_at on public.experiences;
create trigger set_experiences_updated_at
  before update on public.experiences
  for each row execute procedure public.handle_updated_at();

-- Apply updated_at trigger to trips
drop trigger if exists set_trips_updated_at on public.trips;
create trigger set_trips_updated_at
  before update on public.trips
  for each row execute procedure public.handle_updated_at();

-- Apply updated_at trigger to profiles
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
