-- ============================================
-- Archive 26 V2 - 스키마 수정 & 최적화
-- ============================================

-- 1. goals 테이블에 year 필드 추가 (없을 경우만)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'goals' and column_name = 'year'
  ) then
    alter table goals add column year int2 default 2026;
    create index if not exists goals_user_year_idx on goals (user_id, year);
  end if;
end$$;

-- 2. goals 테이블에 필수 필드 추가 (없을 경우만)
do $$
begin
  -- ai_metadata 필드
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'goals' and column_name = 'ai_metadata'
  ) then
    alter table goals add column ai_metadata jsonb;
  end if;
  
  -- updated_at 필드
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'goals' and column_name = 'updated_at'
  ) then
    alter table goals add column updated_at timestamptz default now();
  end if;
  
  -- archived_at 필드
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'goals' and column_name = 'archived_at'
  ) then
    alter table goals add column archived_at timestamptz;
  end if;
end$$;

-- 3. tasks 테이블 최적화 (누락된 필드들)
do $$
begin
  -- scheduled_date 필드
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'tasks' and column_name = 'scheduled_date'
  ) then
    alter table tasks add column scheduled_date date;
  end if;
  
  -- completed_at 필드
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'tasks' and column_name = 'completed_at'
  ) then
    alter table tasks add column completed_at timestamptz;
  end if;
  
  -- description 필드
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'tasks' and column_name = 'description'
  ) then
    alter table tasks add column description text;
  end if;
end$$;

-- 4. logs 테이블 최적화
do $$
begin
  -- log_date 필드
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'logs' and column_name = 'log_date'
  ) then
    alter table logs add column log_date date default current_date;
    create index if not exists logs_user_date_idx on logs (user_id, log_date desc);
  end if;
  
  -- title 필드
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'logs' and column_name = 'title'
  ) then
    alter table logs add column title text;
  end if;
end$$;

-- 5. 인덱스 최적화 (성능 개선)
create index if not exists goals_user_status_idx on goals (user_id, status) where status != 'archived';
create index if not exists tasks_user_status_idx on tasks (user_id, status) where status != 'done';
create index if not exists tasks_scheduled_idx on tasks (scheduled_date) where scheduled_date is not null;

-- 6. profiles 자동 생성 함수 (search_path 명시)
create or replace function public.handle_new_user()
  returns trigger
  set search_path = public
as $$
begin
  insert into public.profiles (id, email, created_at)
  values (new.id, new.email, now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 7. 현재 인증된 유저의 프로필 강제 생성 (FK 오류 방지)
-- 아래 주석을 해제하고 실제 auth.users의 id로 교체하여 실행하세요:
-- insert into profiles (id, email, full_name, created_at)
-- select id, email, raw_user_meta_data->>'full_name', created_at
-- from auth.users
-- where not exists (select 1 from profiles where profiles.id = auth.users.id);

