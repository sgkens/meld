---
title: Meld Artisan CLI
parent: Tooling
nav_order: 1
excerpt: Reference for the Meld Artisan CLI — project scaffolding, component and plugin generation, local dev server, and build dev environments.
tags: [tooling, cli, artisan, scaffolding, build, dev-server]
category: Tooling
---

# Meld Artisan CLI

Artisan is your command-line companion, automating setup and component generation.

## 1. Global Usage

Artisan is run via `npx` (Node Package Execute), meaning you don't need to install it globally.

```bash
npx meld-artisan <command> [arguments]
```

## 2. Command Reference

### `init`

Scaffolds the basic client-side Meld structure (`index.html`, `src/`, `components/`).

```bash
npx meld-artisan init my-client-app
```

### `init:stack`

The full-stack scaffold. Creates all files for the **KMEL Stack** (Knex, Meld, Express, Lucia).

* Generates `server.js` with auth middleware.
* Generates `knexfile.js` and database migrations.
* Includes `package.json` with required dependencies.

```bash
npx meld-artisan init:stack my-startup
```

> **Action:** After running, you must execute `npm install` and `npm run db:migrate`.

### `make:component`

Generates a new component file (`.js`) with the necessary `defineMeld`, `meldState`, and `onMount` boilerplate.

```bash
# Creates components/user-profile.js
npx meld-artisan make:component user-profile
```

### `init-dev-env`

Initializes a complete, isolated Docker development environment with a pre-configured PostgreSQL service and a web-accessible VS Code IDE container (running Node.js 22, Git, and npm).

```bash
npx meld-artisan init-dev-env
```

**What it does:**
1. Generates `Dockerfile.dev` with development tools.
2. Generates `docker-compose.dev.yml` configuring the Postgres database and Code Server.

**How to use:**
1. Start the container environment:
   ```bash
   docker compose -f docker-compose.dev.yml up --build -d
   ```
2. Open your browser and navigate to `http://localhost:8080`.
3. Log in using the password `meldpass` to start coding.

### `serve`

Starts a local static server to correctly load ES Modules during development.

```bash
npx meld-artisan serve
```