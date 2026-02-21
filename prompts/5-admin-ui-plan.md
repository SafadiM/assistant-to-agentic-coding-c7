# Admin UI — Implementation Plan

## Table of Contents

1. [Folder & File Structure](#1-folder--file-structure)
2. [External Dependencies](#2-external-dependencies)
3. [HTML Entry Point](#3-html-entry-point)
4. [Configuration Files](#4-configuration-files)
5. [Application State & Data Flow](#5-application-state--data-flow)
6. [API Service Layer](#6-api-service-layer)
7. [Web Components](#7-web-components)
8. [Styling Strategy](#8-styling-strategy)
9. [Testing Plan](#9-testing-plan)
10. [Scripts & Developer Workflow](#10-scripts--developer-workflow)
11. [Three Questions That Would Improve This Prompt](#11-three-questions-that-would-improve-this-prompt)

---

## 1. Folder & File Structure

```
ui/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── config-api.ts            # Typed fetch wrapper for all /configs endpoints
│   ├── components/
│   │   ├── app-root.ts              # Top-level shell (header, router outlet)
│   │   ├── config-list.ts           # Table/list of all config entries
│   │   ├── config-detail.ts         # Read-only detail view for a single entry
│   │   ├── config-form.ts           # Create / Edit form (shared component)
│   │   ├── confirm-dialog.ts        # Generic confirmation modal (used for delete)
│   │   └── toast-notification.ts    # Transient success/error messages
│   ├── state/
│   │   └── config-store.ts          # Central observable store (EventTarget-based)
│   ├── types/
│   │   └── config.ts                # Config interface & related types
│   ├── styles/
│   │   └── tokens.css               # CSS custom properties (design tokens)
│   ├── main.ts                      # Entry point — registers components, mounts <app-root>
│   └── vite-env.d.ts                # Vite client type declarations
├── tests/
│   ├── unit/
│   │   ├── config-api.test.ts       # API service unit tests (mocked fetch)
│   │   ├── config-store.test.ts     # Store logic & event dispatch tests
│   │   └── config-form.test.ts      # Form validation & rendering tests
│   └── e2e/
│       ├── config-crud.spec.ts      # Playwright: full create → read → update → delete flow
│       └── config-list.spec.ts      # Playwright: listing, empty state, error handling
├── index.html                       # Vite HTML entry (see skeleton below)
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── playwright.config.ts
```

---

## 2. External Dependencies

### Runtime Dependencies

None. The application uses only browser-native APIs (Web Components, fetch, EventTarget).

### Dev Dependencies

| Package                  | Version  | Purpose                                  |
|--------------------------|----------|------------------------------------------|
| `vite`                   | `^6.2`   | Dev server and production bundler        |
| `typescript`             | `^5.9`   | TypeScript compiler                      |
| `vitest`                 | `^3.1`   | Unit test runner (Vite-native)           |
| `jsdom`                  | `^26.1`  | DOM environment for Vitest unit tests    |
| `@playwright/test`       | `^1.52`  | End-to-end integration testing           |
| `@vitest/coverage-v8`    | `^3.1`   | Code coverage via V8                     |

---

## 3. HTML Entry Point

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Config Admin</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="/src/styles/tokens.css" />
  </head>
  <body>
    <app-root></app-root>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

The global stylesheet (`tokens.css`) sets CSS custom properties and a minimal reset. The `<app-root>` element is the single mount point; `main.ts` registers all custom elements before the browser upgrades it.

---

## 4. Configuration Files

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts", "tests/unit/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

### `vite.config.ts`

Vite serves as the dev server, production bundler, and Vitest test runner. The `server.proxy` forwards `/configs` requests to the running config-service, avoiding CORS issues during development. The `test` block configures Vitest to use `jsdom` so unit tests that touch the DOM (e.g. `config-form.test.ts`) have a simulated browser environment.

```ts
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    proxy: {
      "/configs": "http://localhost:3000",
    },
  },
  build: {
    outDir: "dist",
    target: "es2022",
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts"],
  },
});
```

### `playwright.config.ts`

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "pnpm dev",
    port: 5173,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:5173",
  },
});
```

---

## 5. Application State & Data Flow

### Central Store (`config-store.ts`)

State is managed through a single `ConfigStore` class that extends `EventTarget`. This gives all Web Components a shared, event-driven mechanism without any framework dependencies.

```
  ┌─────────────┐    dispatches     ┌──────────────┐
  │  ConfigStore │ ──────────────── │ CustomEvents  │
  │  (singleton) │                  │ "state-change"│
  └──────┬───────┘                  └──────┬────────┘
         │                                 │
    calls│                       listened  │
         ▼                        by       ▼
  ┌─────────────┐              ┌───────────────────┐
  │  config-api  │              │  Web Components    │
  │  (fetch)     │              │  re-render on      │
  └─────────────┘              │  "state-change"    │
                               └───────────────────┘
```

**Store interface:**

```ts
interface ConfigStoreState {
  configs: Config[];
  selectedConfig: Config | null;
  loading: boolean;
  error: string | null;
}
```

**Store methods:**

| Method                | Description                                        |
|-----------------------|----------------------------------------------------|
| `getState()`          | Returns a frozen snapshot of current state          |
| `loadConfigs()`       | Fetches all configs and updates state               |
| `loadConfig(key)`     | Fetches a single config by key                      |
| `createConfig(data)`  | POSTs a new config, then refreshes the list         |
| `updateConfig(key, data)` | PUTs an update, then refreshes the list         |
| `deleteConfig(key)`   | DELETEs a config, then refreshes the list           |

Each mutation method calls the appropriate API function, updates internal state, and dispatches a `"state-change"` `CustomEvent`. Components subscribe in `connectedCallback` and unsubscribe in `disconnectedCallback`.

**Important:** All custom events dispatched by child components (e.g. `"navigate"`) must be created with `{ bubbles: true, composed: true }` so they cross Shadow DOM boundaries and reach ancestor components like `<app-root>`.

### Data Flow Example — Creating a Config

1. User fills out `<config-form>` and submits.
2. `<config-form>` calls `store.createConfig({ key, value })`.
3. Store calls `configApi.createConfig(...)` (POST /configs).
4. On success, store calls `configApi.getAllConfigs()` to refresh the list.
5. Store updates `state.configs`, dispatches `"state-change"`.
6. `<config-list>` hears the event, calls `store.getState()`, and re-renders the table.
7. `<toast-notification>` displays a success message.

---

## 6. API Service Layer

### `src/api/config-api.ts`

A thin, typed wrapper around `fetch`. Every function returns a `Promise` and throws on non-OK responses.

```ts
const BASE = "/configs";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = { ...init?.headers };
  if (init?.body) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
```

**Exported functions:**

| Function                  | HTTP          | Returns           |
|---------------------------|---------------|-------------------|
| `getAllConfigs()`          | GET /configs  | `Promise<Config[]>` |
| `getConfig(key)`          | GET /configs/:key | `Promise<Config>` |
| `createConfig(body)`      | POST /configs | `Promise<Config>` |
| `updateConfig(key, body)` | PUT /configs/:key | `Promise<Config>` |
| `deleteConfig(key)`       | DELETE /configs/:key | `Promise<void>` |

---

## 7. Web Components

### 7.1 `<app-root>`

**File:** `src/components/app-root.ts`
**Tag:** `app-root`

**Responsibilities:**
- Top-level application shell.
- Renders the page header/title and contains child components.
- Manages which view is active: the list view or the create/edit form.
- Listens to custom DOM events bubbled from children to switch views.

**Public API (attributes/properties):** None.

**Rendered markup (Shadow DOM):**

```html
<header>
  <h1>Config Admin</h1>
</header>
<main>
  <config-list></config-list>
  <!-- Conditionally rendered: -->
  <config-form></config-form>
  <config-detail></config-detail>
</main>
<toast-notification></toast-notification>
```

**Events listened:**
- `"navigate"` (from children) — `detail: { view: "list" | "create" | "edit" | "detail", key?: string }`

---

### 7.2 `<config-list>`

**File:** `src/components/config-list.ts`
**Tag:** `config-list`

**Responsibilities:**
- Displays all configuration entries in a table.
- Shows a loading indicator while fetching.
- Shows an empty-state message when no configs exist.
- Provides "View", "Edit", and "Delete" action buttons per row.
- Provides a "New Config" button to navigate to the create form.
- Triggers a `<confirm-dialog>` before deletion.

**Public API:** None. Subscribes to the store internally.

**Rendered markup (Shadow DOM):**

```html
<section>
  <div class="toolbar">
    <h2>Configurations</h2>
    <button class="btn-primary" id="btn-new">+ New Config</button>
  </div>
  <!-- Loading state -->
  <p class="loading">Loading…</p>
  <!-- Empty state -->
  <p class="empty">No configurations found.</p>
  <!-- Data table -->
  <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Value</th>
        <th>Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>site_name</td>
        <td class="value-cell">My App</td>
        <td>2026-02-21</td>
        <td class="actions">
          <button class="btn-view">View</button>
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</section>
<confirm-dialog></confirm-dialog>
```

**Events dispatched:**
- `"navigate"` — `{ view: "create" }`, `{ view: "edit", key }`, `{ view: "detail", key }`

---

### 7.3 `<config-detail>`

**File:** `src/components/config-detail.ts`
**Tag:** `config-detail`

**Responsibilities:**
- Displays full read-only details of a single configuration entry (key, value, id, createdAt, updatedAt).
- If the value is a JSON object, renders it in a formatted `<pre>` block.
- Provides "Back" and "Edit" buttons.

**Public API:**

| Attribute | Type   | Description                     |
|-----------|--------|---------------------------------|
| `config-key` | `string` | The key of the config to display |

**Rendered markup (Shadow DOM):**

```html
<article>
  <header>
    <button class="btn-back">← Back</button>
    <h2>site_name</h2>
    <button class="btn-edit">Edit</button>
  </header>
  <dl>
    <dt>ID</dt>    <dd>uuid-value</dd>
    <dt>Key</dt>   <dd>site_name</dd>
    <dt>Value</dt> <dd><pre>{ "title": "My App" }</pre></dd>
    <dt>Created</dt> <dd>2026-02-20T10:00:00Z</dd>
    <dt>Updated</dt> <dd>2026-02-21T14:30:00Z</dd>
  </dl>
</article>
```

**Events dispatched:**
- `"navigate"` — `{ view: "list" }`, `{ view: "edit", key }`

---

### 7.4 `<config-form>`

**File:** `src/components/config-form.ts`
**Tag:** `config-form`

**Responsibilities:**
- Dual-purpose form for creating and editing configuration entries.
- In create mode: both key and value fields are editable.
- In edit mode: key is read-only, only value is editable; pre-populates from the store.
- The value field is a `<textarea>` that accepts both plain strings and raw JSON.
- Client-side validation: key is required (non-empty, no spaces), value is required, JSON is validated if it looks like JSON (starts with `{` or `[`).
- Displays inline validation errors.
- Shows a loading/disabled state while submitting.

**Public API:**

| Attribute | Type   | Description                              |
|-----------|--------|------------------------------------------|
| `mode`    | `"create" \| "edit"` | Determines form behavior         |
| `config-key` | `string` | (edit mode only) Key of config to edit |

**Rendered markup (Shadow DOM):**

```html
<form novalidate>
  <h2>Create Config / Edit Config</h2>
  <label>
    Key
    <input type="text" name="key" required />
    <span class="error">Key is required</span>
  </label>
  <label>
    Value
    <textarea name="value" rows="6" required></textarea>
    <span class="error"></span>
  </label>
  <div class="form-actions">
    <button type="button" class="btn-cancel">Cancel</button>
    <button type="submit" class="btn-primary">Save</button>
  </div>
</form>
```

**Events dispatched:**
- `"navigate"` — `{ view: "list" }` (on cancel or successful save)
- `"toast"` — `{ message: "Config created", type: "success" }`

---

### 7.5 `<confirm-dialog>`

**File:** `src/components/confirm-dialog.ts`
**Tag:** `confirm-dialog`

**Responsibilities:**
- Generic modal dialog asking the user to confirm a destructive action.
- Shown/hidden via a public method; uses the native `<dialog>` element.
- Resolves a Promise with `true` (confirmed) or `false` (cancelled).

**Public API:**

| Method     | Signature                                            |
|------------|------------------------------------------------------|
| `open()`   | `open(message: string): Promise<boolean>` |

**Rendered markup (Shadow DOM):**

```html
<dialog>
  <p>Are you sure you want to delete "site_name"?</p>
  <div class="dialog-actions">
    <button class="btn-cancel">Cancel</button>
    <button class="btn-danger">Delete</button>
  </div>
</dialog>
```

---

### 7.6 `<toast-notification>`

**File:** `src/components/toast-notification.ts`
**Tag:** `toast-notification`

**Responsibilities:**
- Displays transient success or error messages that auto-dismiss after 4 seconds.
- Listens for `"toast"` events on `document`.
- Supports stacking multiple toasts.

**Public API:**

Listens for a `"toast"` `CustomEvent` on `document`:

```ts
document.dispatchEvent(new CustomEvent("toast", {
  detail: { message: "Config saved", type: "success" | "error" }
}));
```

**Rendered markup (Shadow DOM):**

```html
<div class="toast-container">
  <div class="toast toast--success">Config saved ✓</div>
</div>
```

---

## 8. Styling Strategy

- **Design tokens** are defined as CSS custom properties in `src/styles/tokens.css` and imported into `index.html`. These tokens (colors, spacing, radii, font sizes) provide a consistent look.
- Each Web Component uses **Shadow DOM** with an adopted `CSSStyleSheet` created from a template literal, keeping styles fully encapsulated.
- The base page (`index.html`) sets a minimal global reset (box-sizing, font family, background).
- The visual style is clean and utilitarian: a light neutral background, card-based layouts, a compact data table with hover rows, and blue primary action buttons.

---

## 9. Testing Plan

### 9.1 Unit Tests (Vitest + jsdom)

| Test File                         | What It Covers                                                                                      |
|-----------------------------------|-----------------------------------------------------------------------------------------------------|
| `tests/unit/config-api.test.ts`   | All 5 API functions: correct URL, method, headers, body serialization, error handling on non-OK responses. Uses `vi.stubGlobal("fetch", ...)` to mock fetch. |
| `tests/unit/config-store.test.ts` | Store state transitions: initial state, `loadConfigs` sets `configs[]`, `createConfig` appends and refreshes, `deleteConfig` removes entry, `error` state on API failure, `loading` toggling. Verifies `"state-change"` events fire. |
| `tests/unit/config-form.test.ts`  | Form rendering in create vs. edit mode, client-side validation (empty key, empty value, invalid JSON), form submission calls store, key field read-only in edit mode. |

**Run command:** `pnpm test`

### 9.2 Integration / E2E Tests (Playwright)

These tests run against the full stack (config-service + Vite dev server). The config-service and its PostgreSQL database must be running.

| Test File                            | What It Covers                                                                                    |
|--------------------------------------|---------------------------------------------------------------------------------------------------|
| `tests/e2e/config-list.spec.ts`      | Page loads and displays the config table. Empty-state message shows when no configs exist. Verifies table columns render correct data. |
| `tests/e2e/config-crud.spec.ts`      | Full lifecycle: create a new config → verify it appears in the list → view its detail page → edit its value → verify the update in the list → delete it → verify it disappears. Covers the "New Config" button, form submission, inline editing, and the confirmation dialog. |

**Run command:** `pnpm test:e2e`

**Prerequisites:** The config-service must be running at `http://localhost:3000` with a clean or known database state. The Playwright config starts the Vite dev server automatically.

---

## 10. Scripts & Developer Workflow

### `package.json` scripts

| Script            | Command                                    | Description                              |
|-------------------|--------------------------------------------|------------------------------------------|
| `dev`             | `vite`                                     | Start Vite dev server with HMR           |
| `build`           | `tsc && vite build`                        | Type-check then build for production     |
| `preview`         | `vite preview`                             | Serve the production build locally       |
| `test`            | `vitest run`                               | Run unit tests once                      |
| `test:watch`      | `vitest`                                   | Run unit tests in watch mode             |
| `test:coverage`   | `vitest run --coverage`                    | Unit tests with coverage report          |
| `test:e2e`        | `playwright test`                          | Run Playwright integration tests         |
| `typecheck`       | `tsc --noEmit`                             | Type-check without emitting              |

### Development workflow

1. Start the config-service: `cd ../config-service && pnpm dev` (port 3000).
2. Start the UI dev server: `cd ui && pnpm dev` (port 5173; proxies `/configs` to 3000).
3. Open `http://localhost:5173` in the browser.
4. Run unit tests: `pnpm test` or `pnpm test:watch`.
5. Run E2E tests (with both servers running): `pnpm test:e2e`.

---

## 11. Three Questions That Would Improve This Prompt

1. **Does the config-service have CORS enabled, or must the UI be served from the same origin?**
   If the API does not set `Access-Control-Allow-Origin` headers, the UI's `fetch` calls will fail when running on a different port. The plan assumes a Vite proxy as a workaround, but knowing the CORS policy up front would determine whether a proxy is necessary or whether the API needs a configuration change.

2. **Should the UI support optimistic updates, or always wait for the server response before reflecting changes?**
   This directly affects the store design and the perceived responsiveness of the UI. Optimistic updates are faster for the user but add rollback complexity. The current plan waits for the server response (pessimistic), but if the prompt specified optimistic behavior, the store would need undo logic and error-recovery paths.

3. **What is the expected database state during Playwright E2E tests — should tests seed/tear-down their own data, or can they assume an empty database?**
   E2E tests that create, update, and delete configs need a predictable starting state. Without guidance, tests may interfere with each other or with manual data. Knowing whether to use API calls in `beforeEach`/`afterEach` for setup/teardown, or whether a dedicated test database is available, would make the Playwright tests significantly more reliable.
