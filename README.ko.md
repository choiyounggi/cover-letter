# portfolio-v2

[English](README.md) | **한국어**

Next.js 16 기반 풀스택 개발자 포트폴리오. 퍼블릭 사이트는 3D 셰이더 히어로(React
Three Fiber)와 GSAP/Lenis/motion 기반 인터랙션으로 방문자를 맞이하고, GitHub OAuth로
보호되는 관리자 페이지에서 프로필·링크·스킬·회사/경력·라이프-커리어 타임라인·프로젝트
등 모든 콘텐츠를 Postgres에 저장된 데이터로 편집합니다. 문의 폼으로 들어온 메시지는
텔레그램으로 전달됩니다.

## 기능

- **3D 히어로** — React Three Fiber 셰이더 블롭, 테마 반응형, reduced-motion 대응
- **모션 툴킷** — GSAP + ScrollTrigger, Lenis 스무스 스크롤, `motion` 리빌, 스크램블
  텍스트, 마그네틱 버튼, 패럴랙스, 커스텀 커서
- **라이프 & 커리어 타임라인** — 인생 이벤트와 회사별 경력을 하나의 시간순 타임라인으로
  병합
- **관리자 패널** (`/admin`) — 허용된 단일 계정만 로그인 가능한 GitHub OAuth; 프로필,
  링크, 스킬, 회사/경력, 타임라인 이벤트, 프로젝트, 사이트 설정 CRUD와 메시지함
- **문의 → 텔레그램** — 퍼블릭 문의 폼이 메시지를 저장하고 텔레그램 봇 API로 전달
- **데이터 레이어** — Postgres 위의 Prisma 7, Zod로 입력 검증

## 스택

| 레이어 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, React 19) |
| 3D / 모션 | React Three Fiber + drei, GSAP, Lenis, `motion` |
| 스타일 | Tailwind CSS v4, Geist(디스플레이) + Pretendard(본문) |
| 데이터 | Prisma 7 + PostgreSQL, Zod |
| 인증 | Auth.js v5 (GitHub OAuth) |
| 알림 | Telegram Bot API |
| 배포 | Vercel + Neon |
| 테스트 | Vitest, Testing Library |

## 시작하기

```bash
# 1. 의존성 설치 (postinstall에서 `prisma generate` 자동 실행)
npm ci

# 2. 로컬 Postgres 실행 (호스트 포트 5433)
docker compose up -d

# 3. 환경변수 복사 후 Auth.js / 텔레그램 값 채우기
cp .env.example .env

# 4. 스키마 적용
npm run db:migrate

# 5. 샘플 콘텐츠 시드
npm run db:seed

# 6. 개발 서버 실행
npm run dev
```

http://localhost:3000 을 엽니다. 관리자 페이지는 http://localhost:3000/admin 이며
`ADMIN_GITHUB_LOGIN`에 설정한 GitHub 계정만 로그인할 수 있습니다.

## 스크립트

| 스크립트 | 설명 |
|---|---|
| `npm run dev` | Next.js 개발 서버 실행 |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:run` | Vitest (watch / 단일 실행) |
| `npm run test:db` | 실제 Postgres(`TEST_DATABASE_URL`)를 사용하는 Vitest 스위트 |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` |
| `npm run db:seed` | 샘플 콘텐츠 시드 (`prisma/seed.ts`) |
| `npm run db:studio` | `prisma studio` |

## 프로젝트 구조

```
src/
  app/
    (public)/          # 퍼블릭 사이트: 히어로, 소개, 스킬, 타임라인, 경력, 프로젝트, 문의
    admin/              # 관리자 페이지 (회사, 경력, 링크, 메시지, 프로필, 프로젝트, 설정, 스킬, 타임라인)
    actions/            # 서버 액션 (문의, 관리자 mutation)
    api/auth/           # Auth.js 라우트 핸들러
    login/              # 로그인 페이지
  components/
    hero/               # R3F 셰이더 히어로
    motion/              # GSAP/Lenis/motion 프리미티브 (Reveal, ScrambleText, Magnetic, Parallax, Cursor)
    sections/            # 퍼블릭 페이지 섹션
    admin/, admin-timeline/  # 관리자 UI
    theme/                # 테마 프로바이더/토글
  hooks/                 # useGsap, useThemeColors, useIsTouch, useReducedMotionPref
  lib/
    data/                # Prisma 기반 쿼리/뮤테이션 (barrel: @/lib/data)
    schemas/              # Zod 입력 스키마
    db/                   # Prisma 클라이언트
    auth/, telegram.ts     # 인증 가드, 텔레그램 전송
  auth.ts, proxy.ts        # Auth.js 설정, /admin 라우트 게이트
prisma/                    # 스키마, 마이그레이션, 시드
docs/DEPLOY.md              # Vercel + Neon 배포 런북
```

## 관리자 & 텔레그램

`/login`에서 `ADMIN_GITHUB_LOGIN`과 일치하는 GitHub 계정으로 로그인합니다 — 다른
계정은 거부됩니다. `/admin`에서 퍼블릭 사이트의 모든 섹션을 편집할 수 있고,
`/admin/settings`에서 텔레그램 봇 토큰/채팅 ID를 설정합니다(테스트 전송 버튼 포함).
설정이 끝나면 퍼블릭 문의 폼이 새 메시지를 해당 채팅으로 전달합니다 — 전송 실패는
방문자의 제출을 막지 않으며, 관리자 메시지함에 기록되어 수동으로 확인할 수 있습니다.

## 배포

전체 Vercel + Neon 런북(환경변수, GitHub OAuth 앱, 마이그레이션, 시드, 텔레그램 설정,
스모크 체크리스트)은 [`docs/DEPLOY.md`](docs/DEPLOY.md)를 참고하세요.

## 라이선스

개인 프로젝트 — 재사용을 위한 라이선스는 부여되지 않습니다.
