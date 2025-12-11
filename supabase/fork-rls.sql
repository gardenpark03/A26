-- ============================================
-- Fork 기능을 위한 RLS 정책 추가
-- ============================================
-- 공개 프로필의 Milestones와 Tasks를 조회할 수 있도록 정책 추가

-- 1. milestones 테이블 - 공개 프로필의 Milestones 조회 가능
drop policy if exists "milestones_public_view" on milestones;
create policy "milestones_public_view" on milestones
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = milestones.user_id
      and profiles.is_public = true
    )
  );

-- 2. tasks 테이블 - 공개 프로필의 Tasks 조회 가능
drop policy if exists "tasks_public_view" on tasks;
create policy "tasks_public_view" on tasks
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = tasks.user_id
      and profiles.is_public = true
    )
  );

