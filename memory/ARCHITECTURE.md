# Architecture

## Tech Stack

- **Backend**: TypeScript, Express, PostgreSQL + TypeORM, Zod validation, Pino logging
- **Frontend**: React, Vite, CSS custom properties
- **Testing**: Jest + Supertest (backend), Vitest + React Testing Library (frontend unit), Playwright (E2E)

## Backend Structure

Routes → Controllers → Services → TypeORM Entities → PostgreSQL

## Config Entity

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| key | string | Unique index |
| value | JSONB | Strings or nested objects |
| created_at / updated_at | timestamp | Auto-managed |

## API Endpoints

- `GET /health`
- `GET /configs` — list all
- `GET /configs/:key` — get by key
- `POST /configs` — create
- `PUT /configs/:key` — update
- `DELETE /configs/:key` — delete
