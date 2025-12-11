# Archive 26 - Vercel 배포 가이드

## 📋 배포 전 체크리스트

### 1. Supabase 프로젝트 준비

1. [Supabase](https://supabase.com) 대시보드에서 프로젝트 생성
2. SQL Editor에서 모든 테이블 생성:
   - `profiles`
   - `goals`, `milestones`, `tasks`
   - `logs`
   - `projects`, `project_resources`
   - `habits`, `habit_logs`
   - `dashboard_widgets`
   - `showcase_items`
   - `annual_reports`

3. Row Level Security (RLS) 정책 활성화 확인

### 2. Anthropic API 키 발급

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. API Keys 메뉴에서 새 키 생성
3. 키를 안전하게 복사

### 3. 환경 변수 준비

`.env.example` 파일을 참고하여 필요한 값들을 준비:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

---

## 🚀 Vercel 배포 단계

### 방법 1: Vercel CLI 사용

```bash
# 1. Vercel CLI 설치 (처음만)
npm install -g vercel

# 2. 프로젝트 디렉토리에서
cd /Users/garden/Desktop/A26

# 3. Vercel 로그인
vercel login

# 4. 배포 (처음)
vercel

# 5. 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub + Vercel Dashboard (추천)

#### Step 1: GitHub에 푸시

```bash
cd /Users/garden/Desktop/A26

# Git 초기화 (아직 안 했다면)
git init

# 첫 커밋
git add .
git commit -m "feat: Archive 26 V2 initial commit"

# GitHub repository 생성 후
git remote add origin https://github.com/your-username/archive-26.git
git branch -M main
git push -u origin main
```

#### Step 2: Vercel에서 Import

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub repository 선택 (archive-26)
4. "Import" 클릭

#### Step 3: 환경 변수 설정

**Vercel Dashboard → Project Settings → Environment Variables**

다음 환경 변수들을 **Production**, **Preview**, **Development** 모두에 추가:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

#### Step 4: 배포

"Deploy" 버튼 클릭 → 자동 배포 시작 (2-3분 소요)

---

## ⚙️ Vercel 프로젝트 설정

### Build & Development Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Root Directory

- 프로젝트 루트: `./` (기본값)

---

## 🔧 배포 후 확인사항

### 1. 환경 변수 확인

Vercel Dashboard → Settings → Environment Variables에서 모든 변수가 설정되었는지 확인

### 2. 빌드 로그 확인

배포 페이지에서 "Building" 로그 확인:
- TypeScript 에러 없는지
- 빌드 성공하는지

### 3. 도메인 확인

기본 도메인: `your-project-name.vercel.app`

### 4. 기능 테스트

- [ ] 로그인/회원가입 작동
- [ ] Dashboard 로드
- [ ] Goals CRUD
- [ ] AI Pathfinder 작동
- [ ] Logs 작성
- [ ] Showcase 페이지 (`/u/[handle]`)

---

## 🐛 문제 해결

### 빌드 실패 시

```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 후 수정
# 수정 후 다시 push
```

### 환경 변수 누락

Vercel Dashboard → Settings → Environment Variables → Redeploy

### Supabase 연결 실패

1. Supabase URL이 정확한지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. CORS 설정 확인 (Supabase Dashboard → Settings → API)

### AI 기능 오류

1. `ANTHROPIC_API_KEY`가 정확히 입력되었는지 확인
2. API 키에 충분한 크레딧이 있는지 확인
3. Rate limit 확인

---

## 📊 성능 최적화 (선택사항)

### 1. 이미지 최적화

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
}
```

### 2. 리다이렉트 설정

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'sb-access-token',
          },
        ],
      },
    ]
  },
}
```

---

## 🔐 보안 체크리스트

- [x] `.env.local`이 `.gitignore`에 포함됨
- [ ] Supabase RLS 정책 활성화
- [ ] 모든 API 키가 환경 변수로 관리됨
- [ ] Rate limiting 설정 (Supabase/Anthropic)

---

## 📱 커스텀 도메인 (선택사항)

Vercel Dashboard → Settings → Domains → Add Domain

예: `archive26.com` 또는 `yourdomain.com`

---

## 🔄 자동 배포 설정

GitHub repository에 push하면 자동으로 배포됩니다:

- `main` branch → Production 배포
- 다른 branch → Preview 배포

---

## 💡 추가 팁

### Vercel Analytics 활성화

Vercel Dashboard → Analytics → Enable

### 배포 후 로그 확인

Vercel Dashboard → Deployments → [최신 배포] → Function Logs

### 캐싱 최적화

Next.js는 자동으로 캐싱을 처리하지만, 필요시 `revalidate` 옵션 조정 가능

---

## 📞 도움이 필요하면

- Vercel 문서: https://vercel.com/docs
- Supabase 문서: https://supabase.com/docs
- Next.js 배포: https://nextjs.org/docs/deployment

