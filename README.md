# portfolio-v2

**English** | [한국어](README.ko.md)

A full-stack developer portfolio built with Next.js 16. A 3D shader hero (React Three
Fiber) and GSAP/Lenis/motion-driven interactions greet visitors on the public site; a
GitHub-OAuth-gated admin panel edits every piece of content — profile, links, skills,
companies & experiences, a merged life/career timeline, and projects — stored in
Postgres. Visitor messages from the contact form are forwarded to Telegram.

## Features

- **3D hero** — a React Three Fiber shader blob, theme-aware, reduced-motion-safe
- **Motion toolkit** — GSAP + ScrollTrigger, Lenis smooth scroll, `motion` reveals,
  scramble text, magnetic buttons, parallax, custom cursor
- **Life & career timeline** — life events merged with per-company work experience on
  one chronological timeline
- **Admin panel** (`/admin`) — GitHub OAuth login restricted to a single allow-listed
  account; CRUD for profile, links, skills, companies/experiences, timeline events,
  projects, site settings, and a messages inbox
- **Contact → Telegram** — the public contact form saves a message and forwards it to
  a Telegram chat via bot API
- **Data layer** — Prisma 7 over Postgres, Zod-validated inputs

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| 3D / motion | React Three Fiber + drei, GSAP, Lenis, `motion` |
| Styling | Tailwind CSS v4, Geist (display) + Pretendard (body) |
| Data | Prisma 7 + PostgreSQL, Zod |
| Auth | Auth.js v5 (GitHub OAuth) |
| Notifications | Telegram Bot API |
| Deploy | Vercel + Neon |
| Tests | Vitest, Testing Library |

## Getting started

```bash
# 1. install deps (also runs `prisma generate` via postinstall)
npm ci

# 2. start a local Postgres (host port 5433)
docker compose up -d

# 3. copy env vars and fill in the Auth.js / Telegram values
cp .env.example .env

# 4. apply the schema
npm run db:migrate

# 5. seed sample content
npm run db:seed

# 6. run the dev server
npm run dev
```

Open http://localhost:3000. Admin lives at http://localhost:3000/admin and only lets
in the GitHub login set as `ADMIN_GITHUB_LOGIN`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:run` | Vitest (watch / single run) |
| `npm run test:db` | Vitest suites that hit a real Postgres (`TEST_DATABASE_URL`) |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` |
| `npm run db:seed` | Seed sample content (`prisma/seed.ts`) |
| `npm run db:studio` | `prisma studio` |

## Project structure

```
src/
  app/
    (public)/          # public site: hero, about, skills, timeline, experience, projects, contact
    admin/              # admin panel pages (companies, experiences, links, messages, profile, projects, settings, skills, timeline)
    actions/            # server actions (contact, admin mutations)
    api/auth/           # Auth.js route handler
    login/              # sign-in page
  components/
    hero/               # R3F shader hero
    motion/              # GSAP/Lenis/motion primitives (Reveal, ScrambleText, Magnetic, Parallax, Cursor)
    sections/            # public-page sections
    admin/, admin-timeline/  # admin UI
    theme/                # theme provider/toggle
  hooks/                 # useGsap, useThemeColors, useIsTouch, useReducedMotionPref
  lib/
    data/                # Prisma-backed queries/mutations (barrel: @/lib/data)
    schemas/              # Zod input schemas
    db/                   # Prisma client
    auth/, telegram.ts     # auth guards, Telegram sender
  auth.ts, proxy.ts        # Auth.js config, /admin route gate
prisma/                    # schema, migrations, seed
docs/DEPLOY.md              # Vercel + Neon deploy runbook
```

## Admin & Telegram

Sign in at `/login` with the GitHub account matching `ADMIN_GITHUB_LOGIN` — any other
account is rejected. From `/admin` you can edit every section of the public site and
configure the Telegram bot token/chat id under `/admin/settings` (with a test-send
button). Once configured, the public contact form relays new messages to that chat;
delivery failure never blocks the visitor's submission — it's recorded in the admin
messages inbox for manual follow-up.

## Deploy

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full Vercel + Neon runbook (env vars,
GitHub OAuth app, migrations, seeding, Telegram setup, smoke checklist).

## License

Personal project — no license granted for reuse.
