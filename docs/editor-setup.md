---
title: Editor Setup
nav_order: 30
parent: Installation
---

# Editor Setup & Syntax Highlighting

Meld uses standard JavaScript Template Literals. To get the best experience (syntax highlighting for HTML inside JS), we recommend configuring your editor.

## 1. VS Code

We provide an official extension that handles syntax highlighting and provides snippets.

### Option A: Install Official Extension
Search for **"Meld.js Support"** in the VS Code Marketplace and install it.

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
````

-----

## 2\. Neovim (Tree-sitter)

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

## 3\. Zed Editor

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

## 4\. IntelliJ / WebStorm

JetBrains IDEs support "Language Injection" via comments.

```javascript
// Add //language=html before the backtick
return meldHtml//language=html`
  <div class="card">...</div>
`;
```

Alternatively, you can configure a **Global Language Injection** in settings:

1.  Go to **Settings**\> **Editor**\> **Language Injections**.
2.  Add a new **Generic JS** injection.
3.  **ID:** HTML
4.  **Places Patterns:** `+ taggedString("meldHtml")`