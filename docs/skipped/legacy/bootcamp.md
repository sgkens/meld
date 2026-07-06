---
title: The 30-Minute Bootcamp
nav_order: 20
---

# Meld Bootcamp

Learn the entire framework by building a "Real-time Task Manager."

### **Part 1: Scaffolding**
```bash
npx meld-artisan init todo-app
cd todo-app
```

### **Part 2: The Data Store**
Create `src/store.js`:
```javascript
import { meldState } from './src/meld.core.js';
export const store = meldState({ tasks: [] });
```

### **Part 3: The Task Component**
Run `npx meld-artisan make:component task-item`.
Add logic to handle completion toggle.

### **Part 4: The Dashboard**
Update `components/app-root.js` to render the list using `meld.list()`.

### **Part 5: Persistence**
Install the `persist` plugin to save tasks to LocalStorage.

### **Part 6: Static Build**
Run `build:static` to see how it looks as a pre-rendered site.
