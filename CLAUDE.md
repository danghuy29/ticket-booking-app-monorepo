# CLAUDE.md

Fullstack ticket booking app. Bun workspaces monorepo. See README.md for the full structure.

## Stack

- Runtime / package manager / test runner: **Bun** (never use npm, yarn, pnpm, node, npx — use `bun`, `bunx`)
- `apps/api` (`@ticket/api`): NestJS 12 (ESM), run directly from TS source by Bun — no `nest` CLI, no build step
- `apps/web` (`@ticket/web`): React 19, Vite 8, React Router 8 (`react-router` package, data router), TanStack Query 5
- `packages/shared` (`@ticket/shared`): zod 4 schemas + TS types shared by FE and BE, consumed as TS source (no build)
- DB: PostgreSQL 18 via `docker-compose.yml`, Drizzle ORM (`postgres` driver) + drizzle-kit migrations
- Lint/format: Biome (double quotes, semicolons, trailing commas, width 100). No ESLint/Prettier.

## Commands (run from repo root)

```bash
bun run dev              # API (:3000) + Web (:5173) together
bun run typecheck        # tsc in all workspaces
bun run test             # bun test in all workspaces
bun run lint:fix         # Biome format + lint + organize imports
bun run db:up            # start Postgres container
bun run db:generate      # generate SQL migration from schema.ts
bun run db:migrate       # apply migrations
bun run --filter @ticket/api test   # single workspace
cd apps/api && bun test src/modules/health   # single test path
```

Before finishing a task, run `bun run lint:fix && bun run typecheck && bun run test`.

## Conventions

### Shared contracts
- Every request body / query / param schema lives in `packages/shared/src/schemas/<feature>.ts` as zod,
  with `export type X = z.infer<typeof xSchema>`; response shapes are `interface XDto` (dates as ISO `string`).
- Export everything through `packages/shared/src/index.ts`. Import as `@ticket/shared`, never via relative path across workspaces.
- Use zod 4 APIs: `z.uuid()`, `z.email()`, `z.int()`, `z.iso.datetime()` (not `z.string().uuid()` etc.).

### API (apps/api)
- Feature = folder `src/modules/<feature>/` with `<feature>.module.ts`, `.controller.ts`, `.service.ts`, `.controller.spec.ts`. Register the module in `src/app.module.ts`.
- Validate input with the param decorator option, not class-validator/DTO classes:
  `@Body({ schema: createXSchema }) body: CreateXInput`, `@Param('id', { schema: uuidParamSchema }) id: string`.
  The global `StandardSchemaValidationPipe` is registered in `src/setup-app.ts`.
- DB access: `@nestjs/drizzle` — `DrizzleModule.forRoot()` in `src/app.module.ts`. Inject with `constructor(@InjectDrizzle() private readonly db: Database)` (`Database` type from `src/database/database.ts`). Mock in tests with `{ provide: getDrizzleToken(), useValue: mockDb }`. Use `db.transaction()` for multi-step writes.
- **Do not use `import type` for anything injected via constructor** — it erases decorator metadata and breaks DI. (Biome's `useImportType` is disabled in apps/api for this reason.)
- Throw Nest HTTP exceptions (`NotFoundException`, `ConflictException`, ...) from services; no custom error envelope.
- Env vars: add to the zod schema in `src/config/env.ts` and to `.env.example`; read via `env.X`, never `process.env` directly.
- All routes are under `/api/v1` (global prefix `api` + URI versioning, default version `"1"` set in `setup-app.ts`). Breaking change → add a v2 controller/route with `version: "2"`, keep v1 until clients migrate. Tests use `${baseUrl}/api/v1`.
- Tests: `bun:test` + `@nestjs/testing`. HTTP tests build the app with `setupApp()` and mock providers (see `modules/health/health.controller.spec.ts`). Import `'reflect-metadata'` at the top of spec files.

### Database (Drizzle)
- Schema source of truth: `apps/api/src/database/schema.ts` (split into files if large and re-export from it).
- Write columns camelCase without explicit names (`price: integer().notNull()`); `casing: 'snake_case'` maps them. Spread `...timestamps` into every table.
- IDs: `uuid().primaryKey().defaultRandom()`. Money: integer in the smallest currency unit, never float/real.
- Schema change flow: edit `schema.ts` → `bun run db:generate` → review the SQL → `bun run db:migrate`. Never hand-edit already-applied migrations or files in `migrations/meta`.
- Export row types: `export type XRow = typeof x.$inferSelect`.

### Web (apps/web)
- Route-level components in `src/pages/`; feature code (API hooks, feature components) in `src/features/<feature>/`; shared UI in `src/components/`.
- All HTTP goes through `api` in `src/lib/api-client.ts` (paths relative to `/api/v1`, e.g. `api.get('/health')`).
- Server state = TanStack Query only. Define a query-key factory per feature (`xKeys`) in `features/<feature>/api.ts`; invalidate keys after mutations.
- Routes are declared in `src/app/router.tsx` (`createBrowserRouter`); import from `react-router`, not `react-router-dom`.
- `tsconfig.app.json` uses `verbatimModuleSyntax` + `erasableSyntaxOnly`: use `import type` for types, and no enums / constructor parameter properties.
- Client-side validation should reuse the shared zod schema (`schema.safeParse`).

## Gotchas
- Postgres must be running (`bun run db:up`) for `dev`, `db:*` and the `/api/health` check; unit tests don't need it.
- drizzle-kit scripts run with `bun --bun` so Bun loads `apps/api/.env`.
- Isolated installs: each workspace has its own `node_modules`. Add deps inside the workspace (`cd apps/api && bun add x`); add workspace deps with `bun add '@ticket/shared@workspace:*'` (quote it in zsh).
