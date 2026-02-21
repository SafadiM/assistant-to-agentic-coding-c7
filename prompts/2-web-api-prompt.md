Create a comprehensive implementation plan for a **Config API Service** — a REST Web API that manages configuration key/value entries backed by PostgreSQL. The plan must include dependencies (with exact versions), a complete file/folder structure, and the architectural patterns to follow.

**You must strictly adhere to every detail below. Do not add, swap, or upgrade any dependency without explicit approval. If anything is unclear or you need more information, ask before proceeding.**

## Technology Stack

- **Language/Runtime:** TypeScript 5.9.x on Node.js 22
- **Package manager:** Yarn
- **Web framework:** Express
- **Validation:** Zod ^3.25.x (request and response validation)
- **Logging:** Pino ^10.x (production) with pino-pretty (development)
- **Environment config:** dotenv
- **Decorators support:** reflect-metadata (required for TypeORM)
- **UUID generation:** uuid + @types/uuid

## Database

- **Engine:** PostgreSQL
- **ORM/Driver:** TypeORM ^0.3.27 with pg ^8.x
- **Schema:** A single `configs` table with columns:
  - `id` — UUID, primary key
  - `key` — string, unique index
  - `value` — JSONB (supports simple strings and complex objects)
  - `created_at` — timestamp
  - `updated_at` — timestamp
- Use parameterized queries to prevent SQL injection.

## API Endpoints

| Method | Path          | Description                                 | Body                                              |
| ------ | ------------- | ------------------------------------------- | ------------------------------------------------- |
| GET    | /health       | Health check — returns `{ "status": "ok" }` | —                                                 |
| GET    | /configs      | List all config entries                     | —                                                 |
| GET    | /configs/:key | Get a single config entry by key            | —                                                 |
| POST   | /configs      | Create a new config entry                   | `{ "key": "string", "value": "string | object" }` |
| PUT    | /configs/:key | Update an existing config entry             | `{ "value": "string | object" }`                  |
| DELETE | /configs/:key | Delete a config entry                       | —                                                 |

## Development Server

- **ts-node-dev** for hot-reload during development
- **ts-node** for running TypeORM CLI migrations

## Testing

- **Jest** ^29 or ^30
- **ts-jest** for TypeScript transform
- **Supertest** ^7.x for API integration tests

## Code Quality

- **ESLint** for linting
- **Prettier** for formatting
- **Husky + lint-staged** for pre-commit git hooks

## Plan Requirements

Your implementation plan should cover:

1. Full project directory and file structure
2. All production and dev dependencies with the versions specified above
3. Architectural patterns (e.g., layered architecture with routes, controllers, services, entities)
4. Database entity definition and migration strategy
5. Middleware setup (error handling, request logging, validation)
6. Configuration management (environment variables)
7. npm/yarn scripts for dev, build, test, lint, and migrations
8. Testing strategy and folder layout

**Reminder:** Do not introduce any dependencies beyond what is listed above without asking first. If you believe something is missing, ask for clarification rather than assuming.
