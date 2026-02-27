# Architecture

## Tech Stack

- **Backend**: TypeScript, Express, PostgreSQL + TypeORM, Zod validation, Pino logging, OpenTelemetry tracing
- **Client Library**: TypeScript, native fetch, zero dependencies
- **Frontend**: React, Vite, CSS custom properties
- **Testing**: Jest + Supertest (backend), Vitest (client library + frontend unit), React Testing Library (frontend unit), Playwright (E2E)

## Package Managers

- **Backend**: Yarn
- **Client Library**: pnpm
- **Frontend**: pnpm

## Environment Variables

Backend requires a `.env` file (see `.env.example`):

`PORT`, `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT` (optional)

## Backend Structure

Routes → Controllers → Services → TypeORM Entities → PostgreSQL

## Client Library Structure (`config-client/`)

A standalone TypeScript package that wraps the Configuration Service API. Consumed by the Admin UI (and any future web consumers) instead of calling the API directly.

```
config-client/
├── src/
│   ├── index.ts           # Public barrel export
│   ├── config-client.ts   # ConfigClient class
│   ├── types.ts           # Config, CreateConfigDto, UpdateConfigDto, HealthStatus
│   └── errors.ts          # ConfigClientError, ConfigNotFoundError, ConfigConflictError, ConfigValidationError
├── tests/
│   └── config-client.test.ts
├── package.json
└── tsconfig.json
```

## Frontend → Client Library Integration

The Admin UI depends on `config-client` via `file:../config-client`. The UI's `api/config-api.ts` delegates to a `ConfigClient` instance, and `types/config.ts` re-exports types from the library. Components and hooks are unchanged.

## Config Entity

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| key | string | Unique index |
| value | JSONB | Strings or nested objects |
| created_at / updated_at | timestamp | Auto-managed |

## Database Migrations

Uses TypeORM migrations (`synchronize: false`). Schema changes require generating and running migrations:

- `yarn migration:generate` — generate a new migration from entity changes
- `yarn migration:run` — apply pending migrations
- `yarn migration:revert` — roll back the last migration

## API Endpoints

- `GET /health`
- `GET /configs` — list all
- `GET /configs/:key` — get by key
- `POST /configs` — create
- `PUT /configs/:key` — update
- `DELETE /configs/:key` — delete

## Observability

OpenTelemetry auto-instrumentation traces Express requests and PostgreSQL queries. Traces are exported via OTLP/HTTP to a Jaeger instance running in Docker.

- **Tracer**: `src/tracer.ts` — initializes the OpenTelemetry `NodeSDK`, must be imported before all other modules in `server.ts`
- **Log correlation**: The `@opentelemetry/instrumentation-pino` (bundled in auto-instrumentations) injects `trace_id` and `span_id` into Pino log entries automatically
- **Jaeger UI**: http://localhost:16686 — browse traces by service name `config-service`
- **Infrastructure**: `docker-compose.yml` at project root runs Jaeger all-in-one; PostgreSQL runs locally
