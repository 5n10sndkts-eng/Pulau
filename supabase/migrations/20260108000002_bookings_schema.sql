-- Create bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  reference text not null,
  status text check (status in ('confirmed', 'pending', 'cancelled', 'completed')) default 'confirmed',
  booked_at timestamptz default now() not null
);

-- Enable RLS for bookings
alter table public.bookings enable row level security;

-- Policies for bookings
-- Authenticated users can view bookings if they own the trip
create policy "Users can view their own bookings."
  on public.bookings for select
  using ( exists (select 1 from public.trips where id = bookings.trip_id and user_id = auth.uid()) );

-- Authenticated users can insert bookings for their own trips
create policy "Users can insert their own bookings."
  on public.bookings for insert
  with check ( exists (select 1 from public.trips where id = bookings.trip_id and user_id = auth.uid()) );

-- Authenticated users can update their own bookings
create policy "Users can update their own bookings."
  on public.bookings for update
  using ( exists (select 1 from public.trips where id = bookings.trip_id and user_id = auth.uid()) );
