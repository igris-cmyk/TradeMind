# TradeMind AI Journal

An AI-powered trading journal and performance coach for retail traders. Log trades, analyze performance, track psychology, and review trading behavior from a protected dashboard.

## Tech Stack

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Radix UI, Framer Motion
- **State:** TanStack Query for server state, Zustand for local UI state
- **Backend:** Next.js App Router route handlers
- **Database:** PostgreSQL with Prisma ORM 5.22
- **Auth:** Auth.js v5 with credentials login and optional Google OAuth
- **AI:** Vercel AI SDK and OpenAI endpoints are present, gated by plan and `OPENAI_API_KEY`
- **Payments:** Stripe checkout and webhooks are scaffolded; billing must be configured before upgrades work

## Prerequisites

- Node.js 20+
- PostgreSQL database, such as Neon, Supabase, or local PostgreSQL
- Auth secret generated with `openssl rand -base64 32`
- Optional Google OAuth credentials
- Optional OpenAI and Stripe credentials for gated AI and billing flows

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Required:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - app URL, for example `http://localhost:3000`
- `AUTH_SECRET` - Auth.js secret

Optional:

- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` - Google OAuth
- `OPENAI_API_KEY` - AI analysis and coaching
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ELITE`, `STRIPE_WEBHOOK_SECRET` - billing
- `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID` - screenshot uploads

### 3. Database setup

```bash
npm run db:migrate:dev
```

There is no production seed script in this repository. Create test users through the registration flow.

For production and preview databases, apply checked-in migrations only:

```bash
npm run db:migrate:deploy
```

Do not run destructive reset commands against Neon or any shared database. `npm run db:reset:dev` is for disposable local development databases only.

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run lint` | Run Next.js lint |
| `npm run test` | Run automated security and route tests |
| `npm run db:generate` | Generate Prisma Client from `prisma/schema.prisma` |
| `npm run db:validate` | Validate the Prisma schema |
| `npm run db:migrate:dev` | Create and apply a development migration |
| `npm run db:migrate:deploy` | Apply checked-in migrations in production/preview |
| `npm run db:reset:dev` | Reset a local development database only |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```text
trademind/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── api/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── store/
│   ├── types/
│   └── validators/
├── middleware.ts
└── tailwind.config.ts
```

## Production Notes

- User plan, role, onboarding status, and subscription state must come from the database.
- Premium API routes must enforce entitlements server-side.
- Stripe upgrades require configured Stripe keys, price IDs, and verified webhooks.
- AI endpoints return production errors when OpenAI is not configured.
- Google OAuth is optional; the provider and UI button are shown only when both Google OAuth env vars are configured.
- Demo credentials are not provided by this repository.

## Migration Workflow

- Development: edit `prisma/schema.prisma`, then run `npm run db:migrate:dev -- --name <change_name>`.
- Production/preview: deploy code, then run `npm run db:migrate:deploy` against the target database.
- Prisma Client: run `npm run db:generate` after schema changes or dependency installs.
- Validation: run `npm run db:validate` before merging schema changes.
- Local reset: use `npm run db:reset:dev` only for disposable local databases.

Fresh databases are reproducible from the checked-in migrations, starting with the initial baseline migration. Existing databases that were previously created with `db:push` should be baselined carefully before production deploys; do not reset or replay migrations against real user data.

## License

MIT
