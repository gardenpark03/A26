-- ============================================
-- RLS (Row Level Security) 정책 추가
-- ============================================
-- milestones와 tasks 테이블에 대한 접근 권한 설정

-- 1. milestones 테이블 RLS 활성화
alter table milestones enable row level security;

-- milestones 정책: 사용자는 자신의 milestone만 조회/생성/수정/삭제 가능
drop policy if exists "milestones_own" on milestones;
create policy "milestones_own" on milestones
  for all using (auth.uid() = user_id);

-- 2. tasks 테이블 RLS 활성화 (이미 있을 수 있음)
alter table tasks enable row level security;

-- tasks 정책: 사용자는 자신의 task만 조회/생성/수정/삭제 가능
drop policy if exists "tasks_own" on tasks;
create policy "tasks_own" on tasks
  for all using (auth.uid() = user_id);

-- 3. goals 테이블 RLS 정책 확인 (없으면 추가)
alter table goals enable row level security;

drop policy if exists "goals_own" on goals;
create policy "goals_own" on goals
  for all using (auth.uid() = user_id);


