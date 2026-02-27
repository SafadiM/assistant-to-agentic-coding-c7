# Config API Service — Implementation Plan

## 1. Project Directory & File Structure

```
config-service/
├── src/
│   ├── entities/
│   │   └── Config.ts                 # TypeORM entity for the configs table
│   ├── migrations/
│   │   └── (generated migration files)
│   ├── routes/
│   │   ├── health.routes.ts          # GET /health
│   │   └── config.routes.ts          # /configs CRUD routes
│   ├── controllers/
│   │   └── config.controller.ts      # Request handling, delegates to service
│   ├── services/
│   │   └── config.service.ts         # Business logic, interacts with repository
│   ├── middleware/
│   │   ├── error-handler.ts          # Global error-handling middleware
│   │   ├── request-logger.ts         # Pino-based HTTP request logger
│   │   └── validate.ts              # Zod validation middleware factory
│   ├── schemas/
│   │   └── config.schema.ts          # Zod schemas for create/update payloads
│   ├── config/
│   │   ├── data-source.ts            # TypeORM DataSource configuration
│   │   └── env.ts                    # Environment variable loader (dotenv + validation)
│   ├── utils/
│   │   └── logger.ts                 # Pino logger instance
│   ├── app.ts                        # Express app setup (middleware, routes)
│   └── server.ts                     # Entry point — starts HTTP server & DB connection
├── tests/
│   ├── integration/
│   │   └── configs.test.ts           # Supertest integration tests for /configs
│   └── unit/
│       └── config.service.test.ts    # Unit tests for service layer
├── .env                              # Local environment variables (git-ignored)
├── .env.example                      # Template for required env vars
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .gitignore
├── jest.config.ts                    # Jest configuration
├── tsconfig.json                     # TypeScript compiler options
├── package.json
└── yarn.lock
```

## 2. Dependencies

### Production Dependencies

| Package            | Version   | Purpose                              |
| ------------------ | --------- | ------------------------------------ |
| express            | ^4        | Web framework                        |
| @types/express     | ^4        | Express type definitions             |
| typeorm            | ^0.3.27   | ORM / query builder                  |
| pg                 | ^8        | PostgreSQL driver                    |
| zod                | ^3.25     | Request/response validation          |
| pino               | ^10       | Structured JSON logging              |
| pino-pretty        | latest    | Human-readable dev logs              |
| dotenv             | latest    | Load .env into process.env           |
| reflect-metadata   | latest    | Decorator metadata (TypeORM requirement) |
| uuid               | latest    | UUID v4 generation                   |
| @types/uuid        | latest    | UUID type definitions                |

### Dev Dependencies

| Package            | Version   | Purpose                              |
| ------------------ | --------- | ------------------------------------ |
| typescript         | ~5.9      | TypeScript compiler                  |
| ts-node            | latest    | Run TS directly (migrations)         |
| ts-node-dev        | latest    | Hot-reload dev server                |
| jest               | ^29 or ^30| Test runner                          |
| ts-jest            | latest    | Jest TypeScript transform            |
| @types/jest        | latest    | Jest type definitions                |
| supertest          | ^7        | HTTP assertion library               |
| @types/supertest   | latest    | Supertest type definitions           |
| eslint             | latest    | Linter                               |
| prettier           | latest    | Code formatter                       |
| husky              | latest    | Git hooks                            |
| lint-staged        | latest    | Run linters on staged files          |

No additional dependencies will be added without explicit approval.

## 3. Architectural Pattern — Layered Architecture

```
Request
  │
  ▼
Routes          Define HTTP method + path, attach validation middleware, call controller
  │
  ▼
Controllers     Parse validated request data, call service, send HTTP response
  │
  ▼
Services        Business logic; uses TypeORM repository for data access
  │
  ▼
Entities        TypeORM entity classes mapped to database tables
  │
  ▼
Database        PostgreSQL via TypeORM DataSource
```

**Key principles:**
- Routes know about HTTP; services do not.
- Controllers are thin — they translate between HTTP and service calls.
- Services contain all business logic and are independently testable.
- The TypeORM repository (accessed via `DataSource.getRepository()`) is used inside services; raw SQL is avoided in favor of the repository API, which uses parameterized queries internally to prevent SQL injection.

## 4. Database Entity & Migration Strategy

### Entity: `Config` (`src/entities/Config.ts`)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity("configs")
export class Config {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index({ unique: true })
  @Column({ type: "varchar" })
  key: string;

  @Column({ type: "jsonb" })
  value: unknown;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
```

### Migration Strategy

- Use TypeORM's CLI to generate and run migrations: `yarn typeorm migration:generate` and `yarn typeorm migration:run`.
- Migrations run via `ts-node` so `.ts` migration files execute directly without a build step.
- The initial migration creates the `configs` table with the UUID primary key, unique index on `key`, and JSONB `value` column.
- Never use `synchronize: true` in production — only migrations.

## 5. Middleware Setup

### Request Logger (`src/middleware/request-logger.ts`)
- Uses the Pino logger instance to log each incoming request (method, URL, status code, response time).
- Integrates as Express middleware early in the stack.

### Validation Middleware (`src/middleware/validate.ts`)
- A factory function that accepts a Zod schema and returns Express middleware.
- Parses `req.body` (or `req.params`/`req.query` as needed) against the schema.
- On failure, responds with `400` and a structured error containing Zod issue details.
- On success, attaches the parsed/typed data to the request and calls `next()`.

### Error Handler (`src/middleware/error-handler.ts`)
- Registered last in the middleware chain.
- Catches all unhandled errors; logs the error via Pino.
- Returns a consistent JSON error response: `{ "error": "<message>" }` with an appropriate status code.
- Distinguishes known application errors (e.g., "not found" → 404, "conflict" → 409) from unexpected errors (→ 500).

## 6. Configuration Management

### Environment Variables (`.env` / `src/config/env.ts`)

| Variable       | Description                     | Example                                      |
| -------------- | ------------------------------- | -------------------------------------------- |
| PORT           | HTTP server port                | 3000                                         |
| NODE_ENV       | Environment name                | development                                  |
| DB_HOST        | PostgreSQL host                 | localhost                                     |
| DB_PORT        | PostgreSQL port                 | 5432                                         |
| DB_USERNAME    | Database user                   | postgres                                     |
| DB_PASSWORD    | Database password               | postgres                                     |
| DB_NAME        | Database name                   | config_api                                   |

`src/config/env.ts` will:
1. Call `dotenv.config()` to load `.env`.
2. Validate all required variables are present using Zod.
3. Export a typed `env` object for use throughout the app.

### DataSource (`src/config/data-source.ts`)

- Creates and exports a TypeORM `DataSource` instance configured from the `env` object.
- Sets `synchronize: false` (migrations only).
- Points `entities` to `src/entities/**/*.ts` and `migrations` to `src/migrations/**/*.ts`.
- Enables logging via the Pino logger in development.

## 7. Yarn Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typeorm": "ts-node -r reflect-metadata ./node_modules/typeorm/cli.js",
    "migration:generate": "yarn typeorm migration:generate -d src/config/data-source.ts",
    "migration:run": "yarn typeorm migration:run -d src/config/data-source.ts",
    "migration:revert": "yarn typeorm migration:revert -d src/config/data-source.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/ tests/",
    "lint:fix": "eslint src/ tests/ --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "prepare": "husky"
  }
}
```

## 8. Testing Strategy

### Folder Layout

```
tests/
├── integration/
│   └── configs.test.ts       # Full HTTP tests using Supertest
└── unit/
    └── config.service.test.ts # Service logic tested with mocked repository
```

### Integration Tests (`tests/integration/configs.test.ts`)

- Import the Express `app` (without starting the server) and wrap it with Supertest.
- Before all tests: initialize the DataSource against a test database and run migrations.
- After all tests: drop the test schema / close the connection.
- Between tests: clear the `configs` table for isolation.
- Test every endpoint:
  - `GET /health` → 200, `{ status: "ok" }`
  - `POST /configs` → 201 with valid body; 400 with invalid body; 409 on duplicate key
  - `GET /configs` → 200 with array
  - `GET /configs/:key` → 200 with matching entry; 404 when not found
  - `PUT /configs/:key` → 200 with updated value; 404 when not found
  - `DELETE /configs/:key` → 204 on success; 404 when not found

### Unit Tests (`tests/unit/config.service.test.ts`)

- Mock the TypeORM repository methods (`find`, `findOneBy`, `save`, `delete`).
- Test service methods in isolation: create, getAll, getByKey, update, remove.
- Verify correct error handling (e.g., throwing when key not found).

### Jest Configuration (`jest.config.ts`)

```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
};

export default config;
```

## 9. Route & Controller Detail

### Health Route (`src/routes/health.routes.ts`)

- `GET /health` → responds with `{ status: "ok" }` and status 200. No controller needed; handler is inline.

### Config Routes (`src/routes/config.routes.ts`)

| Route                | Middleware                | Controller Method              |
| -------------------- | ------------------------ | ------------------------------ |
| `GET /configs`       | —                        | `configController.getAll`      |
| `GET /configs/:key`  | —                        | `configController.getByKey`    |
| `POST /configs`      | `validate(createSchema)` | `configController.create`      |
| `PUT /configs/:key`  | `validate(updateSchema)` | `configController.update`      |
| `DELETE /configs/:key` | —                      | `configController.remove`      |

### Zod Schemas (`src/schemas/config.schema.ts`)

```typescript
import { z } from "zod";

export const createConfigSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.record(z.unknown())]),
});

export const updateConfigSchema = z.object({
  value: z.union([z.string(), z.record(z.unknown())]),
});
```

## 10. App Bootstrap Sequence (`src/server.ts`)

1. Import `reflect-metadata` (must be first).
2. Load environment config via `src/config/env.ts`.
3. Initialize the TypeORM `DataSource` (connect to PostgreSQL).
4. Build the Express app (`src/app.ts`): attach request logger, JSON body parser, routes, and error handler.
5. Start listening on `env.PORT`.
6. Log startup message via Pino.
