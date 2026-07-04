---
title: Installation & Scaffolding
nav_order: 2
---

# 📦 Installation

Meld is designed to be dropped into any project. We recommend using the **Artisan CLI** for project setup.

## **1. Project Scaffolding (Recommended)**

Use the Meld Artisan CLI via `npx` to create the full project structure. This will create necessary folders, `package.json`, and the starter files.

### **Basic Frontend Project**
Scaffolds the minimal structure needed for client-side widgets.
```bash
npx meld-artisan init my-widget-app
```

### **Fullstack KMEL Project**
Scaffolds the entire architecture, including Express, Knex, and Lucia Auth files.
```bash
npx meld-artisan init:stack my-startup
```
> NOTE: After running init:stack, you must run npm install and npm run db:migrate inside the new directory.

## **2. Directory Structure**

Meld encourages a flat, modular structure where the component definition is the component's file.
```plaintext
/my-meld-app
├── index.html            # Entry point
├── server.js             # (If using Express)
├── src/
│   ├── meld.core.js      # The Engine
│   └── plugins/          # All extensions (router, persist, etc.)
└── components/
    ├── app-root.js       # Main Layout
    └── user-card.js      # Component
```

## **3. Launching the App**

Since Meld uses native ES Modules, you must run your application over HTTP.
```bash
# Start the static server for development
npx meld-artisan serve
```