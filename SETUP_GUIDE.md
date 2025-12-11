# Archive 26 - 설정 가이드

## 🚨 즉시 해야 할 일

### 1. Supabase 스키마 수정 (필수)

`supabase/schema-fix.sql` 파일을 Supabase SQL Editor에서 **전체 복사/붙여넣기** 후 **RUN** 하세요.

이 스크립트는:
- ✅ `goals` 테이블에 `year` 필드 추가
- ✅ `goals` 테이블에 `ai_metadata`, `updated_at`, `archived_at` 필드 추가
- ✅ `tasks` 테이블에 `scheduled_date`, `completed_at`, `description` 필드 추가
- ✅ `logs` 테이블에 `log_date`, `title` 필드 추가
- ✅ 성능 향상을 위한 인덱스 생성
- ✅ `profiles` 자동 생성 트리거 개선 (Security Advisor 경고 해결)

### 2. 현재 유저의 프로필 생성 (Create Goal 에러 방지)

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

### 3. Vercel 재배포

터미널에서 실행:

```bash
git add .
git commit -m "Fix: add missing DB fields and optimize performance"
git push origin main
```

Vercel이 자동으로 재배포합니다.

---

## 🎯 해결된 문제

### ✅ Create Goal 저장 안 되던 문제
**원인**: `goals` 테이블에 `year` 필드 없음 + `profiles` 레코드 없음  
**해결**: 
- 스키마에 `year` 필드 추가
- 코드에서 프로필 자동 생성 로직 추가
- SQL 트리거로 신규 유저 자동 프로필 생성

### ✅ 웹사이트 속도 개선
**적용된 최적화**:
1. **Next.js 설정 개선**
   - React Strict Mode 활성화
   - 이미지 최적화 (AVIF/WebP)
   - 패키지 import 최적화
   - Production 빌드 시 console.log 제거

2. **Middleware 최적화**
   - 공개 페이지(`/`, `/login`, `/u/*`)에서 불필요한 세션 체크 건너뛰기
   - 인증이 필요한 페이지만 `getUser()` 호출

3. **데이터베이스 인덱스**
   - `goals_user_year_idx`: 연도별 목표 조회 속도 향상
   - `goals_user_status_idx`: active 목표만 빠르게 조회
   - `tasks_scheduled_idx`: 일정 기반 태스크 조회 최적화
   - `logs_user_date_idx`: 날짜별 로그 조회 속도 향상

4. **에러 처리 개선**
   - 명확한 에러 메시지
   - Profile 자동 생성으로 FK 오류 방지

---

## 📊 Supabase Security Advisor 경고 해결

### ✅ Function Search Path Mutable
`handle_new_user` 함수에 `set search_path = public` 추가 완료.

### ⚠️ Leaked Password Protection Disabled
Supabase 콘솔에서 수동 활성화 필요:
1. Authentication → Settings
2. "Leaked password protection" 토글 ON
3. Save

---

## 🧪 테스트 체크리스트

스키마 수정 + 재배포 후 확인:

- [ ] 로그인 성공
- [ ] Create Goal 클릭 → 목표 생성 → `/goals`에서 확인됨
- [ ] Create Log 클릭 → 로그 생성 → `/logs`에서 확인됨
- [ ] Dashboard 위젯 커스터마이즈 저장 성공
- [ ] 페이지 로딩 속도 개선 체감 (특히 Dashboard, Goals)

---

## 💡 추가 최적화 팁

### 로컬에서 빌드 테스트
```bash
npm run build
```

에러 없이 빌드되면 배포 준비 완료.

### Vercel Analytics 활성화 (선택)
- Vercel 대시보드 → Analytics 탭
- Core Web Vitals 모니터링으로 실제 사용자 속도 측정

### Supabase RLS 정책 점검 (보안)
현재 `UNRESTRICTED` 상태면 개발용으로 괜찮지만, 프로덕션에서는 RLS 활성화 권장.

---

## ❓ 문제 해결

### Q: 여전히 "Create Goal" 에러 발생
A: Vercel 로그 확인 → 구체적인 에러 메시지 확인 후 알려주세요.

### Q: 속도가 여전히 느림
A: 
1. Vercel Analytics에서 병목 구간 확인
2. Supabase 쿼리 로그에서 느린 쿼리 확인
3. AI 호출이 많은 페이지는 원래 느릴 수 있음 (Claude API 호출 시간)

### Q: 배포 후에도 변경 안 보임
A: 브라우저 캐시 삭제 또는 시크릿 모드에서 재확인.

---

완료 후 Create Goal을 테스트하고 결과를 알려주세요! 🚀

