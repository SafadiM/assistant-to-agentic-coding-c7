# Testing

## Overview

| Layer | Tool | Location |
|-------|------|----------|
| Backend unit | Jest | `config-service/tests/unit/` |
| Backend integration | Jest + Supertest | `config-service/tests/integration/` |
| Frontend unit | Vitest + React Testing Library | `ui/tests/unit/` |
| Frontend E2E | Playwright | `ui/tests/e2e/` |

## File Naming

- Unit/integration: `*.test.ts` or `*.test.tsx`
- E2E: `*.spec.ts`

## Test Structure

- `describe("Subject")` → `describe("method/feature")` → `it("should...")`
- `beforeEach` for mock clearing and data cleanup
- Integration tests: `beforeAll` to init DB, `afterAll` to destroy, `beforeEach` to clear tables

## Mocking Strategies

### Backend Unit Tests
- Mock the TypeORM repository (`find`, `findOneBy`, `save`, `remove`)
- Pass mocked repository to service constructor
- Service logic and `AppError` throwing are NOT mocked

### Frontend Unit Tests
- API tests: mock global `fetch` via `vi.stubGlobal`
- Component tests: mock the entire `config-api` module via `vi.mock`
- React components rendered with `render()` from Testing Library, queried by role/text

### Frontend E2E Tests
- No mocking — tests run against the real app (backend + frontend)
- Test data created within each test using unique timestamped keys
- Playwright auto-starts the Vite dev server

## Integration Test Database

- Separate test database: `config_api_test`
- `synchronize: true` + `dropSchema: true` for clean state
- Uses real PostgreSQL, no in-memory substitute

## What's Covered

- All service methods (success + error cases)
- All API endpoints (success + error responses)
- API client functions (fetch calls, error handling)
- Form component (validation, create/edit modes, submission)
- Full CRUD lifecycle (E2E)

## Known Gaps

- Middleware not directly tested (covered indirectly by integration tests)
- Toast notifications not unit tested
- No accessibility or visual regression tests
- No coverage thresholds enforced

## Running Tests

```sh
# Backend
cd config-service && yarn test

# Frontend unit
cd ui && pnpm test

# Frontend E2E (requires both servers running)
cd ui && pnpm test:e2e
```
