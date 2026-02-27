# Module 1

## PART 1: Create a prompt from specs

- Prompt: Read @/prompts/1-web-api-specs.md and follow the instructions at the top of the file.
- Tool: Cursor
- Mode: Plan (read-only, no code changes)
- Context: Clean (new chat, no previous context)
- Model: Opus 4.6
- Input: prompts/1-web-api-specs.md
- Output: prompts/2-web-api-prompt.md
- Cost: [fill in after]

### Reflections

#### Step 3a
Even though I am in a Plan mode, the AI assistant asking to "Write prompts/2-web-api-prompt.md" which requires write access. The AI generated the content of 2-web-api-prompt.md. as text in the chat.

#### Step 3b
Updates made to 1-web-api-specs.md

#### Step 3c
The prompt Read @/prompts/1-web-api-specs.md and follow the instructions at the top of the file.
Produced 2-web-api-specs.md, then asked if I should keep it or undo. Which I kept

#### Step 4
Prompt create the implementation plan follow 2-web-api-prompt.md. The assesstant created the implamentation plan and called it 3-implementation-plan.md. the file is 299 lines. It was not on the 'Plan' mode, which automatically switched the mode to 'Plan' to create the file/plan! When it finished it let me know with 'prompts/3-implementation-plan.md' with a summary:

- Project Structure
- Dependencies
- Architecture
- Database
- Middleware
- Environment config
- Scripts
- Testing

#### Step 5
Please create a Config API Service in the `config-service` folder, according to the Implementation Plan defined in @/prompts/3-implementation-plan.md

Provided the project structure:

```
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
```

Created 24 files

#### Reflection
Self healing, when encuntered issues or errors, analysed them, identified the fix and resolved them.
Created 9 unit tests, which ran and made sure they passed.

Key results:

- TypeScript compilation: zero errors
- Unit tests: 9/9 passing (service layer with mocked repository)
- Architecture: Layered (Routes → Controllers → Services → Entities → DB)
- Versions matched to plan: Express ^4, Zod ^3.25, TypeORM ^0.3, Pino ^10, TypeScript ~5.9

Steps on how to get started:

- Ensure PostgreSQL is running with a config_api database
- Run `yarn migration:generate src/migrations/InitialMigration` to generate the initial migration
- Run `yarn migration:run` to apply it
- Run `yarn dev` to start the dev server on port 3000

## PART 2

- Prompt: Read @/prompts/4-admin-ui-prompt.md and follow the instructions at the top of the file.
- Tool: Cursor
- Mode: Plan (read-only, no code changes)
- Context: Clean (new chat, no previous context)
- Model: Opus 4.6
- Input: prompts/4-admin-ui-prompt.md
- Output: prompts/5-admin-ui-plan.md

### Reflection

#### What went well
The plan is thorough and directly implementable. It covers every requirement from the prompt — file structure, typed dependencies, component specs with rendered markup, state management architecture, and a testing strategy. The event-driven store pattern using EventTarget is a clean fit for vanilla Web Components without reinventing a framework.

The self-review caught real bugs, not just cosmetic issues. The composed: true omission for Shadow DOM event crossing would have been a subtle, hard-to-debug runtime failure. The Content-Type on bodyless requests and the contradictory tsconfig options would have caused confusion during implementation. These are the kinds of issues that waste time later.

### Step 3a

- Prompt: Read @/prompts/5-admin-ui-plan.md and follow the instructions at the top of the file.
- Tool: Cursor
- Mode: Plan (read-only, no code changes)
- Context: Clean (new chat, no previous context)
- Model: Opus 4.6
- Input: prompts/5-admin-ui-plan.md
- Output: ui/

### Reflection

#### Does it run without errors? Do the tests pass?
TypeScript type-checking passes cleanly (pnpm typecheck — zero errors). All 25 unit tests pass across 3 test files (7 API tests, 11 store tests, 7 form tests). The one issue encountered during the run was CSSStyleSheet.replaceSync not being available in jsdom — this required adding a tests/unit/setup.ts polyfill, which was a self-healing fix within the same session. E2E tests are written but require the config-service and database to be running to verify.

#### What code changes would I like to see in the next run?
1. The store is a singleton module, which means the config-store.test.ts tests share state across describe blocks. The beforeEach clears mocks but doesn't reset the store's internal state. A reset() method or a factory function (createStore()) would make tests more isolated and predictable.
2. All components use innerHTML for re-rendering, which destroys and recreates the entire DOM subtree on every state change. This works fine for a small admin tool, but it also tears down event listeners on each render — so they're re-attached every time in renderContent(). A targeted DOM update approach (even a simple diff against current DOM) would be more robust.
3. The config-list component nests `<confirm-dialog>` inside its own shadow root, but `<confirm-dialog>` is also a custom element with its own shadow DOM. The Playwright E2E tests need to pierce through two levels of shadow DOM to reach the dialog's buttons — this could be fragile. Moving the dialog to `<app-root>` level and communicating via events would simplify testing.
4. No 404 or error-state UI exists when loadConfig() fails in the detail/edit views — the user just sees "Config not found" with no way to recover other than knowing to navigate back.
5. Missing .gitignore for node_modules/ and dist/ in the ui/ folder.

#### What surprised me about the implementation?
The plan was detailed enough that the implementation was almost entirely mechanical — there were very few ambiguous decisions to make. The plan specified rendered markup, store interfaces, method signatures, and event contracts, so each component could be written nearly to spec. The only real deviation was the jsdom polyfill, which the plan couldn't have anticipated since it's a test-environment concern rather than an application architecture issue. The degree to which a thorough plan eliminated guesswork in the coding step was the standout takeaway.

# Module 2

Creating .md files then asking Opus4.6 to create a 'rule' for the project context framework. Cursor did an amazing job and explained how it will use it.

The rule file is created. Here's what was done:

> Created `.cursor/rules/memory.mdc` — a Cursor rule with `alwaysApply: true` that will automatically load into every new conversation. It:
> - Describes the context framework — explains that `memory/` contains key project decisions and standards
> - Lists each memory file with its purpose and when to read it:
>   - ABOUT.md — project vision and objectives
>   - ARCHITECTURE.md — tech stack, structure, API, database
>   - TECHNICAL.md — naming, patterns, error handling, linting
>   - TESTING.md — test tooling, strategies, known gaps
>   - SETUP.md — prerequisites and how to run the app
> - Instructs the assistant to read the relevant files before planning or coding, and to update them when asked

And it asked me to verify the work:

> To confirm the context is being auto-loaded, start a new conversation (not this one — the rule loads at the start of a conversation) and ask the assistant something like:
> "Tell me about the goals for this project."
> You should see it read from the memory files and respond with project-specific details from ABOUT.md rather than asking generic questions. The rule will appear in the Cursor rules panel under your project settings as well.

### Client library

AI Assistant explained why the client library exists:

- **Abstraction** — if the API changes (endpoint paths, response shapes), only the library needs updating, not every consumer
- **Better DX** — typed methods, autocomplete, structured errors instead of parsing raw HTTP responses
- **Safety from breaking changes** — the library can adapt internally while keeping its public API stable

How the Admin UI uses it: before, the UI had its own api/config-api.ts with inline fetch calls.

### Observability

Initially planned Datadog, but switched to OpenTelemetry + Jaeger — open-source, no account needed, and matches the exercise instructions. Added auto-instrumentation for Express, pg, and Pino with traces exported to Jaeger running in Docker. Minimal code changes: one new tracer file, one import line in server.ts.

Hit a few issues: port conflicts with local PostgreSQL, and `@opentelemetry/resources` v2 changed its API (`resourceFromAttributes()` instead of `new Resource()`). All resolved quickly.

Updated memory docs (ARCHITECTURE, SETUP, TECHNICAL) to reflect the observability layer.
