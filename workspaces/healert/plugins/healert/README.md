# @backstage-community/plugin-healert

**Friction Intelligence Platform for Backstage.**

Surfaces Kubernetes audit log bypass events per catalog entity as real-time Friction Scores and Heatmaps. Know when developers bypass the golden path before it becomes a crisis.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/version-0.1.1-Coral-green.svg)](https://github.com/backstage/community-plugins/tree/main/workspaces/healert)
[![Backstage](https://img.shields.io/badge/Backstage-compatible-9BF0E1.svg)](https://backstage.io)

---

## Overview

```
Kubernetes Audit Log
      ↓  (Go agent DaemonSet — github.com/healert-io/agent)
Healert Backend  (self-hosted FastAPI — github.com/healert-io/backend)
      ↓  (Backstage proxy: /api/proxy/healert)
@backstage-community/plugin-healert
      ↓
FrictionScoreCard + FrictionHeatmap per catalog entity
```

---

## Features

- **FrictionScoreCard** — Score 0–100 with exponential time decay, severity badge,
  overhead hours per engineer, top friction workflow, and projected improvement
- **FrictionHeatmap** — Event type × workflow matrix with drill-down modal per cell
- **PDF Export** — Full friction analysis report with score, events, heatmap, and
  decay formula — shareable with engineering leadership
- **Graceful empty states** — Clear actionable messages when backend or agent
  is not running
- **Auto-namespace resolution** — Multi-namespace clusters work with zero
  configuration

---

## Prerequisites

This plugin requires two self-hosted components:

| Component       | Repository                                                  | Purpose                           |
| --------------- | ----------------------------------------------------------- | --------------------------------- |
| Healert Backend | [healert-io/backend](https://github.com/healert-io/backend) | Stores and scores friction events |
| Healert Agent   | [healert-io/agent](https://github.com/healert-io/agent)     | Tails Kubernetes audit log        |

Both can be deployed in under 10 minutes:

```bash
git clone https://github.com/healert-io/agent.git
cd agent
./healert.sh init && ./healert.sh setup && ./healert.sh start
```

---

## Installation

### Step 1 — Install the plugin

```bash
# From your Backstage root
yarn workspace app add @backstage-community/plugin-healert
```

### Step 2 — Add to your Entity page

In `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import { EntityHealertContent } from '@backstage-community/plugin-healert';

// Add to the serviceEntityPage (or any entity page):
const serviceEntityPage = (
  <EntityLayout>
    {/* ... existing tabs ... */}
    <EntityLayout.Route path="/healert" title="HEALERT PLATFORM">
      <EntityHealertContent />
    </EntityLayout.Route>
  </EntityLayout>
);
```

### Step 3 — Configure the Backstage proxy

In `app-config.yaml`:

```yaml
proxy:
  endpoints:
    '/healert':
      target: 'http://localhost:8000'
      changeOrigin: true
```

### Step 4 — Add plugin configuration

In `app-config.yaml`:

```yaml
healert:
  baseUrl: /api/proxy/healert
```

### Step 5 — Restart Backstage

```bash
yarn start
```

Open your Backstage instance and navigate to any catalog entity — the **HEALERT PLATFORM** tab will appear.

---

## Configuration Reference

### app-config.yaml

```yaml
proxy:
  endpoints:
    '/healert':
      target: '${HEALERT_BACKEND_URL}' # e.g. http://localhost:8000
      changeOrigin: true

healert:
  baseUrl: /api/proxy/healert
```

### Environment variables

| Variable              | Description                            |
| --------------------- | -------------------------------------- |
| `HEALERT_BACKEND_URL` | URL of the self-hosted Healert backend |

---

## Entity Catalog Setup

Add this annotation to your catalog entity to enable friction tracking:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payments-api
  namespace: default # must match ENTITY_NAMESPACE in agent config
  annotations:
    backstage.io/managed-by-location: 'url:...'
spec:
  type: service
  lifecycle: production
  owner: team-payments
```

The entity `name` must match the Kubernetes workload name and the `namespace`
must match the Kubernetes namespace where the workload runs.

---

## Scoring Formula

```
Score = min(100, round(weighted_total / 50 × 100))

weighted_total = Σ ( points × 0.5 ^ (age_days / 7) )
```

| Severity | Points | Decay at 7d | Decay at 30d |
| -------- | ------ | ----------- | ------------ |
| high     | 10     | 50%         | ~3%          |
| medium   | 6      | 50%         | ~3%          |
| low      | 3      | 50%         | ~3%          |

Scores decay automatically — no manual resets needed. A service with bypass events from last month will trend back to zero as the team improves behavior.

---

## Development

### Run locally

```bash
# Clone community-plugins
git clone https://github.com/backstage/community-plugins.git
cd community-plugins/workspaces/healert

# Install dependencies
yarn install

# Start the plugin in development mode
yarn start
```

### Run tests

```bash
yarn test --watchAll=false
```

### Build

```bash
yarn tsc
yarn build
```

---

## Backend API

The plugin communicates with the Healert backend via the Backstage proxy.

### GET /friction/{entity_ref}

Returns friction score and events for a catalog entity.

```bash
# entity_ref format: kind:namespace/name
curl http://localhost:8000/friction/component:default/payments-api
```

```json
{
  "entityRef": "component:default/payments-api",
  "frictionScore": {
    "score": 60,
    "severity": "high",
    "bypassCount": 3,
    "overheadHoursPerEngineer": 1.3,
    "topFrictionWorkflow": "deploy",
    "calculatedAt": "2026-05-24T10:00:00Z"
  },
  "recentEvents": [
    {
      "timestamp": "2026-05-24T10:00:00Z",
      "actor": "dev@company.com",
      "type": "kubectl-exec",
      "description": "kubectl exec on pods/payments-api",
      "workflow": "deploy"
    }
  ],
  "sources": {
    "kubernetesAuditLog": true,
    "github": false,
    "jira": false
  }
}
```

---

## Troubleshooting

### HEALERT tab does not appear

- Verify the plugin is added to `EntityPage.tsx`
- Restart Backstage after adding the route
- Check browser console for import errors

### "Healert backend is not reachable"

- Verify the backend is running: `./healert.sh start backend`
- Check the proxy target URL in `app-config.yaml`
- Verify the backend binds to the correct address

### "Healert agent is not running"

- Start the agent: `./healert.sh start`
- For DaemonSet: `./healert.sh start kubernetes`
- Verify agent logs: `./healert.sh logs`

### Score is always 0 after triggering events

- Verify audit logging is enabled on your cluster
- Check agent logs for send errors: `./healert.sh logs`
- Verify `ENTITY_NAMESPACE` matches your Backstage catalog namespace
- Check backend is listening on `0.0.0.0` for DaemonSet mode

---

## Related

| Resource             | Link                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| Healert Agent        | [github.com/healert-io/agent](https://github.com/healert-io/agent)                |
| Healert Backend      | [github.com/healert-io/backend](https://github.com/healert-io/backend)            |
| Healert Organization | [github.com/healert-io](https://github.com/healert-io)                            |
| Issue Tracker        | [community-plugins/issues](https://github.com/backstage/community-plugins/issues) |

---

## License

Apache License 2.0 — Copyright 2026 Healert OÜ

See [LICENSE](../../LICENSE) for the full license text.
