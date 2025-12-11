# Profile Settings & Showcase 설정 가이드

## 🎯 구현된 기능

### 1. Profile Settings 페이지 (`/settings/profile`)
- 기본 정보 (이름, 핸들, 소개, 아바타)
- 2026 Focus (올해의 테마, 최우선 목표, 작업 스타일)
- 환경 설정 (시간대, 주 시작 요일, 언어, 테마)
- 공개 설정 (퍼블릭 프로필 ON/OFF, Showcase 링크)

### 2. Showcase 기능 수정
- 프로필 자동 생성 로직 추가
- 에러 처리 개선
- 핸들 중복 체크 강화

### 3. Avatar 업로드
- Supabase Storage 연동
- 이미지 미리보기
- 파일 크기/타입 검증

---

## 🚀 설치 순서

### 1️⃣ Supabase Storage 버킷 생성

Supabase Dashboard → Storage → New Bucket:
- 버킷 이름: `avatars`
- Public bucket: ✅ 체크
- 저장

### 2️⃣ Supabase SQL 실행

`supabase/profiles-schema.sql` 파일을 Supabase SQL Editor에서 **전체 복사/붙여넣기** 후 **RUN**:

이 스크립트는:
- ✅ `profiles` 테이블에 필요한 모든 필드 추가
- ✅ `handle` unique 제약 조건 추가
- ✅ `showcase_items` 테이블 생성 (없을 경우)
- ✅ RLS 정책 설정

### 3️⃣ 기존 유저 프로필 자동 생성

Supabase SQL Editor에서 실행:

```sql
-- 모든 auth.users를 profiles에 자동 삽입
insert into profiles (id, email, full_name, created_at)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', email), 
  created_at
from auth.users
where not exists (
  select 1 from profiles where profiles.id = auth.users.id
);
```

### 4️⃣ Git 커밋 & 푸시

```bash
git add .
git commit -m "Add: Profile Settings page and fix Showcase functionality"
git push origin main
```

Vercel이 자동으로 재배포합니다.

---

## 📋 생성된 파일

### SQL
- `supabase/profiles-schema.sql` - profiles 테이블 확장 + showcase_items 테이블

### Profile Settings
- `app/(app)/settings/profile/page.tsx` - Profile Settings 페이지
- `app/(app)/settings/profile/actions.ts` - 프로필 업데이트 서버 액션
- `components/profile/profile-form.tsx` - 프로필 폼 UI
- `components/profile/avatar-uploader.tsx` - 아바타 업로드 컴포넌트

### UI Components
- `components/ui/avatar.tsx` - Avatar 컴포넌트 (shadcn/ui)

### 수정된 파일
- `components/layout/sidebar.tsx` - Profile 메뉴 추가
- `app/(app)/showcase/actions.ts` - 에러 처리 개선, 프로필 자동 생성 로직

---

## ✅ 테스트 체크리스트

배포 후 확인:

### Profile Settings
- [ ] `/settings/profile` 접속 → 페이지 로드됨
- [ ] 이름, 핸들, 소개 입력 → 저장 → 성공
- [ ] 아바타 이미지 업로드 → 미리보기 표시 → 저장 → 성공
- [ ] 2026 Focus 입력 → 저장 → 성공
- [ ] 환경 설정 변경 → 저장 → 성공
- [ ] 퍼블릭 프로필 ON → 저장 → `/u/[핸들]` 링크 표시

### Showcase
- [ ] `/showcase` 접속 → 프로필 폼 표시
- [ ] 핸들 입력 → 저장 → 성공
- [ ] 퍼블릭 프로필 ON → `/u/[핸들]` 접속 → Showcase 표시
- [ ] 퍼블릭 프로필 OFF → `/u/[핸들]` 접속 → "비공개 프로필" 메시지

### Avatar Upload
- [ ] 이미지 선택 → 업로드 진행 → 미리보기 업데이트
- [ ] 큰 파일(>5MB) → 에러 메시지 표시
- [ ] 비이미지 파일 → 에러 메시지 표시

---

## 🔧 주요 기능 설명

### 1. Profile Settings 구조

```
/settings/profile
  ├─ 기본 정보
  │   ├─ 아바타 업로드 (Supabase Storage)
  │   ├─ 이름
  │   ├─ 핸들 (unique, 공개 URL용)
  │   └─ 소개
  │
  ├─ 2026 Focus
  │   ├─ 올해의 테마
  │   ├─ 최우선 목표
  │   └─ 작업 스타일
  │
  ├─ 환경 설정
  │   ├─ 시간대
  │   ├─ 주 시작 요일
  │   ├─ 언어
  │   └─ 테마
  │
  └─ 공개 설정
      ├─ 퍼블릭 프로필 ON/OFF
      ├─ 퍼블릭 링크 표시
      └─ Showcase 관리 버튼
```

### 2. Avatar Upload 흐름

```
1. 사용자가 이미지 선택
   ↓
2. 클라이언트에서 파일 검증
   - 타입: image/*
   - 크기: 5MB 이하
   ↓
3. Supabase Storage 업로드
   - 버킷: avatars
   - 파일명: {userId}-{timestamp}.{ext}
   ↓
4. Public URL 받아오기
   ↓
5. 폼 hidden input에 URL 저장
   ↓
6. 저장 버튼 → profiles 업데이트
```

### 3. Showcase 공개 흐름

```
1. /settings/profile에서 핸들 설정
   ↓
2. 퍼블릭 프로필 ON
   ↓
3. /showcase에서 전시할 항목 추가
   (Goals, Logs, Projects 등)
   ↓
4. /u/[핸들] 접속 시 공개 프로필 표시
```

---

## ❓ 문제 해결

### Q: Avatar 업로드 시 403 에러
A: Supabase Storage에서 `avatars` 버킷이 Public으로 설정되어 있는지 확인.

### Q: 핸들 저장 시 "이미 사용 중" 에러
A: 다른 사용자가 이미 사용 중인 핸들. 다른 핸들을 선택하세요.

### Q: /u/[핸들] 접속 시 404
A: 
1. 핸들이 올바르게 저장되었는지 확인 (`profiles.handle`)
2. `is_public`이 `true`인지 확인
3. Vercel 재배포 후 재확인

### Q: Profile 페이지 느림
A: Avatar 이미지가 너무 큰 경우. 512x512 이하로 리사이즈 후 업로드 권장.

---

## 🎨 UI 커스터마이징

### 작업 스타일 옵션 변경

`components/profile/profile-form.tsx` 파일에서:

```tsx
<SelectContent>
  <SelectItem value="maker">Maker (실행형)</SelectItem>
  <SelectItem value="planner">Planner (계획형)</SelectItem>
  // 여기에 원하는 옵션 추가
</SelectContent>
```

### 시간대 옵션 추가

```tsx
<SelectContent>
  <SelectItem value="Asia/Seoul">Seoul (KST)</SelectItem>
  // 원하는 시간대 추가
</SelectContent>
```

---

## 📚 다음 단계 (선택)

### 1. 프로필 이미지 리사이징
클라이언트에서 업로드 전 이미지를 자동 리사이징하여 최적화.

### 2. 소셜 링크 추가
Twitter, GitHub, Instagram 등 소셜 링크를 프로필에 추가.

### 3. 프로필 테마 커스터마이징
개인별 Showcase 페이지 배경색/폰트 커스터마이징.

### 4. 프로필 뱃지/Achievement 시스템
목표 달성, 연속 기록 등에 따른 뱃지 시스템.

---

완료 후 `/settings/profile`에 접속하여 프로필을 설정하고, `/showcase`에서 공개 프로필을 활성화해 보세요! 🎉

