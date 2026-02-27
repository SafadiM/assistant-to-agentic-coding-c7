# Setup & Run

## Prerequisites

You need the following installed on your machine:

| Tool | Check with | Install |
|------|-----------|---------|
| Node.js v18+ | `node --version` | https://nodejs.org |
| Yarn | `yarn --version` | `npm install -g yarn` |
| pnpm | `pnpm --version` | `npm install -g pnpm` |
| PostgreSQL | `psql --version` | See "Database Setup" below |

## 1. Database Setup

You need a PostgreSQL instance running. Either use a local install or Docker.

### Option A: Docker (recommended if you don't have PostgreSQL)

```sh
docker run -d --name config-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=config_api \
  -p 5432:5432 \
  postgres
```

### Option B: Local PostgreSQL

Make sure PostgreSQL is running, then create the database:

```sh
createdb config_api
```

**Default credentials:** username `postgres`, password `postgres`, port `5432`. If yours differ, you'll update them in the `.env` file (step 2).

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
Database connection established
Server running on port 3000 [development]
```

**Verify it's working:**

```sh
curl http://localhost:3000/health
```

Expected response: `{"status":"ok"}`

## 3. Frontend (ui)

Open a **second terminal**:

```sh
cd ui

# Install dependencies
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

- Check PostgreSQL is running: `docker ps` (Docker) or `pg_isready` (local)
- Verify credentials in `.env` match your database setup

## Stopping

Press `Ctrl+C` in each terminal to stop the servers.
