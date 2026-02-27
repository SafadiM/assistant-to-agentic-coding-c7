# Architecture

## Tech Stack

- **Backend**: TypeScript, Express, PostgreSQL + TypeORM, Zod validation, Pino logging
- **Frontend**: React, Vite, CSS custom properties
- **Testing**: Jest + Supertest (backend), Vitest + React Testing Library (frontend unit), Playwright (E2E)

## Package Managers

- **Backend**: Yarn
- **Frontend**: pnpm

## Environment Variables

Backend requires a `.env` file (see `.env.example`):

`PORT`, `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`

## Backend Structure

Routes → Controllers → Services → TypeORM Entities → PostgreSQL

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
