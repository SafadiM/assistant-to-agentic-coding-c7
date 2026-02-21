# Configuration Service

## Purpose

A TypeScript REST API for managing application configuration entries as key-value pairs, backed by PostgreSQL. Built as part of an AI-assisted development course to practice prompt-driven planning and code generation.

## Vision

Provide a straightforward, reliable configuration backend that any HTTP-capable client can query, paired with a lightweight admin interface for human operators to manage entries directly.

## Supported Application Types

The API is application-type-agnostic. Any client that speaks HTTP and JSON can consume it — web apps, mobile apps, CLI tools, microservices, or CI/CD pipelines. The service itself makes no assumptions about the consumer.

## Core Objectives

1. **Clean CRUD API**
   - Express routes with Zod-validated request bodies
   - Consistent JSON responses with proper HTTP status codes
   - Health check endpoint for operational monitoring

2. **Flexible Configuration Values**
   - JSONB storage supports simple strings, feature flags, and deeply nested objects
   - Single `configs` table with a unique key index for fast lookups

3. **Layered, Testable Architecture**
   - Routes → Controllers → Services → Entities
   - Unit tests with mocked repositories (Jest)
   - Integration tests against the full HTTP stack (Supertest)

## Configuration Model

### Key Characteristics
- Flexible JSONB-based configuration values
- Simple key-value lookup model
- UUID-based record identity
- Timestamped audit fields for tracking changes

### Config Entity Shape
```json
{
  "id": "uuid",
  "key": "string",
  "value": "string | object",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

Note: JSON responses use camelCase (`createdAt`, `updatedAt`) while the database columns use snake_case (`created_at`, `updated_at`). TypeORM handles the mapping.

### Example Configuration Structure
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "key": "feature_flags",
  "value": {
    "dark_mode": true,
    "notifications": false,
    "max_upload_mb": 25
  },
  "createdAt": "2026-02-20T10:30:00.000Z",
  "updatedAt": "2026-02-21T14:15:00.000Z"
}
```

### Storage Details
- Table name: `configs`
- `id`: UUID primary key
- `key`: unique indexed string
- `value`: JSONB for both primitive and nested config structures
- `created_at` / `updated_at`: database-managed timestamps

## API Capabilities

The service exposes REST endpoints to manage configuration entries:
- `GET /health` - service health check
- `GET /configs` - list all configuration entries
- `GET /configs/:key` - fetch one entry by key
- `POST /configs` - create a new config entry
- `PUT /configs/:key` - update the value for an existing key
- `DELETE /configs/:key` - remove an entry by key

## Strategic Benefits

- **Simplified Configuration Management**
  - Single source of truth instead of scattered config files
  - Zod schemas enforce payload shape at the boundary
  - TypeORM migrations keep the database schema versioned

- **Enhanced Deployment Flexibility**
  - JSONB column handles simple flags and complex nested objects alike
  - Environment-specific values live in the database, not in code
  - Any HTTP client can integrate without a dedicated SDK

## Administration

The project includes an admin UI that allows administrators to:
- View all configuration entries
- Create new keys and values
- View entry details by key
- Update existing values
- Delete obsolete configurations

## Guiding Principles

- **Simplicity**: Keep configuration workflows understandable and predictable
- **Flexibility**: Support both simple and structured configuration values
- **Security**: Validate request payloads and enforce safe data handling
- **Reliability**: Preserve data integrity through typed models and tested endpoints
