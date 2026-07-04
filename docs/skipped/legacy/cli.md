---
title: Artisan CLI
nav_order: 6
---

# 🛠️ Meld Artisan CLI

Artisan is your command-line companion, automating setup and component generation.

## **1. Global Usage**

Artisan is run via `npx` (Node Package Execute), meaning you don't need to install it globally.

```bash
npx meld-artisan <command> [arguments]
```

## **2. Command Reference**

### **`init`**
Scaffolds the basic client-side Meld structure (`index.html`, `src/`, `components/`).
```bash
npx meld-artisan init my-client-app
```

### **`init:stack`**
The full-stack scaffold. Creates all files for the KMEL Stack (Knex, Meld, Express, Lucia).
- Generates `server.js` with auth middleware.
- Generates `knexfile.js` and database migrations.
- Includes `package.json` with required dependencies.

```bash
npx meld-artisan init:stack my-startup
```
> Action: After running, you must execute `npm install` and `npm run db:migrate`.

### **`make:component`**
Generates a new component file (`.js`) with the necessary `defineMeld`, `meldState`, and `onMount` boilerplate.
```bash
# Creates components/user-profile.js
npx meld-artisan make:component user-profile
```

### **`serve`**
Starts a local static server to correctly load ES Modules during development.
```bash
npx meld-artisan serve
```