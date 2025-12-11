-- ============================================
-- Fork 기능을 위한 goals 테이블 컬럼 추가
-- ============================================

-- goals 테이블에 Fork 관련 컬럼 추가
alter table goals
  add column if not exists forked_from_goal_id uuid references goals (id) on delete set null,
  add column if not exists forked_from_user_id uuid references profiles (id) on delete set null;

-- 인덱스 추가 (성능 개선)
create index if not exists goals_forked_from_goal_idx on goals (forked_from_goal_id) where forked_from_goal_id is not null;
create index if not exists goals_forked_from_user_idx on goals (forked_from_user_id) where forked_from_user_id is not null;

