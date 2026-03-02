# Environments and Developer Scripts

Single source of truth for environments, environment variables, and developer scripts. Keep this file updated when you add env vars or new commands.

---

## 1. Environments

| Environment | Purpose | When to use |
|-------------|---------|-------------|
| **Local / development** | Day-to-day coding, tests, running backend/frontend. | Default. Use `.env` in `config-service/` and Docker for Jaeger. |
| **CI** | Automated lint/test on push or PR. | Triggered by version control. |
| **Production** | Deployed backend (if applicable). | Not used during normal development; config lives in deployment. |

---

## 2. Environment Variables

All env vars are for the **backend** (`config-service/`). The client library and frontend do not use their own env files for API URL (frontend proxies to backend in dev).

### 2.1 Backend `.env` (config-service/)

Create from template: `cp .env.example .env` in `config-service/`. Never commit `.env`.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Yes | HTTP server port | `3000` |
| `NODE_ENV` | Yes | `development` or `production` | `development` |
| `DB_HOST` | Yes | PostgreSQL host | `localhost` |
| `DB_PORT` | Yes | PostgreSQL port | `5432` |
| `DB_USERNAME` | Yes | Database user | `postgres` |
| `DB_PASSWORD` | Yes | Database password | `postgres` |
| `DB_NAME` | Yes | Database name | `config_api` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | No | OTLP trace endpoint (Jaeger) | `http://localhost:4318/v1/traces` |

### 2.2 CI

Use the same variable names. Store secrets (e.g. `DB_PASSWORD`) in the CI platform’s secret store. For local CI runs, a `.env` in `config-service/` is used by test scripts.

### 2.3 Example file

`config-service/.env.example` is committed with dummy/safe values; no secrets.

---

## 3. Developer Scripts and Commands

Run from the paths indicated. Backend uses **Yarn**; client library and frontend use **pnpm**.

### 3.1 Infrastructure (project root)

| Command | What it does | When to run |
|---------|----------------|-------------|
| `docker compose up -d` | Start Jaeger (tracing) | When you need traces or run backend with OTEL |
| `docker compose down` | Stop Jaeger | When done for the day or to free ports |
| `docker compose ps` | Show container status | To verify Jaeger is running |
| `createdb config_api` | Create PostgreSQL database | Once per machine (if not exists) |

### 3.2 Backend (config-service/)

| Command | What it does | When to run |
|---------|----------------|-------------|
| `yarn install` | Install dependencies | After clone or when package.json changes |
| `yarn dev` | Start dev server (ts-node-dev, auto-restarts) | During feature work; keep running |
| `yarn build` | Compile TypeScript to `dist/` | Before production deploy or to verify compilation |
| `yarn start` | Run compiled server (`node dist/server.js`) | Production; not for local dev |
| `yarn migration:run` | Apply pending DB migrations | After pull or after adding migrations |
| `yarn migration:generate src/migrations/<Name>` | Generate migration from entity changes | After changing entities |
| `yarn migration:revert` | Roll back last migration | When a migration was wrong |
| `yarn test` | Run Jest tests | Before commit or on demand |
| `yarn test:watch` | Run tests in watch mode | During TDD or active development |
| `yarn lint` | Run ESLint (check) | Before commit |
| `yarn lint:fix` | ESLint with auto-fix | When fixing lint errors |
| `yarn format` | Prettier format | Before commit or on demand |

### 3.3 Client library (config-client/)

| Command | What it does | When to run |
|---------|----------------|-------------|
| `pnpm install` | Install dependencies | After clone or when package.json changes |
| `pnpm build` | Compile TypeScript to `dist/` | After changing library; frontend depends on it |
| `pnpm test` | Run Vitest tests | Before commit or on demand |
| `pnpm test:watch` | Run tests in watch mode | During active development |
| `pnpm typecheck` | Type-check without emitting (`tsc --noEmit`) | Before commit or to verify types |
| `pnpm lint` / `pnpm lint:fix` | ESLint | Before commit |
| `pnpm format` | Prettier | Before commit |

### 3.4 Frontend (ui/)

| Command | What it does | When to run |
|---------|----------------|-------------|
| `pnpm install` | Install dependencies (includes config-client) | After clone or when deps change |
| `pnpm dev` | Start Vite dev server | During UI work; keep running |
| `pnpm build` | Type-check + Vite production build | Before deploy or to verify build |
| `pnpm preview` | Serve the production build locally | To verify a production build before deploy |
| `pnpm test` | Run Vitest unit tests | Before commit or on demand |
| `pnpm test:watch` | Run unit tests in watch mode | During active development |
| `pnpm test:coverage` | Run unit tests with coverage report | To check coverage gaps |
| `pnpm test:e2e` | Run Playwright E2E tests (requires backend + frontend running) | Before release or to validate full flows |
| `pnpm typecheck` | Type-check without building (`tsc --noEmit`) | Before commit or to verify types |
| `pnpm lint` / `pnpm lint:fix` | ESLint | Before commit |
| `pnpm format` | Prettier | Before commit |

### 3.5 Pre-commit hooks (husky + lint-staged)

The backend (`config-service/`) has **husky** and **lint-staged** installed. On `git commit`, husky triggers lint-staged which auto-runs linting and formatting on staged files. This means:

- You do **not** need to manually run `yarn lint` / `yarn format` before every commit — the hook handles it.
- If the hook fails (lint errors that can't be auto-fixed), the commit is rejected. Fix the errors and commit again.
- To bypass hooks in exceptional cases: `git commit --no-verify` (avoid this for routine work).

---

## 4. How to Run Scripts and When to Go Off-Script

### 4.1 Normal workflow

- Use the **documented** commands above from the correct directory (project root, `config-service/`, `config-client/`, or `ui/`).
- Backend must be running before frontend (UI proxies to port 3000). Start Jaeger if you care about traces.
- After changing `config-client`, run `pnpm build` in `config-client/` so the frontend sees updates.

### 4.2 When it’s okay to go off-script

- **Debugging**: One-off commands (e.g. single test file, `curl`, DB query) to reproduce or fix a bug. Return to normal scripts afterward.
- **Exploring**: Short experiments (new tool, one-off script) that aren’t part of the standard workflow — no need to document unless they become standard.
- **Missing script**: If something needed isn’t in this doc (e.g. “run only integration tests”), run the underlying tool once, then add a script and update this file.

### 4.3 When not to go off-script

- Don’t replace a documented script with an ad-hoc command for routine work.
- Don’t commit or document one-off commands as the default without updating this file and the actual script/target.

---

*Update this file when you add env vars, new scripts, or new environments.*
