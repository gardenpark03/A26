-- milestones 테이블 스키마 수정
-- 누락된 필드들을 추가합니다

alter table milestones
  add column if not exists description text,
  add column if not exists start_date date,
  add column if not exists user_id uuid references profiles (id) on delete cascade;

-- user_id 인덱스 추가 (성능 개선)
create index if not exists milestones_user_idx on milestones (user_id, goal_id);

-- order_index 필드도 확인 (없으면 추가)
alter table milestones
  add column if not exists order_index int2 default 0;

