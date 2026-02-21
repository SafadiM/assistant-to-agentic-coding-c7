## Entry 1: Create a prompt from specs

- Prompt: Read @/prompts/1-web-api-specs.md and follow the instructions at the top of the file.
- Tool: Cursor
- Mode: Plan (read-only, no code changes)
- Context: Clean (new chat, no previous context)
- Model: Opus 4.6
- Input: prompts/1-web-api-specs.md
- Output: prompts/2-web-api-prompt.md
- Cost: [fill in after]
- Reflections: 
Step 3a: Even though I am in a Plan mode, the AI assistant asking to "Write prompts/2-web-api-prompt.md" which requires write access. The AI generated the content of 2-web-api-prompt.md. as text in the chat. 
Step 3b: Updates made to 1-web-api-specs.md
Step 3c: the prompt Read @/prompts/1-web-api-specs.md and follow the instructions at the top of the file.
Produced 2-web-api-specs.md, then asked if I should keep it or undo. Which I kept

Step 4: Prompt create the implementation plan follow 2-web-api-prompt.md. The assesstant created the implamentation plan and called it 3-implementation-plan.md. the file is 299 lines. It was not on the 'Plan' mode, which automatically switched the mode to 'Plan' to create the file/plan! When it finished it let me know with 'prompts/3-implementation-plan.md' with a summary
- Projevt Structure
- Dependencies
- Architecture
- Database
- Middleware
- Environment config
- Scripts
- Testing

Step5: Please create a Config API Service in the `config-service` folder, according to the Implementation Plan defined in @/prompts/3-implementation-plan.md
Provided the project structure 
config-service/
├── src/
│   ├── config/
│   │   ├── data-source.ts          # TypeORM DataSource (PostgreSQL)
│   │   └── env.ts                  # Zod-validated environment variables
│   ├── entities/
│   │   └── Config.ts               # TypeORM entity (configs table)
│   ├── migrations/                 # (empty, ready for generated migrations)
│   ├── routes/
│   │   ├── health.routes.ts        # GET /health
│   │   └── config.routes.ts        # CRUD routes for /configs
│   ├── controllers/
│   │   └── config.controller.ts    # Thin HTTP → service translation
│   ├── services/
│   │   └── config.service.ts       # Business logic + repository access
│   ├── middleware/
│   │   ├── error-handler.ts        # Global error handler + AppError class
│   │   ├── request-logger.ts       # Pino-based HTTP request logger
│   │   └── validate.ts             # Zod validation middleware factory
│   ├── schemas/
│   │   └── config.schema.ts        # Zod schemas for create/update
│   ├── utils/
│   │   └── logger.ts               # Pino logger instance
│   ├── app.ts                      # Express app setup
│   └── server.ts                   # Entry point (DB init + HTTP listen)
├── tests/
│   ├── unit/
│   │   └── config.service.test.ts  # 9 unit tests (mocked repository)
│   └── integration/
│       └── configs.test.ts         # Supertest integration tests
├── .env / .env.example / .gitignore
├── .eslintrc.json / .prettierrc
├── jest.config.ts / tsconfig.json / package.json

Created 24 files

Self healing, when encuntered issues or errors, analysed them, identified the fix and resolved them.
Created 9 unit tests, which ran and made sure they passed. 

Provided key results
Key results:
TypeScript compilation: zero errors
Unit tests: 9/9 passing (service layer with mocked repository)
Architecture: Layered (Routes → Controllers → Services → Entities → DB)
Versions matched to plan: Express ^4, Zod ^3.25, TypeORM ^0.3, Pino ^10, TypeScript ~5.9

Provided steps on how to get started
To get started:
Ensure PostgreSQL is running with a config_api database
Run yarn migration:generate src/migrations/InitialMigration to generate the initial migration
Run yarn migration:run to apply it
Run yarn dev to start the dev server on port 3000