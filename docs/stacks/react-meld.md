---
title: React + Meld Integration
nav_order: 3
parent: Stacks
excerpt: Embed Meld.js custom elements inside React components. Covers import patterns, useRef for element access, useEffect for imperative initialisation, and CustomEvent bridging.
tags: [react, custom-elements, useeffect, useref, integration, stack]
category: Stacks
---

# React + Meld Integration

Meld components are standard Custom Elements. React 19 improved custom element support, but React 18 and earlier pass all non-primitive props as string attributes. This page documents both the straightforward attribute approach and the `useRef` + `useEffect` pattern required for passing objects, arrays, and callbacks to Meld components in React 18.

---

## Prerequisites

- Node.js 18+
- A React project (Vite + React, Create React App, or Next.js client components)
- Meld.js available as an ES module

```bash
npm install meldjs
```

---

## 1. Import Pattern

Import the Meld component file at the top of any module that uses it. The import registers the custom element as a side effect.

```javascript
// src/App.jsx
import './meld/meld-status-badge.js';   // registers <meld-status-badge>
import './meld/meld-data-table.js';     // registers <meld-data-table>

function App() {
  return (
    <div className="app">
      <meld-status-badge label="API" status="online" />
    </div>
  );
}

export default App;
```

Import in `main.jsx` / `index.jsx` if the component is used globally across the application:

```javascript
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Global Meld component registrations
import './meld/meld-notification-bell.js';
import './meld/meld-status-badge.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 2. Passing String Attributes (React 18)

For string and number props, JSX attributes map directly to HTML attributes. Meld reads these from `el.getAttribute()` or observes them via `attributeChangedCallback`:

```jsx
function StatusPanel({ label, status }) {
  return (
    <div className="panel">
      {/* String and number attributes work without useRef */}
      <meld-status-badge label={label} status={status} />
    </div>
  );
}
```

---

## 3. Passing Objects and Arrays via useRef + useEffect

React 18 serialises non-string JSX props to `"[object Object]"` when setting them as attributes on custom elements. Use a `ref` to obtain the DOM node and set properties imperatively after mount.

```jsx
import { useRef, useEffect } from 'react';
import './meld/meld-data-table.js';

function ReportTable({ columns, rows }) {
  const tableRef = useRef(null);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;

    // Set JS properties directly on the DOM node.
    // Meld observes these via its internal property system, not attributeChangedCallback.
    el.columns = columns;
    el.rows = rows;
  }, [columns, rows]); // Re-run whenever columns or rows reference changes

  return <meld-data-table ref={tableRef} />;
}
```

> **React 19:** Custom element property support is built into React 19's JSX transform. Non-string props are set as DOM properties automatically. Verify your React version before deciding which pattern to use.

---

## 4. Listening to Meld Events

Meld components dispatch `CustomEvent` instances on the element. React's synthetic event system does not intercept these. Attach listeners using `addEventListener` inside `useEffect`.

```jsx
import { useRef, useEffect, useState } from 'react';
import './meld/meld-data-table.js';

function InteractiveTable({ rows }) {
  const tableRef = useRef(null);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;

    // Set object properties
    el.rows = rows;

    // Attach CustomEvent listeners
    const handleRowSelect = (event) => {
      setSelectedRow(event.detail.row);
    };

    const handleSortChange = (event) => {
      console.log('Sort:', event.detail.column, event.detail.direction);
    };

    el.addEventListener('row-selected', handleRowSelect);
    el.addEventListener('sort-changed', handleSortChange);

    // Cleanup on unmount or before next effect run
    return () => {
      el.removeEventListener('row-selected', handleRowSelect);
      el.removeEventListener('sort-changed', handleSortChange);
    };
  }, [rows]);

  return (
    <div>
      <meld-data-table ref={tableRef} />
      {selectedRow && (
        <div className="detail-panel">
          Selected: {selectedRow.id}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Wrapper Component Pattern

For frequent use across a codebase, encapsulate the `useRef` / `useEffect` boilerplate in a thin React wrapper component. This keeps consuming components clean.

```jsx
// src/wrappers/MeldDataTable.jsx
import { useRef, useEffect } from 'react';
import '../meld/meld-data-table.js';

/**
 * React wrapper for <meld-data-table>.
 * Handles property assignment and event bridging.
 */
export function MeldDataTable({ columns, rows, onRowSelect, onSortChange, ...attrs }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.columns = columns;
    el.rows = rows;

    const handleRowSelect = (e) => onRowSelect?.(e.detail);
    const handleSortChange = (e) => onSortChange?.(e.detail);

    el.addEventListener('row-selected', handleRowSelect);
    el.addEventListener('sort-changed', handleSortChange);

    return () => {
      el.removeEventListener('row-selected', handleRowSelect);
      el.removeEventListener('sort-changed', handleSortChange);
    };
  }, [columns, rows, onRowSelect, onSortChange]);

  // Spread any remaining string attrs (class, id, aria-*, etc.)
  return <meld-data-table ref={ref} {...attrs} />;
}
```

Usage:

```jsx
import { MeldDataTable } from './wrappers/MeldDataTable.jsx';

function Dashboard({ reportData }) {
  return (
    <MeldDataTable
      columns={reportData.columns}
      rows={reportData.rows}
      onRowSelect={(row) => console.log('Selected:', row)}
    />
  );
}
```

---

## 6. Next.js Considerations

Next.js renders server-side by default. Custom Elements are browser APIs and cannot execute during SSR.

Mark any file that imports Meld components with the `'use client'` directive:

```jsx
// src/app/dashboard/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import '../../meld/meld-data-table.js';

export default function DashboardPage() {
  const tableRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/data')
      .then((r) => r.json())
      .then((rows) => {
        setData(rows);
        if (tableRef.current) {
          tableRef.current.rows = rows;
        }
      });
  }, []);

  return <meld-data-table ref={tableRef} />;
}
```

For Next.js App Router, dynamic imports with `{ ssr: false }` are another option for deferring the Meld import to the client bundle:

```jsx
import dynamic from 'next/dynamic';

const MeldTableWrapper = dynamic(
  () => import('../../wrappers/MeldDataTable'),
  { ssr: false }
);
```

---

## 7. Project Structure Reference

```text
/my-react-meld-app
├── src/
│   ├── main.jsx              # Global Meld imports (if used app-wide)
│   ├── App.jsx
│   ├── meld/                 # Meld component definitions
│   │   ├── meld-data-table.js
│   │   └── meld-status-badge.js
│   └── wrappers/             # React wrapper components for Meld elements
│       └── MeldDataTable.jsx
└── package.json
```

---

## React 18 vs. React 19 Behaviour Summary

| Feature                        | React 18              | React 19              |
| :----------------------------- | :-------------------- | :-------------------- |
| String attributes              | Supported             | Supported             |
| Object / array props via JSX   | Serialised to string  | Set as DOM property   |
| `CustomEvent` via `on*` props  | Not supported         | Not supported         |
| Recommended object pass method | `useRef` + `useEffect`| JSX prop (React 19)   |
| SSR compatibility              | Requires `'use client'` or dynamic import | Same |
