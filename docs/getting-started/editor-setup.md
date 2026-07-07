---
title: Editor Setup
parent: getting-started
tags: [editor, setup, syntax highlighting, configuration]
category: getting-started
nav_order: 2
excerpt: A guide to configuring your code editor for optimal syntax highlighting and development experience with Meld.js.
---

# Editor Setup & Syntax Highlighting

Meld uses standard JavaScript Template Literals. To get the best experience (syntax highlighting for HTML inside JS), we recommend configuring your editor.

## 1. VS Code

We provide an official extension that handles syntax highlighting and provides snippets.

### Option A: Install Official Extension

Search for **"Meld.js Support"** (`meld-js.meld-vscode`) in the VS Code Marketplace and install it. The extension provides:

- Syntax highlighting for `meldHtml`, `meld.raw`, and `meld.theme` template literals.
- Snippet library for common Meld component patterns.
- Integration with the `meld-lsp` language server for diagnostics and completions.

### Option B: Manual Configuration

If you prefer not to install specific extensions, you can use the generic **"ES6 String HTML"** extension.

1.  Install **ES6 String HTML**.
2.  Add this to your `.vscode/settings.json`:

```json
{
  "es6-string-html.functionNames": [
    "meldHtml",
    "meld.raw",
    "meld.theme"
  ]
}
```

### TypeScript / JSDoc Type Checking

Meld ships type definitions that work with VS Code's built-in TypeScript checker even in plain `.js` files. Add a `jsconfig.json` (or `tsconfig.json`) at your project root:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "checkJs": true,
    "strict": false,
    "allowJs": true,
    "noEmit": true,
    "paths": {
      "@meldjs/meld": ["./node_modules/@meldjs/meld/src/meld.d.ts"]
    }
  },
  "include": ["src/**/*", "components/**/*"]
}
```

Enable per-file type checking with a JSDoc comment at the top of any `.js` file:

```js
// @ts-check
import { meldHtml } from '@meldjs/meld';
```

### .vscode/settings.json — Formatting

The following workspace settings enforce consistent formatting with Prettier and enable JS type checking:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "js/ts.implicitProjectConfig.checkJs": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.eol": "\n",
  "es6-string-html.functionNames": [
    "meldHtml",
    "meld.raw",
    "meld.theme"
  ]
}
```

### .vscode/extensions.json — Workspace Recommendations

Commit this file to share recommended extensions with your team:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "Tobermory.es6-string-html",
    "meld-js.meld-vscode",
    "ms-vscode.vscode-typescript-next",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg"
  ]
}
```

### meld-lsp Language Server Plugin

`meld-lsp` is the official language server for Meld.js. It provides:

- Completions and hover documentation for `meld.*` APIs.
- Diagnostic errors for invalid component tree structures.
- Go-to-definition support for named Meld slots and refs.

**Install:**

```bash
npm install --save-dev meld-lsp
```

**Configure in `.vscode/settings.json`:**

```json
{
  "meld-lsp.enable": true,
  "meld-lsp.rootDir": "./src",
  "meld-lsp.diagnostics.strictSlots": true
}
```

The LSP server starts automatically when VS Code opens a workspace containing a `@meldjs/meld` dependency.

-----

## 2. Neovim (Tree-sitter)

Neovim users can get perfect highlighting by adding a Tree-sitter query injection.

**File:** `~/.config/nvim/after/queries/javascript/injections.scm` (and `typescript/injections.scm`)

```scheme
; Inject HTML into meldHtml`...`
(call_expression
  function: (identifier) @func_name (#eq? @func_name "meldHtml")
  arguments: (template_string) @injection.content)
  (#set! injection.language "html")

; Inject CSS into meld.theme(`...`)
(call_expression
  function: (member_expression
    object: (identifier) @obj
    property: (property_identifier) @prop)
    (#eq? @obj "meld")
    (#eq? @prop "theme")
  arguments: (arguments (string (string_fragment) @injection.content)))
  (#set! injection.language "css")
```

-----

## 3. Vim / Vim + CoC

Classic Vim users can achieve language server integration via **coc.nvim** (Conquer of Completion).

### Install coc.nvim

Follow the [coc.nvim installation guide](https://github.com/neoclide/coc.nvim). With vim-plug:

```vim
Plug 'neoclide/coc.nvim', {'branch': 'release'}
```

### Install meld-lsp globally

```bash
npm install -g meld-lsp
```

### coc-settings.json

Open the settings file with `:CocConfig` and add:

```json
{
  "languageserver": {
    "meld-lsp": {
      "command": "meld-lsp",
      "args": ["--stdio"],
      "filetypes": ["javascript", "typescript"],
      "rootPatterns": ["package.json", ".git"],
      "initializationOptions": {
        "rootDir": "./src",
        "diagnostics": {
          "strictSlots": true
        }
      }
    }
  },
  "coc.preferences.formatOnSave": true,
  "prettier.enable": true,
  "prettier.tabWidth": 2,
  "prettier.singleQuote": true
}
```

### Syntax Highlighting for Template Literals (Vim)

Install **vim-javascript** and **vim-html-template-literals** for tagged template literal highlighting:

```vim
Plug 'pangloss/vim-javascript'
Plug 'jonsmithers/vim-html-template-literals'
```

Then add to your `~/.vimrc` or `~/.config/nvim/init.vim`:

```vim
let g:htl_all_templates = 0
let g:htl_css_templates = 1
let g:javascript_plugin_jsdoc = 1
```

-----

## 4. Zed Editor

Zed also uses Tree-sitter. You can create a local extension or configure your user settings.

**File:** `~/.config/zed/languages/javascript/injections.scm`

```scheme
((call_expression
  function: (identifier) @name
  arguments: (template_string) @content)
 (#eq? @name "meldHtml")
 (#set! injection.language "html"))
```

-----

## 5. IntelliJ / WebStorm

JetBrains IDEs support "Language Injection" via comments.

```javascript
// Add //language=html before the backtick
return meldHtml//language=html`
  <div class="card">...</div>
`;
```

Alternatively, you can configure a **Global Language Injection** in settings:

1.  Go to **Settings** > **Editor** > **Language Injections**.
2.  Add a new **Generic JS** injection.
3.  **ID:** HTML
4.  **Places Patterns:** `+ taggedString("meldHtml")`

### Live Templates

Live Templates in WebStorm let you expand short abbreviations into full Meld component boilerplate.

**To create a Live Template:**

1.  Go to **Settings** > **Editor** > **Live Templates**.
2.  Create or select a group (e.g., `Meld`).
3.  Click **+** > **Live Template**.

**Example — `mcomp` (Meld component stub):**

- **Abbreviation:** `mcomp`
- **Description:** Meld component boilerplate
- **Template text:**

```javascript
import { meldHtml, meld } from '@meldjs/meld';

export function $NAME$($PROPS$) {
  return meldHtml`
    <div class="$NAME$">
      $END$
    </div>
  `;
}
```

Set **Applicable in:** JavaScript, TypeScript.

**Example — `mtheme` (meld.theme block):**

- **Abbreviation:** `mtheme`
- **Template text:**

```javascript
meld.theme(`
  .$NAME$ {
    $END$
  }
`);
```

### Language Injections for meld.theme and meld.raw

To get CSS highlighting inside `meld.theme(...)` and HTML highlighting inside `meld.raw(...)`:

1.  Go to **Settings** > **Editor** > **Language Injections**.
2.  Add a **Generic JS** injection for `meld.theme`:
    - **ID:** CSS
    - **Places Patterns:** `+ callExpression("meld.theme")`
3.  Add a second **Generic JS** injection for `meld.raw`:
    - **ID:** HTML
    - **Places Patterns:** `+ callExpression("meld.raw")`

These injections activate embedded language support (formatting, completion, error highlighting) inside the respective template strings.

-----

## 6. PostgreSQL Editor Integration

When working on a KMEL (KMEL/Meld/Express/Linux) stack project, you will typically connect editors to a local PostgreSQL development instance. The following covers the three most common tools.

### Connection String Format

All tools accept a standard PostgreSQL connection URI:

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

For a local development instance using the default `postgres` superuser:

```
postgresql://postgres:yourpassword@localhost:5432/kmel_dev
```

### .pgpass File

Store credentials outside your shell history and tooling config by using `~/.pgpass`:

```
# hostname:port:database:username:password
localhost:5432:kmel_dev:postgres:yourpassword
localhost:5432:kmel_test:postgres:yourpassword
```

Set correct permissions — PostgreSQL ignores the file otherwise:

```bash
chmod 0600 ~/.pgpass
```

### DBeaver

1.  Open **Database** > **New Database Connection**.
2.  Select **PostgreSQL**.
3.  Fill in:
    - **Host:** `localhost`
    - **Port:** `5432`
    - **Database:** `kmel_dev`
    - **Username:** `postgres`
    - **Password:** leave blank; DBeaver reads `~/.pgpass` automatically when the file is present and correctly permissioned.
4.  Under **Connection settings** > **PostgreSQL**, enable:
    - **Show all databases:** on
    - **Read all data types from server:** on
5.  Under **SQL Editor** > **Query execution**, set:
    - **Statement delimiter:** `;`
    - **Invalidate results before each execute:** on

### DataGrip

1.  Open the **Database** tool window > **+** > **Data Source** > **PostgreSQL**.
2.  Set **URL:** `jdbc:postgresql://localhost:5432/kmel_dev`
3.  Set **User:** `postgres` — leave **Password** blank and tick **Use ~/.pgpass**.
4.  Under **Options** tab, set:
    - **Transaction mode:** Auto
    - **Dialect:** PostgreSQL
5.  In **Settings** > **Database** > **Query Execution**, enable:
    - **Submit queries on Enter in console:** off (use Ctrl+Enter)
    - **Explain plan format:** TEXT

DataGrip supports per-schema introspection. After connecting, right-click the `kmel_dev` data source and select **Refresh** to introspect all tables and views.

### TablePlus

1.  Click **+** > **Create a new connection** > **PostgreSQL**.
2.  Fill in:
    - **Name:** `kmel_dev local`
    - **Host:** `127.0.0.1`
    - **Port:** `5432`
    - **User:** `postgres`
    - **Password:** `yourpassword`
    - **Database:** `kmel_dev`
3.  Click **Test** to verify, then **Connect**.

Recommended query settings (accessible from **Preferences** > **Editor**):

| Setting | Recommended value |
|---|---|
| Auto-commit | Off (manual transaction control) |
| Query terminator | `;` |
| Fetch limit (rows) | 1000 |
| Wrap long lines | On |
| Syntax highlight dialect | PostgreSQL |

### Environment Variable Pattern

For parity between local tooling and the Node.js runtime, store the connection string in a `.env` file at the project root:

```bash
# .env (never commit to version control)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/kmel_dev
PGUSER=postgres
PGPASSWORD=yourpassword
PGHOST=localhost
PGPORT=5432
PGDATABASE=kmel_dev
```

Add `.env` to `.gitignore`. Provide a committed `.env.example` with placeholder values.

-----

## 7. Recommended Workspace Layout

The following layout is the reference structure for a full KMEL stack project using Meld.js.

### .editorconfig

Place this file at the project root. Most editors pick it up automatically (VS Code requires the **EditorConfig for VS Code** extension).

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.sql]
indent_size = 4

[Makefile]
indent_style = tab
```

### Project Root Structure

```
kmel-project/
├── .editorconfig
├── .env                        # local secrets — not committed
├── .env.example                # committed placeholder
├── .eslintrc.json
├── .gitignore
├── .pgpass                     # PostgreSQL credentials — not committed
├── .prettierrc.json
├── .vscode/
│   ├── extensions.json         # workspace extension recommendations
│   └── settings.json           # workspace editor settings
├── db/
│   ├── migrations/             # SQL migration files (numbered)
│   └── seeds/                  # seed data scripts
├── docs/                       # project documentation (Eleventy/Meld docs site)
├── jsconfig.json               # or tsconfig.json
├── package.json
├── public/                     # static assets served by Express
│   ├── css/
│   ├── fonts/
│   └── js/
├── server/
│   ├── app.js                  # Express entry point
│   ├── middleware/
│   └── routes/
└── src/
    ├── components/             # Meld components
    ├── layouts/                # page-level Meld layouts
    └── pages/                  # route-level page components
```

### .prettierrc.json

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "endOfLine": "lf"
}
```

### .eslintrc.json

```json
{
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "off"
  }
}
```