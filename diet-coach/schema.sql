-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS Table (Public Profile)
-- Links to auth.users via id
create table public.users (
  id uuid references auth.users not null primary key,
  height numeric,
  weight numeric,
  goal text check (goal in ('gain', 'lose', 'maintain')),
  daily_calorie_target int default 2000,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) for users
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- FOOD LOGS Table
create table public.food_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null default CURRENT_DATE,
  food_name text not null,
  calories int not null,
  nutrients jsonb default '{}'::jsonb, -- e.g. {"carbs": 50, "protein": 30, "fat": 10}
  image_url text,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for food_logs
alter table public.food_logs enable row level security;

-- Policies for food_logs
create policy "Users can view their own logs" on public.food_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own logs" on public.food_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own logs" on public.food_logs
  for delete using (auth.uid() = user_id);

-- Storage Bucket for Food Images (Optional but recommended)
-- insert into storage.buckets (id, name) values ('food-images', 'food-images');
-- create policy "Authenticated users can upload images" on storage.objects for insert with check (bucket_id = 'food-images' and auth.role() = 'authenticated');
-- create policy "Public Access" on storage.objects for select using (bucket_id = 'food-images');
