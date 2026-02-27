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

### Dependency Sharing

- Services accept optional repository in constructor for testability, fall back to `AppDataSource`
- Singletons: `AppDataSource`, `env`, `logger`
- No DI container — manual instantiation

### Validation

- Zod schemas define request shapes
- `validate(schema)` middleware factory parses `req.body`, replaces with typed result
- Environment variables also validated with Zod at startup (fail fast)

## Frontend Patterns

### Component Structure

- Functional components with hooks
- One component per file, co-located CSS file (e.g. `ConfigList.tsx` + `ConfigList.css`)
- Navigation via callback props (`onNavigate`), not a router

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

# Frontend
cd ui && pnpm lint      # check
cd ui && pnpm lint:fix  # auto-fix
```

### Formatting (Prettier)

Both projects share the same Prettier config:
- Double quotes, semicolons, trailing commas, 100 char width, 2-space indent

```sh
cd config-service && yarn format
cd ui && pnpm format
```

### TypeScript

- Strict mode enabled in both projects

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
