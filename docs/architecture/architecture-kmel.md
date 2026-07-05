---
title: The KMEL Stack
nav_order: 4
parent: Architecture
Description: The recommended architecture for full-stack applications using Knex, Meld, Express, and Lucia.
tags: [architecture, kmel, full-stack, meld]
category: Architecture
---

# The KMEL Stack Architecture
    
For full-stack applications, we recommend the **KMEL** pattern. It emphasizes code ownership and standard libraries over "magic" frameworks.

## The Components

1.  **K** nex.js (Database Query Builder)
2.  **M** eld.js (Frontend)
3.  **E** xpress.js (Backend API)
4.  **L** ucia Auth (Session Management)



## Why this stack?

* **Database First:** Knex gives you full control over SQL.
* **Security:** Lucia manages secure, HTTP-only session cookies.
* **Simplicity:** No build step. Express serves the static Meld files.
* **Decoupled:** The frontend talks to the backend purely via JSON APIs. You can replace the frontend later without rewriting the backend.

## Scaffolding
Run this command to generate the entire KMEL directory structure:
```bash
npx meld-artisan init:stack my-project
````