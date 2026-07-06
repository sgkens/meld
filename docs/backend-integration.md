---
title: Backend Integration (KMEL Stack)
nav_order: 8
excerpt: Connecting the Meld.js frontend to a Node.js backend using Knex for database access and Lucia for session-based authentication.
tags: [backend, knex, lucia, express, authentication, database, kmel]
category: Docs
---

# Backend Integration: Knex, Lucia, Express

This section details how to connect the Meld frontend to a robust, database-driven Node.js backend.

## 1. Knex & PostgreSQL/SQLite Integration

Knex is used by the server to manage the database, ensuring clean, version-controlled SQL operations via migrations. Meld communicates with this layer using the `meld-query` plugin.

## 2. Lucia Auth Integration

Lucia handles session management and security. It utilizes Express middleware to validate the user's session cookie on every request, making the user object available via `res.locals.user`.

### Frontend Authentication Flow (Meld Side)
Meld focuses purely on the UI and sending simple requests.

1.   **Login:** Meld makes an `fetch` call (via `meld-query`) to the Express endpoint `/api/login` with user credentials.
2.   **Cookie:** Express/Lucia sets an encrypted `Set-Cookie` header in the response.
3.  **Auth Check:** Subsequent `meld-query` requests automatically include this cookie.

## 3. Express App Example (Scaffolding the API)

When you use `npx meld-artisan init:stack`, it scaffolds the necessary Express setup. The key components are serving static files and implementing the SPA fallback.

```javascript
// server.js (Simplified Example)
import express from 'express';
// Assuming the Lucia auth middleware is already wired up...

app.use(express.json());

// --- API Endpoint (Data for Meld) ---
app.get('/api/projects', async (req, res) => {
  // Check if user is authenticated (set by Lucia middleware)
  if (!res.locals.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Use KNEX to query the database
  const projects = await db('projects').where('user_id', res.locals.user.id).select('name');
  res.json(projects);
});

// --- SPA Fallback ---
// This ensures /about or /dashboard works on refresh
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).end();
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});