-- Create trips table
create table public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  destination_id text not null,
  status text default 'planning',
  start_date date,
  end_date date,
  travelers integer default 2,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for trips
alter table public.trips enable row level security;

-- Policies for trips
create policy "Users can view their own trips."
  on public.trips for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own trips."
  on public.trips for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own trips."
  on public.trips for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own trips."
  on public.trips for delete
  using ( auth.uid() = user_id );


-- Create trip_items table
create table public.trip_items (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  experience_id text not null,
  guests integer default 2,
  total_price numeric not null,
  date date,
  time text,
  created_at timestamptz default now() not null
);

-- Enable RLS for trip_items
alter table public.trip_items enable row level security;

-- Policies for trip_items
-- We can simplify by checking if the user owns the parent trip
create policy "Users can view items of their own trips."
  on public.trip_items for select
  using ( exists (select 1 from public.trips where id = trip_items.trip_id and user_id = auth.uid()) );

create policy "Users can insert items to their own trips."
  on public.trip_items for insert
  with check ( exists (select 1 from public.trips where id = trip_items.trip_id and user_id = auth.uid()) );

create policy "Users can update items of their own trips."
  on public.trip_items for update
  using ( exists (select 1 from public.trips where id = trip_items.trip_id and user_id = auth.uid()) );

create policy "Users can delete items of their own trips."
  on public.trip_items for delete
  using ( exists (select 1 from public.trips where id = trip_items.trip_id and user_id = auth.uid()) );
