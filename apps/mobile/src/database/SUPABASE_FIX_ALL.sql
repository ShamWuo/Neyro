-- ============================================================================
-- MUSICAX SUPABASE FIX ALL SCRIPT - V5 (FINAL & ROBUST, SHORTENED)
-- ============================================================================

-- 1. USERS TABLE
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  display_name text,
  role text default 'student' check (role in ('student', 'teacher')),
  avatar_url text,
  instrument text,
  skill_level text,
  years_played integer default 0,
  subscription_tier text default 'free',
  xp bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ADD COLUMNS to USERS (Idempotent)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='instrument') then
        alter table public.users add column instrument text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='skill_level') then
        alter table public.users add column skill_level text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='years_played') then
        alter table public.users add column years_played integer default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='subscription_tier') then
        alter table public.users add column subscription_tier text default 'free';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='xp') then
        alter table public.users add column xp bigint default 0;
    end if;
end $$;

-- 3. USERS RLS
alter table public.users enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.users;
create policy "Public profiles are viewable by everyone" on public.users for select using ( true );

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users for update using ( auth.uid() = id );

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile" on public.users for insert with check ( auth.uid() = id );

-- 4. NEW USER TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, role, instrument, skill_level, years_played)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'instrument',
    new.raw_user_meta_data->>'skill_level',
    COALESCE((new.raw_user_meta_data->>'years_played')::integer, 0)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. RELATIONSHIPS TABLE
create table if not exists public.relationships (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.users(id) not null,
  student_id uuid references public.users(id) not null,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.relationships enable row level security;

drop policy if exists "Users can see their own relationships" on public.relationships;
create policy "Users can see their own relationships" on public.relationships 
for select using ( auth.uid() = teacher_id or auth.uid() = student_id );

drop policy if exists "Students can request teachers" on public.relationships;
create policy "Students can request teachers" on public.relationships 
for insert with check ( auth.uid() = student_id );

drop policy if exists "Teachers can update status" on public.relationships;
create policy "Teachers can update status" on public.relationships 
for update using ( auth.uid() = teacher_id );

-- 6. ASSIGNMENTS TABLE
create table if not exists public.assignments (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.users(id) not null,
  student_id uuid references public.users(id) not null,
  piece_id text,
  title text not null,
  description text,
  due_date text,
  status text default 'assigned',
  feedback text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.assignments enable row level security;

drop policy if exists "Users can see their assignments" on public.assignments;
create policy "Users can see their assignments" on public.assignments
for select using ( auth.uid() = teacher_id or auth.uid() = student_id );

drop policy if exists "Teachers can create assignments" on public.assignments;
create policy "Teachers can create assignments" on public.assignments
for insert with check ( auth.uid() = teacher_id );

drop policy if exists "Participants can update assignments" on public.assignments;
create policy "Participants can update assignments" on public.assignments
for update using ( auth.uid() = teacher_id or auth.uid() = student_id );

-- 7. UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists on_update_users_timestamp on public.users;
create trigger on_update_users_timestamp
  before update on public.users
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_update_relationships_timestamp on public.relationships;
create trigger on_update_relationships_timestamp
  before update on public.relationships
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_update_assignments_timestamp on public.assignments;
create trigger on_update_assignments_timestamp
  before update on public.assignments
  for each row execute procedure public.handle_updated_at();
