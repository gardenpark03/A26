-- ============================================
-- Profile Settings & Showcase 필드 추가
-- ============================================

-- profiles 테이블 확장
alter table profiles
  add column if not exists full_name text,
  add column if not exists username text,
  add column if not exists handle text,
  add column if not exists bio text,
  add column if not exists avatar_url text,
  add column if not exists website text,
  add column if not exists timezone text default 'Asia/Seoul',
  add column if not exists year_theme text,
  add column if not exists main_focus text,
  add column if not exists work_style text,
  add column if not exists week_start text default 'monday',
  add column if not exists language text default 'ko',
  add column if not exists theme_preference text default 'system',
  add column if not exists is_public boolean default false;

-- handle unique 제약 조건
create unique index if not exists profiles_handle_idx on profiles (handle) where handle is not null;

-- showcase_items 테이블 (없을 경우 생성)
create table if not exists showcase_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  item_type text not null, -- 'goal', 'log', 'project', etc.
  item_id uuid not null,
  order_index int2 not null default 0,
  is_pinned boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists showcase_items_user_idx on showcase_items (user_id, order_index);
create index if not exists showcase_items_type_idx on showcase_items (user_id, item_type);

-- RLS 정책 (showcase_items)
alter table showcase_items enable row level security;

drop policy if exists "showcase_items_own" on showcase_items;
create policy "showcase_items_own" on showcase_items
  for all using (auth.uid() = user_id);

drop policy if exists "showcase_items_public_read" on showcase_items;
create policy "showcase_items_public_read" on showcase_items
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = showcase_items.user_id
      and profiles.is_public = true
    )
  );

