# Admin UI - Implementation Plan

> Read this file and create an implementation plan. Save the plan to `prompts/5-admin-ui-plan.md`. Place all implementation code under the `ui/` directory at the project root.

Create an implementation plan for an admin web interface that allows managing configuration entries. The UI should support:

- Listing all configuration entries
- Viewing a single configuration entry by key
- Creating a new configuration entry (key + value)
- Updating the value of an existing configuration entry
- Deleting a configuration entry

## API Endpoints

The config service is an Express/TypeScript app running at `http://localhost:3000`. The available endpoints are:

| Method | Path              | Request Body                              | Response         |
|--------|-------------------|-------------------------------------------|------------------|
| GET    | `/configs`        | —                                         | `Config[]`       |
| GET    | `/configs/:key`   | —                                         | `Config`         |
| POST   | `/configs`        | `{ key: string, value: string \| object }` | `Config` (201)   |
| PUT    | `/configs/:key`   | `{ value: string \| object }`              | `Config`         |
| DELETE | `/configs/:key`   | —                                         | 204 No Content   |

A `Config` object has the shape:

```json
{
  "id": "uuid",
  "key": "string",
  "value": "string | object",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Constraints

- Use pnpm to manage dependencies and run scripts.
- All code must be TypeScript, HTML, or CSS. Do not use JavaScript directly.
- Do not take external UI framework dependencies such as React, Vue, or Angular. Use the Web Components functionality built into the browser instead.
- Only use the browser-native `fetch` API for HTTP requests. Do not add HTTP client libraries like axios.
- Only use CSS and Shadow DOM for styling. No CSS frameworks or preprocessors.
- The `value` field can be either a plain string or a JSON object — the UI should handle both gracefully (e.g. a textarea that accepts raw JSON).
- Use Vite as the dev server and build tool.

## Testing

- Unit tests with Vitest covering component logic and API service functions.
- Integration tests with Playwright covering key user flows (list, create, update, delete).
- The plan should specify which test files go where and what each test covers.

## Additional Guidance

- Include a clear folder/file structure in the plan.
- List all external dependencies with version numbers.
- Describe each Web Component's responsibilities, public API, and rendered markup.
- Describe how state flows through the application (e.g. event-driven, a central store, or direct DOM updates).

If you could have 3 more additional pieces of information in this prompt, what would be the most important to ensure a working result?
