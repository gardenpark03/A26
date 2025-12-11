-- ============================================
-- 유저 검색을 위한 RLS 정책 추가
-- ============================================
-- profiles 테이블에서 공개 프로필을 검색할 수 있도록 정책 추가

-- 1. 공개 프로필 조회 정책 (검색용)
-- is_public = true인 프로필은 누구나 조회 가능
drop policy if exists "profiles_public_read" on profiles;
create policy "profiles_public_read" on profiles
  for select
  using (is_public = true);

-- 2. 자신의 프로필은 항상 조회 가능 (기존 정책 유지)
-- 이미 있다면 중복 생성 방지
drop policy if exists "profiles_own_read" on profiles;
create policy "profiles_own_read" on profiles
  for select
  using (auth.uid() = id);

-- 3. profiles 테이블 RLS 활성화 확인
alter table profiles enable row level security;

