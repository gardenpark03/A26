# 🚀 Archive 26 - Vercel 배포 가이드

## ✅ 빌드 성공 확인됨!

로컬 빌드가 성공적으로 완료되었습니다. 이제 Vercel에 배포할 준비가 되었습니다.

---

## 📋 배포 전 필수 준비사항

### 1. Supabase 프로젝트 설정

#### 1-1. Supabase 프로젝트 생성
1. https://supabase.com 접속
2. "New Project" 클릭
3. Organization 선택 및 프로젝트 이름 입력
4. 데이터베이스 비밀번호 설정
5. Region 선택 (추천: Northeast Asia (Tokyo))

#### 1-2. 데이터베이스 스키마 생성

Supabase Dashboard → SQL Editor에서 다음 SQL들을 순서대로 실행:

**1. ENUM 타입들:**
```sql
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high');
CREATE TYPE task_source AS ENUM ('ai', 'manual', 'fork');
CREATE TYPE log_mood AS ENUM ('very_bad', 'bad', 'neutral', 'good', 'very_good');
CREATE TYPE log_visibility AS ENUM ('private', 'public');
```

**2. 기본 테이블들:**
- `profiles`
- `goals`, `milestones`, `tasks`
- `logs`
- `projects`, `project_resources`
- `habits`, `habit_logs`
- `dashboard_widgets`
- `showcase_items`
- `annual_reports`

모든 SQL은 이전에 제공된 스키마 파일들을 참고하세요.

#### 1-3. API 키 복사

Supabase Dashboard → Settings → API

다음 값들을 복사해두세요:
- **Project URL**: `https://your-project.supabase.co`
- **anon public key**: `eyJ...`
- **service_role key**: `eyJ...` (선택사항)

---

### 2. Anthropic API 키 발급

1. https://console.anthropic.com/ 접속
2. "API Keys" 메뉴
3. "Create Key" 클릭
4. 키 이름 입력 (예: "Archive26-Production")
5. 생성된 키 복사: `sk-ant-api03-...`

⚠️ **중요**: 이 키는 한 번만 표시되므로 안전하게 저장하세요!

---

## 🌐 Vercel 배포 방법

### 방법 1: GitHub 연동 (추천 ⭐)

#### Step 1: GitHub Repository 생성

```bash
cd /Users/garden/Desktop/A26

# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "feat: Archive 26 V2 complete implementation"

# GitHub에서 새 repository 생성 후
git remote add origin https://github.com/YOUR_USERNAME/archive-26.git
git branch -M main
git push -u origin main
```

#### Step 2: Vercel에서 Import

1. https://vercel.com 접속 및 로그인
2. "Add New..." → "Project" 클릭
3. "Import Git Repository" 선택
4. GitHub repository 연결 (archive-26)
5. "Import" 클릭

#### Step 3: 프로젝트 설정

**Framework Preset**: Next.js (자동 감지됨)
**Root Directory**: `./` (기본값)
**Build Command**: `npm run build` (기본값)
**Output Directory**: `.next` (기본값)

#### Step 4: 환경 변수 설정 ⚠️ 중요!

"Environment Variables" 섹션에서 다음 변수들을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Environment 선택**: Production, Preview, Development 모두 체크

#### Step 5: 배포

"Deploy" 버튼 클릭!

⏱️ 배포 시간: 약 2-3분

---

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트 디렉토리에서
cd /Users/garden/Desktop/A26

# 배포 (처음)
vercel

# 환경 변수 설정 (CLI에서)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY

# 프로덕션 배포
vercel --prod
```

---

## 🔧 배포 후 설정

### 1. Supabase URL 화이트리스트

Supabase Dashboard → Settings → API → URL Configuration

**Allowed Redirect URLs**에 추가:
```
https://your-project.vercel.app/auth/callback
https://your-project.vercel.app/**
```

### 2. 도메인 확인

배포 완료 후 Vercel이 제공하는 URL:
```
https://your-project-name.vercel.app
```

### 3. 커스텀 도메인 (선택)

Vercel Dashboard → Settings → Domains → Add Domain

예: `archive26.com`

---

## ✅ 배포 후 테스트 체크리스트

- [ ] 메인 페이지 로드 (`/`)
- [ ] 로그인 페이지 작동 (`/login`)
- [ ] 회원가입 작동
- [ ] Dashboard 로드 (`/dashboard`)
- [ ] Goals CRUD 작동 (`/goals`)
- [ ] AI Pathfinder 작동 (`/goals/ai`)
- [ ] Logs 작성 (`/logs/new`)
- [ ] AI Log Editor 작동
- [ ] Timeline View (`/timeline`)
- [ ] Showcase 페이지 (`/u/[handle]`)
- [ ] Fork Plan 작동
- [ ] Habits 체크인 (`/habits`)
- [ ] Memory Graph (`/graph`)
- [ ] AI Advisor (`/advisor`)
- [ ] Monthly Report (`/reports/[year]/[month]`)
- [ ] Annual Report (`/reports/annual`)

---

## 🐛 문제 해결

### 빌드 실패

**로컬에서 테스트:**
```bash
npm run build
```

에러가 나면 수정 후 다시 push

### 환경 변수 누락

Vercel Dashboard → Settings → Environment Variables

모든 변수가 올바르게 입력되었는지 확인 후 "Redeploy"

### Supabase 연결 오류

1. **URL 확인**: `https://`로 시작하는지
2. **Key 확인**: 공백이나 줄바꿈 없는지
3. **RLS 정책**: 모든 테이블에 RLS 정책이 설정되었는지

### AI 기능 오류

1. **API 키 확인**: `ANTHROPIC_API_KEY`가 정확한지
2. **크레딧 확인**: Anthropic Console에서 잔액 확인
3. **Rate Limit**: 너무 많은 요청 시 잠시 대기

### 404 에러

1. **라우트 확인**: 파일 경로가 올바른지
2. **빌드 로그**: Vercel Dashboard에서 빌드 로그 확인
3. **Middleware**: `middleware.ts`가 올바르게 작동하는지

---

## 📊 모니터링

### Vercel Analytics

Vercel Dashboard → Analytics → Enable

방문자 수, 페이지 뷰, 성능 지표 확인

### Supabase Logs

Supabase Dashboard → Logs

데이터베이스 쿼리, 에러 로그 확인

### Function Logs

Vercel Dashboard → Deployments → [최신 배포] → Function Logs

서버 액션, API 호출 로그 확인

---

## 🎨 추가 최적화 (선택사항)

### 1. 이미지 최적화

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### 2. 캐싱 전략

```typescript
// 특정 페이지에서
export const revalidate = 3600 // 1시간마다 재검증
```

### 3. Vercel Speed Insights

```bash
npm install @vercel/speed-insights

// app/layout.tsx에 추가
import { SpeedInsights } from '@vercel/speed-insights/next'

<body>
  {children}
  <SpeedInsights />
</body>
```

---

## 🔐 보안 체크리스트

- [x] `.env.local`이 `.gitignore`에 포함됨
- [ ] Supabase RLS 정책 모든 테이블에 활성화
- [ ] API 키가 환경 변수로만 관리됨
- [ ] Rate limiting 설정 (Supabase/Anthropic)
- [ ] CORS 설정 확인
- [ ] 민감한 데이터 로깅 제거

---

## 📱 자동 배포 설정

GitHub에 push하면 자동 배포:

- `main` branch → **Production** 배포
- 다른 branch → **Preview** 배포

```bash
# 코드 수정 후
git add .
git commit -m "feat: add new feature"
git push

# Vercel이 자동으로 감지하고 배포 시작!
```

---

## 🎉 배포 완료!

축하합니다! **Archive 26**이 성공적으로 배포되었습니다!

**프로덕션 URL**: `https://your-project.vercel.app`

### 다음 단계:

1. ✅ 모든 기능 테스트
2. ✅ 실제 데이터로 사용해보기
3. ✅ 친구들과 공유 (Showcase 기능)
4. ✅ 피드백 수집 및 개선

---

## 📞 도움이 필요하면

- **Vercel 문서**: https://vercel.com/docs
- **Supabase 문서**: https://supabase.com/docs
- **Next.js 배포**: https://nextjs.org/docs/deployment
- **Anthropic API**: https://docs.anthropic.com/

---

## 🎊 Archive 26 V2 완성!

**구현된 기능 목록:**

✅ Auth & Profiles
✅ Goals / Milestones / Tasks (CRUD)
✅ AI Pathfinder (로드맵 자동 생성)
✅ Logs (+ AI Editor, Auto-tagging)
✅ Workspace (Projects + Resources + AI Summary)
✅ Habits / Daily Rituals
✅ Dashboard (Customizable Widgets)
✅ Timeline View
✅ AI Advisor
✅ Memory Graph
✅ Showcase & Fork Plan
✅ Monthly Reports
✅ Annual Report

**Make 2026 Count!** 🚀

