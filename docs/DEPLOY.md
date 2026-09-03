# Deploy runbook — Vercel + Neon

portfolio-v2를 Vercel(호스팅) + Neon(Postgres)에 처음 배포하고, 이후 스키마 변경마다
반복할 절차입니다. 순서대로 진행하세요.

## 1. Neon 프로젝트 생성

1. [Neon](https://neon.tech)에서 새 프로젝트를 만듭니다.
2. Neon은 연결 문자열을 두 가지로 제공합니다 — **둘 다 필요합니다**:
   - **Pooled URL** (`...-pooler.neon.tech`, `sslmode=require`) — 앱이 요청마다 새
     연결을 여는 서버리스 환경(Vercel)에 맞는 커넥션 풀링 엔드포인트. **이 URL을
     `DATABASE_URL`로 사용합니다.**
   - **Direct URL** (`...neon.tech`, `sslmode=require`, pooler 없음) — `prisma
     migrate deploy`처럼 세션 고정이 필요한 마이그레이션 작업 전용. 아래 4단계에서만
     사용하고 앱 런타임 환경변수로는 넣지 않습니다.
3. `next build`는 `/` 페이지를 ISR(60초)로 프리렌더하면서 실제 DB를 조회하므로,
   **빌드 단계에서도 `DATABASE_URL`이 연결 가능해야 합니다** — 3단계에서 Production과
   Preview 스코프 모두에 pooled URL을 등록하세요.

## 2. GitHub OAuth App

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. **Homepage URL**: 배포될 사이트 URL (예: `https://your-domain.vercel.app`).
3. **Authorization callback URL**:
   - 프로덕션: `https://<domain>/api/auth/callback/github`
   - 로컬 개발용으로 앱을 하나 더 만들거나 같은 앱에 추가: `http://localhost:3000/api/auth/callback/github`
4. 발급된 **Client ID**와 **Client Secret**을 보관합니다 (`AUTH_GITHUB_ID` /
   `AUTH_GITHUB_SECRET`).

## 3. Vercel 프로젝트 import + 환경변수

1. Vercel에서 이 저장소를 import합니다. Next.js가 자동 감지되므로 `vercel.json`은
   필요 없습니다.
2. Project Settings → Environment Variables에 `.env.example`의 모든 키를 등록합니다
   (Production, Preview 둘 다 체크):

   | 키 | 값 | 비고 |
   |---|---|---|
   | `DATABASE_URL` | Neon **pooled** URL (`sslmode=require`) | 런타임 + 빌드 시 프리렌더에 사용 |
   | `AUTH_SECRET` | `npx auth secret` 출력값 | Auth.js 세션 암호화 키 |
   | `AUTH_GITHUB_ID` | GitHub OAuth App Client ID | 2단계에서 발급 |
   | `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret | 2단계에서 발급 |
   | `ADMIN_GITHUB_LOGIN` | 관리자로 허용할 GitHub 로그인(username) | 이 계정만 `/admin` 진입 가능 |
   | `NEXT_PUBLIC_SITE_URL` | `https://<domain>` | 절대 URL이 필요한 곳에서 사용 |

## 4. 첫 배포 → 마이그레이션 → 시드

1. Vercel에서 첫 배포를 실행합니다 (`prisma generate && next build`가 postinstall +
   build 스크립트로 자동 수행됩니다. 아직 스키마가 없으면 `/` 프리렌더가 실패할 수
   있으니, 가능하면 이 단계 전에 아래 마이그레이션을 먼저 실행하세요).
2. 로컬 셸에서 **direct URL**로 마이그레이션을 적용합니다:

   ```bash
   DATABASE_URL="<Neon direct URL>" npx prisma migrate deploy
   ```

   Neon 콘솔에서 값을 복사해도 되고, 이미 Vercel에 프로젝트를 연결했다면
   `vercel env pull .env.local`로 등록된 값을 받아온 뒤 direct URL로 바꿔 써도
   됩니다.
3. 같은 direct URL로 샘플 콘텐츠를 시드합니다:

   ```bash
   DATABASE_URL="<Neon direct URL>" npm run db:seed
   ```

4. 스키마를 바꿀 때마다(향후 마이그레이션 추가 시) 2번을 반복합니다. `next build`
   안에는 마이그레이션 단계가 없습니다 — direct URL이 없고, 프리뷰 배포마다 매번
   실행되는 것을 피하기 위함입니다.

## 5. 텔레그램 봇

1. 텔레그램에서 [@BotFather](https://t.me/BotFather)에게 `/newbot`으로 새 봇을
   만들고 **bot token**을 받습니다.
2. 봇에게 아무 메시지나 보낸 뒤, 아래 URL을 열어 **chat id**를 확인합니다:

   ```
   https://api.telegram.org/bot<token>/getUpdates
   ```

   응답의 `result[0].message.chat.id` 값이 chat id입니다.
3. 배포된 사이트의 `/admin/settings`에서 봇 토큰과 chat id를 입력하고 **테스트
   전송** 버튼으로 확인합니다.

## 6. 스모크 체크리스트

- [ ] `/` — 히어로/섹션이 렌더링되고 콘솔 에러 없음
- [ ] `/admin` — 비로그인 상태에서 `/login`으로 리다이렉트됨
- [ ] `/login` — `ADMIN_GITHUB_LOGIN` 계정으로 로그인 성공, 다른 계정은 거부됨
- [ ] 문의 폼 제출 → 텔레그램 채팅에 메시지 도착, `/admin/messages`에도 기록됨
