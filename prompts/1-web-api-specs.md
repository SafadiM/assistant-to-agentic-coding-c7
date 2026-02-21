This document contains details necessary to create a prompt, which will later be used to create an implementation plan for a REST Web API. Please review the contents of this file and recommend a PROMPT that can be sent to an AI coding assistant for help with creating an implementation plan for this service.

The prompt should:
- ask the assistant to create a comprehensive plan that includes dependencies, file/folder structure, and architectural patterns.
- recommend strict adherence to ALL of the details in this document.
- strongly encourage the assistant to not add any additional dependencies without approval.
- encourage the assistant to ask for more information if they need it.


# Config API Service Specifications

## Programming Language
- TypeScript 5.9.x (Node.js 22 runtime)
- Package manager: Yarn

## Web Framework & Dependencies
- Express
- Zod ^3.25.x (request/response validation)
- Pino ^10.x (logging)
- pino-pretty (dev logging)
- dotenv (environment config)
- reflect-metadata (required for TypeORM decorators)
- uuid + @types/uuid (UUID generation)

## Database
- Engine: PostgreSQL
- Driver/ORM: TypeORM ^0.3.27
- pg ^8.x

## Storage & Query Preferences
- Single `configs` table
- Columns: id (UUID, primary key), key (string, unique index), value (JSONB), created_at (timestamp), updated_at (timestamp)
- JSONB for value column to support both simple strings and complex objects
- Parameterized queries to prevent SQL injection

## API Endpoints & Payloads
- GET    /health                — returns { status: "ok" }
- GET    /configs               — returns array of all config entries
- GET    /configs/:key          — returns a single config entry by key
- POST   /configs               — creates a new config entry
  - Body: { "key": "string", "value": "string | object" }
- PUT    /configs/:key          — updates an existing config entry
  - Body: { "value": "string | object" }
- DELETE /configs/:key          — deletes a config entry

## Dev Server
- ts-node-dev (hot-reload during development)
- ts-node (TypeORM CLI migrations)

## Testing
- Jest ^29 or ^30 (matches programs repo)
- ts-jest (TypeScript transform for Jest)
- Supertest ^7.x (API integration tests)

## Code Quality
- ESLint
- Prettier
- Husky + lint-staged (git hooks)