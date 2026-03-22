-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create a public profiles table that links to auth.users
create table public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  display_name text,
  role text default 'student' check (role in ('student', 'teacher')),
  avatar_url text,
  xp bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Setup Row Level Security (RLS)
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.users for select
  using ( true );

create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- 3. Trigger to automatically create a public user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'display_name',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Relationships (Teacher-Student)
create table public.relationships (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.users(id) not null,
  student_id uuid references public.users(id) not null,
  status text default 'pending' check (status in ('pending', 'active', 'rejected', 'blocked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(teacher_id, student_id)
);

alter table public.relationships enable row level security;
-- Policies for relationships would go here (e.g. teachers can view their students, students can view their teachers)

-- 5. Assignments
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.users(id) not null,
  student_id uuid references public.users(id) not null,
  title text not null,
  description text,
  due_date timestamptz,
  status text default 'assigned' check (status in ('assigned', 'in_progress', 'completed', 'graded')),
  feedback text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.assignments enable row level security;
