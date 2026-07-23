-- Auth 用户与业务 Profile 分属不同 schema。
-- 统一通过数据库触发器创建 Profile，避免任一客户端拥有写入他人 Profile 的能力。
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'user_name', '')
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_auth_user_created() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

-- 为迁移前已经存在的认证用户补齐 Profile。
insert into public.profiles (id, display_name)
select
  id,
  coalesce(
    nullif(raw_user_meta_data ->> 'full_name', ''),
    nullif(raw_user_meta_data ->> 'name', ''),
    nullif(raw_user_meta_data ->> 'user_name', '')
  )
from auth.users
on conflict (id) do nothing;
