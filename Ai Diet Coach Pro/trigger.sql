-- TRIGGER FUNCTION
-- auth.users에 새로운 유저가 생기면 자동으로 public.users에도 데이터를 넣어주는 함수입니다.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, height, weight, goal)
  values (
    new.id,
    (new.raw_user_meta_data->>'height')::numeric,
    (new.raw_user_meta_data->>'weight')::numeric,
    new.raw_user_meta_data->>'goal'
  );
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER
-- 위 함수를 회원가입(insert on auth.users) 시점에 실행시킵니다.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
