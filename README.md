# Ticket Booking App

Monorepo fullstack cho ứng dụng đặt vé, chạy hoàn toàn trên **Bun**.

| Layer       | Công nghệ                                                         |
| ----------- | ----------------------------------------------------------------- |
| Runtime     | [Bun](https://bun.sh) 1.3+ (package manager, runtime, test runner) |
| Frontend    | React 19 + Vite 8 + React Router 8 + TanStack Query 5             |
| Backend     | NestJS 12 (ESM, chạy trực tiếp TypeScript bằng Bun)               |
| Database    | PostgreSQL 18 (Docker) + Drizzle ORM + drizzle-kit (migration)    |
| Validation  | Zod 4 — schema dùng chung cho cả FE và BE                         |
| Lint/Format | Biome                                                             |

---

## Bắt đầu nhanh

Yêu cầu: **Bun ≥ 1.3**, **Docker** (Docker Desktop / OrbStack).

```bash
bun install                          # cài dependency cho toàn bộ workspace
cp apps/api/.env.example apps/api/.env
bun run db:up                        # chạy Postgres trong Docker
bun run db:migrate                   # áp dụng migration
bun run dev                          # chạy song song API + Web
```

- Web: http://localhost:5173 — trang chủ hiển thị trạng thái API + DB
- API: http://localhost:3000/api — health check tại `GET /api/health`

---

## Cấu trúc thư mục

```
ticket-booking-app/
├── apps/
│   ├── api/                         # @ticket/api — NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts              # entrypoint: tạo Nest app và listen
│   │   │   ├── setup-app.ts         # cấu hình global (prefix /api, pipes, CORS) — dùng chung cho main + test
│   │   │   ├── app.module.ts        # root module, import các feature module
│   │   │   ├── config/
│   │   │   │   └── env.ts           # đọc + validate biến môi trường bằng zod
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts  # @Global module: postgres client + Drizzle instance (token DB)
│   │   │   │   ├── schema.ts        # định nghĩa bảng Drizzle (nguồn sự thật của DB schema)
│   │   │   │   ├── migrations/      # SQL migration do drizzle-kit sinh ra — commit vào git
│   │   │   │   └── seed.ts          # script seed dữ liệu mẫu
│   │   │   └── modules/             # feature modules (mỗi feature 1 thư mục)
│   │   │       └── health/          # module mẫu: controller + test HTTP
│   │   ├── drizzle.config.ts
│   │   └── .env.example
│   │
│   └── web/                         # @ticket/web — React + Vite frontend
│       ├── src/
│       │   ├── main.tsx             # mount React, gắn QueryClientProvider + RouterProvider
│       │   ├── app/
│       │   │   ├── router.tsx       # khai báo route
│       │   │   └── query-client.ts  # cấu hình TanStack Query
│       │   ├── components/          # component dùng chung (Layout, ...)
│       │   ├── features/            # code theo feature: hooks gọi API, component riêng của feature
│       │   │   └── health/api.ts
│       │   ├── pages/               # component cấp route
│       │   ├── lib/
│       │   │   └── api-client.ts    # fetch wrapper + ApiError
│       │   └── index.css
│       ├── vite.config.ts           # proxy /api → http://localhost:3000
│       └── .env.example
│
├── packages/
│   └── shared/                      # @ticket/shared — code dùng chung FE/BE
│       └── src/
│           ├── index.ts             # public API của package
│           └── schemas/             # zod schema + type (DTO, query, response)
│
├── docker-compose.yml               # Postgres 18
├── biome.json                       # lint + format cho toàn repo
├── tsconfig.base.json               # tsconfig gốc, các app/package extend từ đây
├── package.json                     # Bun workspaces + script tổng
├── CLAUDE.md                        # hướng dẫn cho Claude Code
└── README.md
```

### Vì sao chia như vậy

- **`apps/*`** là những thứ có thể deploy độc lập; **`packages/*`** là thư viện nội bộ.
- **`@ticket/shared` không cần build**: `exports` trỏ thẳng vào `src/index.ts`. Bun (API) và Vite (Web)
  đều đọc được TypeScript trực tiếp, nên sửa shared là cả hai bên nhận ngay.
- **Một zod schema, hai nơi dùng**: FE dùng để validate form / type request, BE dùng để validate request.
  Không bị lệch contract giữa FE và BE.

---

## Các khái niệm chính

### Backend: validate request bằng schema dùng chung

NestJS 12 có sẵn `StandardSchemaValidationPipe` (đã đăng ký global trong `setup-app.ts`). Zod 4 tuân theo
chuẩn Standard Schema nên chỉ cần truyền schema vào decorator:

```ts
import { paginationQuerySchema, type PaginationQuery, uuidParamSchema } from '@ticket/shared';

@Get()
list(@Query({ schema: paginationQuerySchema }) query: PaginationQuery) { ... }

@Get(':id')
findOne(@Param('id', { schema: uuidParamSchema }) id: string) { ... }
```

Request sai sẽ tự động trả về `400` với danh sách lỗi; giá trị nhận được đã được transform (coerce, default).

### Backend: truy cập database

`DatabaseModule` là module global, cung cấp Drizzle instance qua token `DB`. Inject vào service bằng `@InjectDb()`:

```ts
import { type Database, InjectDb } from '../../database/database.module';

@Injectable()
export class SomeService {
  constructor(@InjectDb() private readonly db: Database) {}
}
```

Drizzle được cấu hình `casing: 'snake_case'`: viết field camelCase trong TS, cột trong Postgres là snake_case.

### Frontend: gọi API

- `lib/api-client.ts`: `api.get<T>()`, `api.post<T>()` — tự parse JSON, ném `ApiError` (có `status`, `body`) khi lỗi.
- Mỗi feature có file `features/<name>/api.ts` chứa query key + hook TanStack Query (xem `features/health/api.ts`).
- Dev: gọi `/api/...`, Vite proxy sang NestJS → không cần lo CORS. Production: đặt `VITE_API_BASE_URL`.

---

## Database workflow (Drizzle)

1. Khai báo / sửa bảng trong `apps/api/src/database/schema.ts` (có helper `timestamps` cho `createdAt/updatedAt`).
2. `bun run db:generate` — sinh file SQL migration mới vào `apps/api/src/database/migrations/`.
3. Review file SQL vừa sinh, rồi `bun run db:migrate` để áp dụng.
4. Commit cả `schema.ts` và thư mục `migrations/`.

Các lệnh khác:

| Lệnh                      | Mô tả                                                |
| ------------------------- | ---------------------------------------------------- |
| `bun run db:up` / `db:down` | Bật / tắt container Postgres                        |
| `bun run db:seed`         | Chạy `apps/api/src/database/seed.ts`                  |
| `bun run db:studio`       | Mở Drizzle Studio (GUI xem/sửa data)                  |
| `docker compose down -v`  | Xoá container **và toàn bộ dữ liệu** (reset DB)       |

Kết nối mặc định: `postgres://ticket:ticket@localhost:5432/ticket_booking` (đổi trong `apps/api/.env`).

---

## Scripts (chạy ở root)

| Lệnh                | Mô tả                                                        |
| ------------------- | ------------------------------------------------------------ |
| `bun run dev`       | Chạy API (watch mode) + Web (Vite HMR) song song            |
| `bun run dev:api`   | Chỉ chạy API                                                 |
| `bun run dev:web`   | Chỉ chạy Web                                                 |
| `bun run build`     | Type-check API, build Web ra `apps/web/dist`                 |
| `bun run typecheck` | `tsc` cho mọi workspace                                      |
| `bun run test`      | `bun test` cho các workspace có test                         |
| `bun run lint`      | Biome check (lint + format + sắp xếp import)                 |
| `bun run lint:fix`  | Biome tự sửa                                                 |

Chạy script cho một workspace cụ thể: `bun run --filter @ticket/api <script>`.
Thêm dependency cho một workspace: `cd apps/web && bun add <pkg>`.

---

## Biến môi trường

**`apps/api/.env`** (Bun tự load file `.env`, được validate trong `src/config/env.ts` — thiếu/sai sẽ crash ngay khi khởi động):

| Biến           | Mặc định                | Ghi chú                              |
| -------------- | ----------------------- | ------------------------------------ |
| `NODE_ENV`     | `development`           | `development` \| `test` \| `production` |
| `PORT`         | `3000`                  |                                      |
| `DATABASE_URL` | —                       | bắt buộc                             |
| `CORS_ORIGINS` | `http://localhost:5173` | phân tách bằng dấu phẩy              |

**`apps/web/.env`** (tuỳ chọn): `VITE_API_BASE_URL` — mặc định `/api`.

---

## Thêm một feature mới (ví dụ: `events`)

1. **Shared**: tạo `packages/shared/src/schemas/event.ts` (zod schema input + interface DTO), export trong `index.ts`.
2. **DB**: thêm bảng `events` vào `schema.ts` → `bun run db:generate` → `bun run db:migrate`.
3. **API**: tạo `apps/api/src/modules/events/` gồm `events.module.ts`, `events.controller.ts`,
   `events.service.ts` (+ `*.spec.ts`), rồi import module vào `app.module.ts`.
4. **Web**: tạo `apps/web/src/features/events/api.ts` (hooks), page trong `pages/`, khai báo route trong `app/router.tsx`.

---

## Lưu ý kỹ thuật

- **NestJS chạy trên Bun**: không dùng `nest build`/`nest start`. Bun chạy thẳng `src/main.ts` và hỗ trợ
  `experimentalDecorators` + `emitDecoratorMetadata` (bắt buộc cho DI của Nest). `bun run build` cho API chỉ type-check.
- **Không dùng `import type` cho class được inject** trong `apps/api` — sẽ làm mất metadata và DI lỗi.
  Rule `useImportType` của Biome đã được tắt cho `apps/api` vì lý do này.
- **TypeScript 6** được pin ở root (cùng version với template Vite); TS 7 chưa được dùng.
- Mỗi `*.spec.ts` / `*.test.ts` được chạy bằng `bun test`.
