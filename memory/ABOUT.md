# Configuration Service

## Purpose

A centralized configuration management service designed to provide flexible, secure, and reliable configuration storage for applications. Built as part of an AI-assisted development course to practice prompt-driven planning and code generation.

## Vision

Provide a single source of truth for application configuration, paired with a lightweight admin interface for human operators to manage entries directly.

## Supported Application Types

The service is application-type-agnostic. Any client that speaks HTTP and JSON can consume it:
- Web Applications
- Mobile Applications
- Desktop Applications
- Microservices
- CLI Tools and CI/CD Pipelines

## Core Objectives

1. **Centralized Configuration Management**
   - Single source of truth instead of scattered config files
   - Dynamic configuration updates without redeployment
   - Consistent interface for configuration retrieval

2. **Flexibility and Scalability**
   - Support for simple strings, feature flags, and deeply nested objects
   - Adaptable to various application types and architectures
   - No assumptions about the consumer

3. **Security and Reliability**
   - Validate and sanitize configuration inputs at the boundary
   - Maintain data integrity through typed models and tested endpoints
   - Preserve configuration consistency across environments

## Configuration Model

### Key Characteristics
- Flexible JSON-based configuration values
- Simple key-value lookup model
- Dynamically typed configuration values
- Timestamped audit fields for tracking changes

### Example Configuration Structure
```json
{
  "api_endpoint": "https://api.example.com",
  "features": {
    "dark_mode": true,
    "notifications": false,
    "max_upload_mb": 25
  }
}
```

## Strategic Benefits

- **Simplified Configuration Management**
  - Centralize configuration across different applications
  - Reduce configuration complexity
  - Enable easier updates and maintenance

- **Enhanced Deployment Flexibility**
  - Support multiple application types
  - Allow for environment-specific configurations
  - Facilitate easier scaling and migration

## Client Library

The project includes a standalone TypeScript client library (`config-client`) that wraps the API. Applications consume the client library instead of calling the API directly, providing:
- A typed, class-based interface (`ConfigClient`) with methods for all CRUD operations
- Structured error types (`ConfigNotFoundError`, `ConfigConflictError`, `ConfigValidationError`) for precise error handling
- A layer of abstraction that insulates consumers from breaking API changes
- Zero runtime dependencies (uses native `fetch`)

The Admin UI is the first consumer of the client library.

## Administration

The project includes a web-based admin UI that allows administrators to:
- View all configuration entries
- Create new keys and values
- View entry details
- Update existing configuration values
- Delete obsolete configurations

## Guiding Principles

- **Simplicity**: Keep configuration workflows understandable and predictable
- **Flexibility**: Adaptable to various application needs and value structures
- **Security**: Robust input validation and safe data handling
- **Reliability**: Preserve data integrity through tested, well-structured code
