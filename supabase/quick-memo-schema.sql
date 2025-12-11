-- Quick Memo를 profiles 테이블에 저장하기 위한 필드 추가
alter table profiles
  add column if not exists quick_memo_content text;

-- 인덱스는 필요 없음 (user_id로 조회하므로)

