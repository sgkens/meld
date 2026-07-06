---
title: Docker / Podman Local Development with PostgreSQL
nav_order: 6
parent: Stacks
excerpt: Full docker-compose and podman-compose configuration for a local PostgreSQL development environment with a Node.js Meld application, pgAdmin, persistent volumes, and migration tooling.
tags: [docker, podman, postgresql, postgres, local-dev, docker-compose, stack]
category: Stacks
---

# Docker / Podman Local Development with PostgreSQL

PostgreSQL is Meld's preferred production database. This page provides a complete `docker-compose.yml` for a local development environment that runs PostgreSQL, pgAdmin, and the Node.js application in containers with a shared network, persistent data volumes, and environment variable management. A `podman-compose` equivalent is included at the end.

---

## What This Stack Runs

| Service    | Image                       | Default Port | Purpose                           |
| :--------- | :-------------------------- | :----------- | :-------------------------------- |
| `postgres` | `postgres:16-alpine`        | 5432         | PostgreSQL database               |
| `pgadmin`  | `dpage/pgadmin4`            | 5050         | Web-based database admin UI       |
| `app`      | Node.js (local Dockerfile)  | 3000         | Meld + Express application server |

---

## 1. Directory Layout

```text
/my-meld-app
├── .env                    # Local secrets (git-ignored)
├── .env.example            # Committed env template
├── docker-compose.yml      # Compose file (Docker and Podman)
├── Dockerfile              # Node app image definition
├── package.json
├── knexfile.js             # Database configuration
├── db/
│   ├── index.js            # Knex instance
│   └── migrations/         # Knex migration files
├── server.js               # Express entry point
└── public/                 # Meld frontend (static files)
```

---

## 2. `.env.example`

Commit this file. Each developer copies it to `.env` and fills in their values. Never commit `.env` itself.

```dotenv
# .env.example

# PostgreSQL connection
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=meldapp
POSTGRES_USER=melduser
POSTGRES_PASSWORD=changeme

# pgAdmin web UI
PGADMIN_DEFAULT_EMAIL=admin@local.dev
PGADMIN_DEFAULT_PASSWORD=changeme

# Application
NODE_ENV=development
APP_PORT=3000
SESSION_SECRET=replace-with-a-long-random-string
```

```bash
# Each developer runs this once after cloning:
cp .env.example .env
```

---

## 3. `docker-compose.yml`

```yaml
# docker-compose.yml
version: "3.9"

services:

  # ─── PostgreSQL ──────────────────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: meldapp_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB:       ${POSTGRES_DB}
      POSTGRES_USER:     ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      # Named volume: data survives container removal
      - postgres_data:/var/lib/postgresql/data
    networks:
      - meldapp_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── pgAdmin ─────────────────────────────────────────────────────────────────
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: meldapp_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL:    ${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - meldapp_net
    depends_on:
      postgres:
        condition: service_healthy

  # ─── Node Application ────────────────────────────────────────────────────────
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: meldapp_app
    restart: unless-stopped
    env_file:
      - .env
    environment:
      # Override host to use Docker service name instead of localhost
      POSTGRES_HOST: postgres
    ports:
      - "${APP_PORT:-3000}:3000"
    volumes:
      # Bind-mount source for hot-reload (development only)
      - .:/usr/src/app
      # Prevent host node_modules from overriding container's
      - /usr/src/app/node_modules
    networks:
      - meldapp_net
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev

# ─── Named Volumes ──────────────────────────────────────────────────────────────
volumes:
  postgres_data:
  pgadmin_data:

# ─── Networks ───────────────────────────────────────────────────────────────────
networks:
  meldapp_net:
    driver: bridge
```

---

## 4. `Dockerfile`

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy application source
COPY . .

EXPOSE 3000

# Default command; overridden by docker-compose command field in development
CMD ["node", "server.js"]
```

For development, `docker-compose.yml` overrides `CMD` with `npm run dev` (which runs `nodemon` for file-watch restarts). The production image uses the default `CMD`.

---

## 5. `knexfile.js`

Knex reads connection details from environment variables, so the same `knexfile.js` works in Docker and on bare-metal with a local Postgres instance.

```javascript
// knexfile.js
export default {
  development: {
    client: 'pg',
    connection: {
      host:     process.env.POSTGRES_HOST     || 'localhost',
      port:     parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      database: process.env.POSTGRES_DB       || 'meldapp',
      user:     process.env.POSTGRES_USER     || 'melduser',
      password: process.env.POSTGRES_PASSWORD || '',
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL, // Single connection string in production
    ssl: { rejectUnauthorized: false },
    migrations: {
      directory: './db/migrations',
    },
  },
};
```

---

## 6. Running Migrations

Migrations run inside the `app` container where Knex and the database connection are available. The `package.json` scripts wrap the Knex CLI commands.

```json
{
  "scripts": {
    "dev":          "nodemon server.js",
    "start":        "node server.js",
    "db:migrate":   "knex migrate:latest",
    "db:rollback":  "knex migrate:rollback",
    "db:seed":      "knex seed:run",
    "db:make":      "knex migrate:make"
  }
}
```

Run migrations after starting the stack:

```bash
# Start all services in detached mode
docker compose up -d

# Wait for the postgres healthcheck to pass, then run migrations
docker compose exec app npm run db:migrate

# Optional: seed development data
docker compose exec app npm run db:seed
```

Create a new migration file:

```bash
docker compose exec app npm run db:make -- create_users_table
# Creates: db/migrations/20240101000000_create_users_table.js
```

Example migration file:

```javascript
// db/migrations/20240101000000_create_users_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('username', 64).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('hashed_password', 255).notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });

  await knex.schema.createTable('sessions', (table) => {
    table.string('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('expires_at').notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('users');
}
```

---

## 7. Common Docker Compose Commands

```bash
# Start all services
docker compose up -d

# View logs for a specific service
docker compose logs -f app
docker compose logs -f postgres

# Stop all services (data volumes are preserved)
docker compose down

# Stop all services and remove named volumes (destructive — deletes database data)
docker compose down -v

# Rebuild the app image after Dockerfile changes
docker compose build app
docker compose up -d --no-deps app

# Open a psql shell directly in the postgres container
docker compose exec postgres psql -U melduser -d meldapp

# Run an arbitrary npm command inside the app container
docker compose exec app npm run db:migrate
```

---

## 8. Podman Compose Equivalent

Podman uses rootless containers by default. The compose file is compatible with `podman-compose`. Install it with:

```bash
pip install podman-compose
# or
dnf install podman-compose   # Fedora/RHEL
```

Usage is identical to Docker Compose:

```bash
podman-compose up -d
podman-compose exec app npm run db:migrate
podman-compose logs -f app
podman-compose down
```

**Podman-specific notes:**

- Podman does not require a daemon. Each container runs as a systemd unit (optional).
- Port binding below 1024 requires `net.ipv4.ip_unprivileged_port_start` to be set, or use ports above 1024 (e.g., map `5432:5432` is fine).
- To generate systemd unit files for autostart, use `podman generate systemd`.
- The `healthcheck` directive in compose is supported from `podman-compose` 1.0.6+.

If you use Podman with SELinux (RHEL / Fedora), add the `:z` volume option to bind mounts to allow the container process to access the host path:

```yaml
    volumes:
      - .:/usr/src/app:z
      - /usr/src/app/node_modules
```

---

## 9. pgAdmin Connection Setup

After starting the stack, open `http://localhost:5050` and log in with the credentials in `.env`.

Add a new server in pgAdmin:

| Field    | Value                         |
| :------- | :---------------------------- |
| Name     | `meldapp local`               |
| Host     | `postgres` (Docker service name) or `localhost` (if pgAdmin runs on host) |
| Port     | `5432`                        |
| Database | value of `POSTGRES_DB`        |
| Username | value of `POSTGRES_USER`      |
| Password | value of `POSTGRES_PASSWORD`  |

If connecting from a pgAdmin instance running outside Docker (on the host machine), use `localhost` as the host instead of the service name `postgres`.

---

## 10. Easy Scaffold via Artisan CLI

Meld Artisan provides a one-command setup for an advanced local Docker development environment. It configures the PostgreSQL service alongside a browser-accessible VS Code Web IDE container (`code-server`) equipped with Node.js 22 and Git:

```bash
npx meld-artisan init-dev-env
```

This generates:
* `Dockerfile.dev`: A development image configuration.
* `docker-compose.dev.yml`: A Compose configuration file orchestration Postgres and the IDE container.

Run `docker compose -f docker-compose.dev.yml up --build -d` and visit `http://localhost:8080` (password: `meldpass`) to instantly code in the container.

