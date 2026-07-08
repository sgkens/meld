---
title: Diagnostics Plugin
parent: Plugin Ecosystem
nav_order: 6
excerpt: The meld-diagnostics plugin monitors component setups, mount durations, active instances, and reactive effect counts for production telemetry.
tags: [plugins, diagnostics, debugging, telemetry, performance, active-effects]
category: Plugin Ecosystem
---

# Diagnostics & Telemetry Plugin

`meld-diagnostics` transparently intercepts custom element registration and lifecycles to collect performance metrics, trace reactive overhead, and aggregate runtime errors.

## Import & Installation

```javascript
import { use } from '@meldjs/meld';
import { MeldDiagnostics } from '@meldjs/meld/plugins/meld-diagnostics';

use(MeldDiagnostics);
```

Once installed, it wraps `defineMeld` transparently. Every component registered subsequently is profiled automatically without altering its source code.

## Generating Reports

The diagnostics engine exposes a global telemetry reporter helper `getDiagnosticsReport` (also available via component setup context):

```javascript
// Access inside a component setup function
defineMeld('my-component', (el, { getDiagnosticsReport }) => {
  const printTelemetry = () => {
    console.log(getDiagnosticsReport());
  };
});
```

### Telemetry Report Structure

Calling `getDiagnosticsReport()` returns a JSON object outlining the health and performance profile of your application:

```json
{
  "totalActiveComponents": 5,
  "totalActiveEffects": 34,
  "components": {
    "task-card": {
      "totalCreated": 12,
      "activeCount": 4,
      "averageSetupMs": 0.124,
      "averageMountMs": 0.452,
      "errorCount": 0,
      "errors": []
    },
    "circular-completion-gauge": {
      "totalCreated": 1,
      "activeCount": 1,
      "averageSetupMs": 0.089,
      "averageMountMs": 0.211,
      "errorCount": 0,
      "errors": []
    }
  }
}
```

## Collected Metrics

| Metric | Description |
| :--- | :--- |
| `totalActiveComponents` | The number of custom elements currently attached to the DOM. |
| `totalActiveEffects` | The total number of active reactive effects running across all mounted components. Useful for identifying memory leaks. |
| `totalCreated` | The cumulative count of instances created for a given tag name. |
| `averageSetupMs` | Average execution duration of the component's `setupFn` (constructor phase) using high-precision `performance.now()`. |
| `averageMountMs` | Average execution duration of the component's `onMount` hooks. |
| `errorCount` | Cumulative count of exceptions thrown inside the component's constructor or setup phase. |
| `errors` | List of aggregated errors containing error messages, stacks, and timestamps. |
