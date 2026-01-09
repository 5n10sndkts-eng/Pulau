-- Create public profiles table linked to auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Create trigger to create profile on signup
-- NOTE: SECURITY DEFINER with explicit search_path to prevent privilege escalation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create vendors table
create table public.vendors (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users not null,
  business_name text not null,
  business_email text,
  status text default 'pending_verification',
  verified boolean default false,
  created_at timestamptz default now() not null
);

-- Enable RLS for vendors
alter table public.vendors enable row level security;

-- Create policies for vendors
create policy "Vendors are viewable by everyone."
  on public.vendors for select
  using ( true );

create policy "Users can create their own vendor profile."
  on public.vendors for insert
  with check ( auth.uid() = owner_id );

create policy "Vendors can update own profile."
  on public.vendors for update
  using ( auth.uid() = owner_id );

create policy "Vendor owners can delete their vendor profile."
  on public.vendors for delete
  using ( auth.uid() = owner_id );

-- Create experiences table
create table public.experiences (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.vendors not null,
  title text not null,
  description text,
  category text not null,
  price_amount numeric not null,
  price_currency text default 'USD',
  status text default 'draft',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for experiences
alter table public.experiences enable row level security;

-- Create policies for experiences
create policy "Active experiences are viewable by everyone."
  on public.experiences for select
  using ( status = 'active' or auth.uid() in (select owner_id from public.vendors where id = vendor_id) );

create policy "Vendors can insert their own experiences."
  on public.experiences for insert
  with check ( auth.uid() in (select owner_id from public.vendors where id = vendor_id) );

create policy "Vendors can update their own experiences."
  on public.experiences for update
  using ( auth.uid() in (select owner_id from public.vendors where id = vendor_id) );

create policy "Vendors can delete their own experiences."
  on public.experiences for delete
  using ( auth.uid() in (select owner_id from public.vendors where id = vendor_id) );
