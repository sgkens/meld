---
title: Advanced Architecture (KMEL)
parent: Architecture
description: A deep dive into the recommended full-stack architecture for Meld, including Knex, Express, and Lucia.
nav_order: 2
tags: [architecture, kmel, full-stack, meld]
category: Architecture
---

# Advanced Architecture: The KMEL Stack

The recommended full-stack solution for Meld emphasizes control and minimalism.

## The KMEL Stack Components

1.  **K** nex.js: SQL Query Builder (Database access).
2.  **M** eld.js: Frontend UI layer.
3.  **E** xpress.js: Minimalist Node.js backend.
4.  **L** ucia Auth: Database-backed session management.

## Integration Flow

This stack works because **Lucia** uses **Knex** as its database driver. The frontend consumes the standard API layer provided by Express.



### Key Integration Points

| Layer        | Technology        | Role                                  | Meld Interaction                                         |
| :----------- | :---------------- | :------------------------------------ | :------------------------------------------------------- |
| **Database** | PostgreSQL/SQLite | Stores user and application data.     | Knex reads/writes via Express API.                       |
| **Auth** | Lucia Auth        | Manages sessions and cookies.         | Runs as Express middleware; sets `res.locals.user`.      |
| **API** | Express.js        | Defines endpoints (`/api/todos`).     | Uses `meld-query` on the client side to fetch JSON data. |
| **Frontend** | Meld.js           | UI rendering and client-side routing. | Uses `meld-router` for navigation.                       |
