---
title: Meld Artisan CLI
parent: Tooling
nav_order: 1
excerpt: Reference for the Meld Artisan CLI — project scaffolding, component and plugin generation, local dev server, and build commands.
tags: [tooling, cli, artisan, scaffolding, build, dev-server]
category: Tooling
---

# Meld Artisan CLI

**Meld Artisan** is a command-line interface (CLI) designed to streamline your development workflow. Inspired by Laravel's Artisan, it eliminates boilerplate and manages project structure.

<pre>
__  __     _     _   
 |  \/  |___| | __| |  The 2kb Micro-Frontend Engine
 | |\/| / -_) |/ _` |  Artisan CLI v2.0
 |_|  |_\___|_|\__,_|  

Available commands:

  init                 <name>
  └─ Create a new client-side Meld project.

  init:stack           <name>
  └─ Scaffold the full KMEL Stack (Knex, Meld, Express, Lucia).

  make:component       <tag-name>
  └─ Create a new UI component file.

  make:plugin          <PluginName>
  └─ Create a boilerplate for a custom plugin.

  install:plugin       <plugin-name>
  └─ Install an official plugin (router, query, store).

  serve                
  └─ Start the development server.
</pre>

### Getting Started

You do not need to install Artisan globally. It is designed to be run on-demand using `npx`.

**Prerequisites:** 
  * **Node.js** (v14+)
  * **npm** (comes with Node)

-----

### Command Reference

#### 1\. `init`

Initializes a new Meld project in a specific directory. It sets up the standard folder structure and creates the entry points.

**Usage:** 
```bash
npx meld-artisan init <project-name>
```

**What it does:** 
1.  Creates a directory named `<project-name>`.
2.  Generates `index.html` with the correct ES Module imports.
3.  Creates `src/` (for the core engine) and `components/` (for your UI).
4.  Generates a starter `<app-root>` component.

**Example Output:** 
```text
/my-app
├── index.html
├── src/
│   └── meld.core.js (Placeholder)
└── components/
    └── app-root.js
```

-----

#### 2\. `make:component`

Generates a new component file with the necessary imports, state setup, and lifecycle hooks pre-filled.

**Usage:** 
```bash
npx meld-artisan make:component <tag-name>
```

**Rules:** 
  * `<tag-name>` **must** contain a hyphen (e.g., `nav-bar`, `user-card`) to comply with the Custom Elements spec.

**Example:** 
```bash
npx meld-artisan make:component user-card
```

**Result (`components/user-card.js`):** 
```javascript
import { defineMeld, meldHtml, meldState, onMount } from '../src/meld.core.js';

defineMeld('user-card', (el, { emit }) => {
  const state = meldState({
    // Reactive state goes here
  });

  onMount(() => {
    console.log('user-card mounted');
  });

  return meldHtml`
    <style>
      :host { display: block; }
    </style>
    
    <div>
      <h3>User Card</h3>
    </div>
  `;
});
```

-----

#### 3\. `serve`

Starts a lightweight, static development server.

**Why do I need this?** Meld uses native ES Modules (`import ... from ...`). Browsers block these imports when opening a file directly from the file system (`file://`) for security reasons. You must serve your app via HTTP (`http://localhost...`).

**Usage:** 
```bash
npx meld-artisan serve
```

  *  **Port:** Default is usually `3000` or `5000` (depending on the environment).
  * **Live Reload:** (Optional feature depending on implementation).

-----

### Workflow Example

Here is a typical workflow for starting a new Meld application:

1.  **Create the project:** 
    ```bash
    npx meld-artisan init my-dashboard
    cd my-dashboard
    ```

2.  **Create your first components:** 
    ```bash
    npx meld-artisan make:component side-bar
    npx meld-artisan make:component data-chart
    ```

3.  **Start the server:** 
    ```bash
    npx meld-artisan serve
    ```

4.  **Open Browser:**     Go to `http://localhost:3000` to see your app running.

-----

### Configuration

Meld Artisan is "Zero Configuration" by default. It assumes the following standard directory structure:

  *  **Core:** `../src/meld.core.js` (relative to the components folder)
  *  **Components:** `./components/`

If you change your folder structure manually, you may need to update the import paths in your generated components.

==========================================

>>>>>> V2

---
title: Artisan CLI
nav_order: 6
---

# Meld Artisan CLI

Artisan is your command-line companion, automating setup and component generation.

## 1. Global Usage

Artisan is run via `npx` (Node Package Execute), meaning you don't need to install it globally.

```bash
npx meld-artisan <command> [arguments]
````

## 2\. Command Reference

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

<!-- end list -->

```bash
npx meld-artisan init:stack my-startup
```

>  **Action:** After running, you must execute `npm install` and `npm run db:migrate`.

### `make:component`

Generates a new component file (`.js`) with the necessary `defineMeld`, `meldState`, and `onMount` boilerplate.

```bash
# Creates components/user-profile.js
npx meld-artisan make:component user-profile
```

### `serve`

Starts a local static server to correctly load ES Modules during development.

```bash
npx meld-artisan serve
```