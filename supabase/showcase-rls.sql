-- ============================================
-- Showcase 조회를 위한 RLS 정책 추가
-- ============================================
-- 공개 프로필의 Showcase를 조회할 수 있도록 정책 추가

-- 1. showcase_items 테이블 RLS 활성화 확인
alter table showcase_items enable row level security;

-- 2. 공개 프로필의 Showcase 조회 정책
-- 프로필이 공개(is_public = true)인 경우, 해당 유저의 showcase_items 조회 가능
drop policy if exists "showcase_items_public_view" on showcase_items;
create policy "showcase_items_public_view" on showcase_items
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = showcase_items.user_id
      and profiles.is_public = true
    )
  );

-- 3. 자신의 Showcase는 항상 조회 가능
drop policy if exists "showcase_items_own" on showcase_items;
create policy "showcase_items_own" on showcase_items
  for all
  using (auth.uid() = user_id);

-- 4. goals 테이블 - 공개 프로필의 목표 조회 가능
-- (이미 goals_own 정책이 있다면 추가로 공개 조회 정책 추가)
drop policy if exists "goals_public_view" on goals;
create policy "goals_public_view" on goals
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = goals.user_id
      and profiles.is_public = true
    )
  );

-- 5. logs 테이블 - 공개 로그는 이미 visibility = 'public'으로 조회 가능
-- (기존 정책 유지)

-- 6. projects 테이블 - 공개 프로필의 프로젝트 조회 가능
-- projects 테이블이 존재하는 경우에만 정책 생성
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'projects') then
    drop policy if exists "projects_public_view" on projects;
    execute 'create policy "projects_public_view" on projects
      for select
      using (
        exists (
          select 1 from profiles
          where profiles.id = projects.user_id
          and profiles.is_public = true
        )
      )';
  end if;
end $$;

