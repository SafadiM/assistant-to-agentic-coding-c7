# Technical Standards

## Naming Conventions

- **Files**: kebab-case (`config.routes.ts`, `error-handler.ts`)
- **Classes**: PascalCase (`ConfigService`, `AppError`)
- **Functions/Variables**: camelCase (`getAll`, `configService`)
- **React components**: PascalCase files (`ConfigList.tsx`, `ConfirmDialog.tsx`)

## Backend Patterns

### Layered Responsibilities

- **Routes**: define HTTP method + path, attach validation middleware, delegate to controller
- **Controllers**: parse request, call service, send response, forward errors via `next(err)`
- **Services**: business logic only, throw `AppError(statusCode, message)` for known errors
- **Entities**: TypeORM decorated classes, no logic

### Error Handling

- Services throw `AppError` with status codes (404, 409)
- Controllers wrap in try/catch and call `next(err)`
- Global `errorHandler` middleware returns `{ error: string }` JSON
- Validation failures return 400 with `{ error, details }` from Zod

### Async

- Always `async/await`, no promise chains
- Controllers are `async` returning `Promise<void>`

### Observability (OpenTelemetry)

- `src/tracer.ts` initializes the OpenTelemetry `NodeSDK` with auto-instrumentation and an OTLP/HTTP trace exporter
- Must be the first import in `server.ts` so it patches Express, `pg`, and Pino before they are loaded
- Auto-instruments: Express (request spans), pg (SQL query spans), Pino (trace ID injection into log entries)
- File system instrumentation is disabled to reduce noise
- Traces are exported to Jaeger at `OTEL_EXPORTER_OTLP_ENDPOINT` (defaults to `http://localhost:4318/v1/traces`)
- Vendor-neutral: swap the exporter to send traces to any OTLP-compatible backend (Grafana, Datadog, AWS X-Ray)

### Dependency Sharing

- Services accept optional repository in constructor for testability, fall back to `AppDataSource`
- Singletons: `AppDataSource`, `env`, `logger`
- No DI container — manual instantiation

### Validation

- Zod schemas define request shapes
- `validate(schema)` middleware factory parses `req.body`, replaces with typed result
- Environment variables also validated with Zod at startup (fail fast)

## Client Library Patterns

### Class-Based API

- `ConfigClient` instantiated with `{ baseUrl, fetch? }` options
- Methods map 1:1 to API endpoints: `getAll`, `get`, `create`, `update`, `delete`, `healthCheck`
- Custom `fetch` option allows injecting mocks or alternative implementations

### Error Hierarchy

- `ConfigClientError` — base class with `statusCode` and `body` properties
- `ConfigNotFoundError` (404) — thrown when a key is not found
- `ConfigConflictError` (409) — thrown on duplicate key creation
- `ConfigValidationError` (400) — includes `details` array matching backend Zod format
- Key extraction from both URL path and request body to produce specific error types

### Lazy Fetch Binding

- `fetch` is resolved via a getter at call time (not captured at construction), so test stubs applied after import work correctly

### ESM Compatibility

- Source imports use `.js` extensions (e.g. `from "./types.js"`) so compiled output resolves correctly under ESM
- `"type": "module"` in `package.json`

## Frontend Patterns

### Component Structure

- Functional components with hooks
- One component per file, co-located CSS file (e.g. `ConfigList.tsx` + `ConfigList.css`)
- Navigation via callback props (`onNavigate`), not a router

### API Layer

- `api/config-api.ts` delegates to a `ConfigClient` instance from the `config-client` library
- `types/config.ts` re-exports types from `config-client` (single source of truth)

### State Management

- `useConfigs` hook using `useSyncExternalStore` with a module-level store
- `useToast` via React Context (`ToastProvider`)

### Styling

- CSS custom properties (design tokens) defined in `styles/tokens.css`
- Component-scoped CSS files, no CSS modules or CSS-in-JS

## Code Quality

### Linting (ESLint)

Both projects use ESLint with TypeScript recommended rules:
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: error (ignores args prefixed with `_`)
- Frontend adds `react-hooks/rules-of-hooks` (error) and `react-hooks/exhaustive-deps` (warn)
- Backend uses `.eslintrc.json` (legacy format), frontend uses `eslint.config.js` (flat config)

```sh
# Backend
cd config-service && yarn lint      # check
cd config-service && yarn lint:fix  # auto-fix

# Client Library
cd config-client && pnpm lint      # check
cd config-client && pnpm lint:fix  # auto-fix

# Frontend
cd ui && pnpm lint      # check
cd ui && pnpm lint:fix  # auto-fix
```

### Formatting (Prettier)

Both projects share the same Prettier config:
- Double quotes, semicolons, trailing commas, 100 char width, 2-space indent

```sh
cd config-service && yarn format
cd config-client && pnpm format
cd ui && pnpm format
```

### TypeScript

- Strict mode enabled in all three projects (backend, client library, frontend)

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 204 | Deleted (DELETE) |
| 400 | Validation error |
| 404 | Not found |
| 409 | Duplicate key |
| 500 | Unexpected error |
