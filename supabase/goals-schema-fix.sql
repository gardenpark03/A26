-- ============================================
-- Goals, Milestones, Tasks 스키마 수정
-- ============================================
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. milestones 테이블 수정
alter table milestones
  add column if not exists description text,
  add column if not exists start_date date,
  add column if not exists user_id uuid references profiles (id) on delete cascade,
  add column if not exists order_index int2 default 0;

-- milestones 인덱스
create index if not exists milestones_user_idx on milestones (user_id, goal_id);

-- 2. tasks 테이블 수정
alter table tasks
  add column if not exists description text,
  add column if not exists scheduled_date date,
  add column if not exists completed_at timestamptz;

-- tasks 인덱스 (대시보드 쿼리 성능 개선)
create index if not exists tasks_scheduled_date_idx on tasks (user_id, scheduled_date) where scheduled_date is not null;

-- 3. 기존 milestones에 user_id 채우기 (goal_id를 통해)
update milestones
set user_id = (
  select user_id from goals where goals.id = milestones.goal_id
)
where user_id is null;

-- 4. 기존 tasks에 scheduled_date가 null인 경우 오늘 날짜로 설정 (선택사항)
-- 주의: 이건 기존 데이터를 변경하므로 필요할 때만 실행하세요
-- update tasks
-- set scheduled_date = current_date
-- where scheduled_date is null and created_at >= current_date - interval '7 days';

