# JobFlow — AI-Powered Job Ad Builder

**Live:** https://jobflow-omega-lemon.vercel.app

채용 담당자가 AI의 도움으로 구인 공고를 작성·최적화·발행하는 SaaS 플랫폼입니다.
핵심 차별점은 **실시간 지원자 시점 프리뷰**와 **AI 최적화 점수**입니다.

---

## 왜 이 프로젝트인가

| 채용 공고 키워드 | 이 프로젝트에서 |
|---|---|
| `es-toolkit` · `ts-pattern` 선언적 코드 | 모든 상태 분기에 ts-pattern `.exhaustive()` 적용, 데이터 변환에 es-toolkit 사용 |
| Apollo · GraphQL 클라이언트 | Pothos(type-safe schema) + GraphQL Yoga + Apollo Client 4 |
| LLM을 제품 경험으로 연결 | GPT-4o 스트리밍으로 공고 초안 실시간 생성, AI 최적화 점수 |
| 광고주·구인자 화면 + 복잡한 도메인 | 요금제(Free/Pro/Team), Stripe 구독, 플랜별 기능 게이팅 |
| 트래픽·데이터로 성과 판단 | 조회수·지원수 집계, AI 점수 0–100 추적 |

---

## 핵심 기능 흐름

### 1. AI 공고 생성 (스트리밍)

```
사용자: 직책·회사·스킬 입력
     ↓
POST /api/ai/generate  →  GPT-4o (SSE streaming)
     ↓
토큰 단위로 에디터에 실시간 반영
     ↓
최종 JSON 파싱 → 모든 필드 자동 채움
```

GPT-4o가 구조화된 JSON(제목·설명·요구사항·복지)을 스트리밍으로 반환하고,
클라이언트는 SSE 청크를 파싱하며 에디터를 실시간으로 채웁니다.

### 2. 실시간 지원자 시점 프리뷰

에디터에서 타이핑하면 Zustand store가 즉시 업데이트되고, 오른쪽 패널이 당근알바/원티드 스타일의 카드로 렌더링됩니다. 디바운스 없이 동기 렌더링이므로 300ms 이하 응답성을 보장합니다.

### 3. AI 최적화 점수

```
POST /api/ai/score  →  GPT-4o
     ↓
{
  score: 84,          // 0-100
  grade: "B",
  breakdown: { clarity, specificity, candidate_appeal, completeness },
  suggestions: [{ field, issue, fix, impact }]
}
     ↓
제안 클릭 → 해당 필드 하이라이트
```

### 4. 플랜·구독 (Stripe)

```
Free  →  공고 3개, AI 없음
Pro   →  무제한 + AI 생성·점수  ($9/mo)
Team  →  Pro + 팀원 5명         ($29/mo)
```

`PlanGate` 컴포넌트가 플랜을 확인해 AI 기능을 게이팅합니다.
Stripe 웹훅(`subscription.created/updated/deleted`)이 DB의 `plan` 필드를 동기화합니다.

---

## 기술 스택 & 설계 결정

### GraphQL — Pothos + GraphQL Yoga + Apollo Client

스키마를 TypeScript로 코드-퍼스트로 정의합니다. `any` 타입이 리졸버에 없고, Pothos Relay 플러그인으로 커서 기반 페이지네이션을 구현했습니다.

```ts
// lib/graphql/schema.ts
const JobPostingType = builder.prismaObject('JobPosting', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    aiScore: t.exposeInt('aiScore', { nullable: true }),
    // ...타입 안전하게 모든 필드 노출
  }),
})
```

### ts-pattern — 상태 분기

`if/else` 체인 대신 `.exhaustive()`로 누락된 케이스를 컴파일 타임에 잡습니다.

```ts
// 모든 상태 레이블, 배지, 라벨에 동일하게 적용
const label = match(posting.status)
  .with('DRAFT',     () => '임시저장')
  .with('PUBLISHED', () => '게시중')
  .with('PAUSED',    () => '일시중지')
  .with('EXPIRED',   () => '마감됨')
  .exhaustive() // 새 status 추가 시 컴파일 오류로 강제
```

### es-toolkit — 데이터 변환

```ts
import { debounce, groupBy, sortBy } from 'es-toolkit'

// 2초 디바운스 자동저장
const debouncedSave = useRef(debounce(savePosting, 2000))

// 대시보드 공고 그룹핑
const byStatus = groupBy(postings, (p) => p.status)
```

### Zustand — 에디터 상태

에디터의 모든 필드, 저장 상태, AI 생성 상태, 점수, 프리뷰 모드를 단일 스토어에서 관리합니다. 서버 액션과 클라이언트 상태 사이의 불필요한 리렌더를 최소화합니다.

---

## 아키텍처

```
app/
├── api/
│   ├── graphql/        # GraphQL Yoga (Pothos 스키마)
│   ├── ai/
│   │   ├── generate/   # GPT-4o SSE 스트리밍
│   │   └── score/      # AI 최적화 점수
│   └── stripe/         # 결제·웹훅
├── dashboard/          # 공고 목록, 통계
├── postings/[id]/edit/ # 분할 패널 에디터
└── postings/[id]/preview/ # 공개 공고 URL

components/
├── editor/
│   ├── PostingEditor.tsx   # 메인 에디터 (분할 패널)
│   ├── MarkdownEditor.tsx  # TipTap 리치 텍스트
│   ├── AiGenerateModal.tsx # AI 생성 입력 + 스트리밍 뷰
│   └── ScorePanel.tsx      # 점수 링 + 클릭 가능한 제안
└── preview/
    └── CandidatePreview.tsx # 당근알바 스타일 카드

lib/
├── graphql/schema.ts   # Pothos 타입 안전 스키마
├── ai/
│   ├── generator.ts    # 스트리밍 생성
│   └── scorer.ts       # 구조화된 점수 분석
└── stripe/             # 결제 + 웹훅 핸들러
```

---

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 편집: DATABASE_URL, AUTH_*, OPENAI_API_KEY, STRIPE_*

# 3. PostgreSQL 실행 (Docker)
docker compose up -d

# 4. DB 마이그레이션
DATABASE_URL="postgresql://jobflow:jobflow@localhost:5432/jobflow" npx prisma migrate dev

# 5. 개발 서버
DATABASE_URL="postgresql://jobflow:jobflow@localhost:5432/jobflow" npm run dev
```

### 필요 환경 변수

| 변수 | 설명 |
|---|---|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `AUTH_SECRET` | NextAuth 세션 서명 시크릿 |
| `AUTH_GOOGLE_ID/SECRET` | Google OAuth 앱 자격증명 |
| `AUTH_GITHUB_ID/SECRET` | GitHub OAuth 앱 자격증명 |
| `OPENAI_API_KEY` | GPT-4o API 키 |
| `STRIPE_SECRET_KEY` | Stripe 시크릿 키 |
| `STRIPE_WEBHOOK_SECRET` | Stripe 웹훅 서명 시크릿 |
| `STRIPE_PRO_PRICE_ID` | Pro 플랜 가격 ID |
| `STRIPE_TEAM_PRICE_ID` | Team 플랜 가격 ID |

---

## 데모 시나리오

> "당근마켓 프론트엔드 엔지니어 인턴 채용 공고를 생성해줘. React, GraphQL, TypeScript 스킬, 캐주얼 톤."

1. AI가 5–8초 안에 완성된 공고를 스트리밍으로 생성
2. 오른쪽 프리뷰가 실시간으로 채워짐
3. Score 버튼 → 84/100 · B등급, 3개 구체적 제안
4. 제안 클릭 → 해당 필드 하이라이트
5. Publish → ts-pattern `.exhaustive()`로 `DRAFT → PUBLISHED` 전환
6. 공개 URL 공유 가능 (`/postings/[id]/preview`)
