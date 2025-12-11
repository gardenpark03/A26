# AI Roadmap 생성 오류 해결 가이드

## 🔍 문제 원인

"Failed to generate roadmap from AI" 에러는 주로 다음 원인으로 발생합니다:

1. **ANTHROPIC_API_KEY 환경 변수 미설정**
2. **API 키가 유효하지 않음**
3. **API 호출 한도 초과**
4. **네트워크 문제**

---

## ✅ 해결 방법

### 1. Vercel 환경 변수 설정

**Vercel Dashboard → Project → Settings → Environment Variables**

다음 환경 변수를 추가하세요:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Anthropic API 키 |

**API 키 발급 방법:**
1. [Anthropic Console](https://console.anthropic.com/) 접속
2. API Keys 메뉴에서 새 키 생성
3. 생성된 키를 복사하여 Vercel에 추가

### 2. 로컬 개발 환경 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**중요:** `.env.local`은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)

### 3. 환경 변수 확인

Vercel에서 환경 변수가 제대로 설정되었는지 확인:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. `ANTHROPIC_API_KEY`가 **Production, Preview, Development** 모두에 설정되어 있는지 확인
3. 설정 후 **Redeploy** 실행

---

## 🧪 테스트 방법

### 1. 환경 변수 확인

로컬에서 테스트:
```bash
# .env.local 파일 확인
cat .env.local | grep ANTHROPIC_API_KEY

# 서버 재시작
npm run dev
```

### 2. AI Roadmap 생성 테스트

1. `/goals/ai` 페이지 접속
2. 목표 입력 (예: "건강한 몸 만들기")
3. "로드맵 생성하기" 클릭
4. 에러 메시지 확인:
   - "ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다" → 환경 변수 미설정
   - "API 키가 유효하지 않습니다" → API 키 문제
   - "API 호출 한도에 도달했습니다" → 한도 초과

---

## 🔧 추가 문제 해결

### API 키는 있는데 여전히 에러가 발생하는 경우

1. **API 키 형식 확인**
   - 올바른 형식: `sk-ant-api03-...`
   - 잘못된 형식: `sk-ant-...` (구버전)

2. **API 키 권한 확인**
   - Anthropic Console에서 키가 활성화되어 있는지 확인
   - 사용량 한도 확인

3. **Vercel 재배포**
   - 환경 변수 추가/수정 후 반드시 Redeploy 필요
   - Settings → Deployments → 최신 배포 → Redeploy

4. **로컬 vs 프로덕션 확인**
   - 로컬: `.env.local` 파일 확인
   - 프로덕션: Vercel 환경 변수 확인

---

## 📝 수정된 코드

다음 파일들이 개선되었습니다:

- `lib/ai/pathfinder.ts` - 상세한 에러 메시지 추가
- `app/(app)/goals/ai/actions.ts` - 입력값 검증 추가

이제 에러 발생 시 더 명확한 메시지를 볼 수 있습니다.

---

## 🚀 빠른 체크리스트

- [ ] Anthropic API 키 발급 완료
- [ ] Vercel 환경 변수에 `ANTHROPIC_API_KEY` 추가
- [ ] 로컬 `.env.local` 파일에 API 키 추가 (개발용)
- [ ] Vercel Redeploy 실행
- [ ] `/goals/ai` 페이지에서 테스트

---

## 💡 참고

- Anthropic API는 유료 서비스입니다 (무료 크레딧 제공)
- API 호출 한도는 Anthropic Console에서 확인 가능
- 로컬 개발 시에도 API 키가 필요합니다

