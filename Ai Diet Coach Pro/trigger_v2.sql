-- Drop previous trigger to avoid conflict (optional, but safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Updated Function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, height, weight, goal, gender, age, activity_level)
  values (
    new.id,
    new.email, -- Added email for convenience if needed, make sure table has it or remove line
    (new.raw_user_meta_data->>'height')::numeric,
    (new.raw_user_meta_data->>'weight')::numeric,
    new.raw_user_meta_data->>'goal',
    new.raw_user_meta_data->>'gender',
    (new.raw_user_meta_data->>'age')::int,
    (new.raw_user_meta_data->>'activity_level')::numeric
  );
  
  -- Also log initial weight to weight_logs
  insert into public.weight_logs (user_id, weight, date)
  values (
    new.id,
    (new.raw_user_meta_data->>'weight')::numeric,
    CURRENT_DATE
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Re-create Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
