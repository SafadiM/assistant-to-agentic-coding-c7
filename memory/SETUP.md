# Setup & Run

## Prerequisites

You need the following installed on your machine:

| Tool | Check with | Install |
|------|-----------|---------|
| Node.js v18+ | `node --version` | https://nodejs.org |
| Yarn | `yarn --version` | `npm install -g yarn` |
| pnpm | `pnpm --version` | `npm install -g pnpm` |
| PostgreSQL | `psql --version` | See "Database Setup" below |
| Docker & Docker Compose | `docker compose version` | https://docs.docker.com/get-docker |

## 1. Infrastructure (Docker Compose)

PostgreSQL runs locally. Jaeger (for tracing) runs in Docker via the `docker-compose.yml` at the project root.

### PostgreSQL

Make sure PostgreSQL is running locally, then create the database if it doesn't exist:

```sh
createdb config_api
```

**Default credentials:** username `postgres`, password `postgres`, port `5432`. If yours differ, update them in the `.env` file (step 2).

### Jaeger (tracing)

From the project root (`ai-course/`):

```sh
docker compose up -d
```

This starts:
- **Jaeger UI** on http://localhost:16686
- **OTLP HTTP receiver** on port `4318`

## 2. Backend (config-service)

```sh
cd config-service

# Install dependencies
yarn install

# Create your environment file from the template
cp .env.example .env
```

Open `.env` and verify/adjust the values for your setup:

```
PORT=3000              # Change if port 3000 is already in use
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432           # Change if your PostgreSQL runs on a different port
DB_USERNAME=postgres   # Change to match your database user
DB_PASSWORD=postgres   # Change to match your database password
DB_NAME=config_api

# OpenTelemetry (optional — defaults work for local development with Jaeger)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

Then run the database migration and start the server:

```sh
# Apply database schema
yarn migration:run

# Start the backend
yarn dev
```

**What you should see:**

```
[INFO] ts-node-dev ver. 2.0.0 ...
OpenTelemetry tracing initialized
Database connection established
Server running on port 3000 [development]
```

**Verify it's working:**

```sh
curl http://localhost:3000/health
```

Expected response: `{"status":"ok"}`

## 3. Client Library (config-client)

```sh
cd config-client

# Install dependencies
pnpm install

# Build (compiles TypeScript to dist/)
pnpm build
```

The client library must be built before the frontend can use it. The frontend references it via `file:../config-client` in its `package.json`.

## 4. Frontend (ui)

Open a **second terminal**:

```sh
cd ui

# Install dependencies (includes config-client)
pnpm install

# Start the frontend
pnpm dev
```

**What you should see:**

```
VITE ready in ~200ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. You should see the Config Admin interface.

**Note:** The backend must be running first — the frontend proxies API requests to port 3000. If you changed `PORT` in `.env`, update the proxy target in `ui/vite.config.ts` to match.

## Troubleshooting

### Port already in use

If you see `EADDRINUSE: address already in use :::3000`:

```sh
# Find what's using the port
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill
```

Then start the backend again. Same approach for port 5173 if needed.

### Database connection refused

- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env` match your database setup

### Traces not appearing in Jaeger

- Check Jaeger is running: `docker compose ps`
- Verify `OTEL_EXPORTER_OTLP_ENDPOINT` in `.env` points to `http://localhost:4318/v1/traces`
- See "Viewing Traces in Jaeger" below

## Viewing Traces in Jaeger

1. Make sure Jaeger is running (`docker compose up -d` from the project root)
2. Make sure the backend is running (`cd config-service && yarn dev`)
3. Generate some traffic:

```sh
curl http://localhost:3000/health
curl http://localhost:3000/configs
```

4. Open **http://localhost:16686** in your browser
5. Select **`config-service`** from the **Service** dropdown
6. Click **Find Traces**
7. Click any trace to see the full span breakdown (Express request handling, PostgreSQL queries, etc.)

Each trace shows the request lifecycle with timing for every auto-instrumented operation. Pino log entries within a request are tagged with `trace_id` and `span_id` for correlation.

## Stopping

Press `Ctrl+C` in each terminal to stop the servers. To stop Jaeger:

```sh
cd ~/projects/ai-course
docker compose down
```
