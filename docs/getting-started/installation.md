---
title: Installation & Scaffolding
nav_order: 1
parent: Getting Started
Description: Step-by-step instructions for installing Meld.js, scaffolding a new project, and using the Artisan CLI for development and testing.
tags: [installation, setup, artisan-cli, scaffolding]
category: Getting Started
---

# Installation and Artisan CLI

The **Meld Artisan CLI** is the recommended way to start any project, as it handles boilerplate, configuration, and environment setup.

## 1. Local Setup

Meld requires Node.js (v14+) to run the Artisan CLI.

### Basic Project Scaffolding
Scaffolds a frontend-only project with `index.html` and the required directory structure.

```bash
npx meld-artisan init my-client-widgets
# cd my-client-widgets
````

### Fullstack KMEL Setup (Recommended)

Scaffolds the complete **Knex, Meld, Express, Lucia** stack, ready for database-driven applications.

```bash
npx meld-artisan init:stack my-startup
```

> **Post-Setup Action:** After scaffolding the KMEL stack, remember to run: `npm install` and `npm run db:migrate` to set up dependencies and the database schema.

## 2\. Artisan Command Reference

| Command          | Usage                       | Description                                                                         |
| :--------------- | :-------------------------- | :---------------------------------------------------------------------------------- |
| `init`           | `init <name>`               | Scaffolds the basic client-side project structure.                                  |
| `init:stack`     | `init:stack <name>`         | Scaffolds the full Express/Knex/Lucia server and client structure.                  |
| `make:component` | `make:component <tag-name>` | Generates a component file with boilerplate and testing stubs.                      |
| `serve`          | `serve`                     | Starts a local static server to correctly load ES Modules over HTTP.                |
| `test`           | `test`                      | Executes the unit test suite using the configured testing library (requires setup). |

## 3\. Launching Development

To maintain a smooth developer experience (DX), always use the `serve` command to launch your app.

```bash
npx meld-artisan serve
```

## Next Steps

To get the most out of your development environment, configure your code editor (e.g. VS Code, Neovim, Zed, or IntelliJ) for syntax highlighting and LSP integration:

- Proceed to the [Editor Setup & Syntax Highlighting](/getting-started/editor-setup/) guide.