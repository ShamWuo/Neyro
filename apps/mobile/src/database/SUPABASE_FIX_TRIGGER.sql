-- Run this in your Supabase SQL Editor to fix the user creation trigger
-- This ensures 'role' and 'display_name' are correctly set when a new user signs up

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
