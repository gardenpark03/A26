-- tasks 테이블 스키마 수정
-- 누락된 필드들을 추가합니다

alter table tasks
  add column if not exists description text,
  add column if not exists scheduled_date date,
  add column if not exists completed_at timestamptz;

-- scheduled_date 인덱스 추가 (대시보드 쿼리 성능 개선)
create index if not exists tasks_scheduled_date_idx on tasks (user_id, scheduled_date) where scheduled_date is not null;

