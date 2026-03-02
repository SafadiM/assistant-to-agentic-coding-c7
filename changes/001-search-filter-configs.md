# Add search/filter query parameter to GET /configs

**Status:** Done

## Description

The `GET /configs` endpoint currently returns all configs with no way to filter. Add an optional `q` query parameter that filters results by key (case-insensitive partial match). This touches backend, client library, and UI — making it a good end-to-end workflow exercise.

## Acceptance criteria

- [x] `GET /configs` with no query parameter returns all configs (existing behavior unchanged)
- [x] `GET /configs?q=foo` returns only configs whose `key` contains "foo" (case-insensitive)
- [x] `GET /configs?q=` (empty string) returns all configs
- [x] Client library `getAll()` accepts an optional `{ q: string }` parameter and passes it as a query string
- [x] UI config list page has a search input that filters configs via the `q` parameter
- [x] Backend unit test covers the filter logic
- [x] Client library test covers `getAll` with and without the `q` parameter
- [x] Existing tests continue to pass

## Notes

- Filtering is done in-memory (fetch all from DB, filter in service). Acceptable for the current scale; if the configs table grows large, move filtering to a SQL `ILIKE` query.
- UI search is debounced (300ms) to avoid hammering the API on every keystroke.
- After rebuilding config-client, the UI's Vite cache must be cleared (`rm -rf node_modules/.vite && pnpm install`) for the changes to take effect in dev.

## Stage tracking

The current stage is reflected by the **Status** field at the top of this file. Update it as work progresses through the stages defined in `memory/WORKFLOW_STATUS.md`.
