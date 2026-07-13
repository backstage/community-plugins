# Akeyless plugin for Backstage

The [Akeyless](https://www.akeyless.io) Backstage plugin connects catalog entities to secrets and other items stored in Akeyless. Annotate a Component with an Akeyless path and Backstage lists matching items with links to the Akeyless Console.

When CRUD is enabled, **static secrets** can also be viewed, created, updated, and deleted from Backstage. Dynamic secrets, rotated secrets, certificates, and other item types remain Console-only.

## Plugins

| Package                                                                              | Role                                                |
| ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| [@backstage-community/plugin-akeyless](./plugins/akeyless/README.md)                 | Frontend — entity overview card and Development tab |
| [@backstage-community/plugin-akeyless-backend](./plugins/akeyless-backend/README.md) | Backend — list API and optional static-secret CRUD  |

## Quick start

### 1. Install the backend

```bash
yarn --cwd packages/backend add @backstage-community/plugin-akeyless-backend
```

```typescript
// packages/backend/src/index.ts
backend.add(import('@backstage-community/plugin-akeyless-backend'));
```

### 2. Configure Akeyless

Add credentials and gateway settings to `app-config.yaml`. See [backend configuration examples](./plugins/akeyless-backend/README.md#configuration-examples).

```yaml
akeyless:
  deploymentProfile: saas
  gatewayUrl: https://api.akeyless.io
  consoleUrl: https://console.akeyless.io
  authentication:
    method: accessKey
    accessKey:
      accessId: ${AKEYLESS_ACCESS_ID}
      accessKey: ${AKEYLESS_ACCESS_KEY}
```

Verify the backend is reachable:

```bash
curl http://localhost:7007/api/akeyless/health
# {"status":"ok","allowCrud":true}
```

### 3. Install the frontend

```bash
yarn --cwd packages/app add @backstage-community/plugin-akeyless
```

**New frontend system (Backstage 1.51+):** register the alpha plugin in `App.tsx`. It automatically adds an overview card and a **Development → Akeyless** tab for annotated entities.

```tsx
import akeylessPlugin from '@backstage-community/plugin-akeyless/alpha';

export default createApp({
  features: [catalogPlugin, akeylessPlugin],
});
```

**Classic frontend system:** register `akeylessPlugin` and add `EntityAkeylessCard` to your entity page. See the [frontend README](./plugins/akeyless/README.md).

### 4. Annotate catalog entities

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    akeyless.io/secrets-path: /my-team/my-service/prod
```

Open the entity in Backstage — the Akeyless card appears on **Overview** (new frontend system) or wherever you mounted the card (classic), and the full table is also available under **Development → Akeyless**.

## Catalog annotations

| Annotation                 | Required | Description                                                                                                            |
| -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `akeyless.io/secrets-path` | Yes      | Akeyless path to list items from. Comma-separated paths are supported.                                                 |
| `akeyless.io/secret-types` | No       | Comma-separated item types to include. Defaults to `static-secret`, `dynamic-secret`, `rotated-secret`, `certificate`. |
| `akeyless.io/allow-crud`   | No       | Set to `"false"` to hide in-Backstage CRUD controls for this entity. Defaults to enabled.                              |

[Full annotation examples](./plugins/akeyless/README.md#catalog-integration) including multiple paths and list-only mode.

## Features

- List Akeyless items under catalog-annotated paths (recursive folder listing)
- Deep links to view or manage items in the Akeyless Console
- Optional CRUD for static secrets (create, read value, update value, delete)
- Path scoping — CRUD operations are limited to the entity's annotated path
- Global or per-entity CRUD disable via config and annotations

## Permissions

The Akeyless credential configured in `app-config.yaml` is shared by the Backstage backend. Grant it only the Akeyless permissions your organization allows Backstage to perform:

| Mode                           | Typical Akeyless permissions                                          |
| ------------------------------ | --------------------------------------------------------------------- |
| List only (`allowCrud: false`) | Read/list on the annotated paths                                      |
| CRUD enabled (default)         | Read/list plus create/update/delete for static secrets on those paths |

Backstage users who can open an entity page can trigger these operations through the plugin. Use `akeyless.allowCrud: false` and/or `akeyless.io/allow-crud: "false"` when you want discovery and Console links without in-app secret management.

## Developing this workspace

Requires Node.js 22 or 24.

```sh
yarn install
export AKEYLESS_ACCESS_ID=...
export AKEYLESS_ACCESS_KEY=...
yarn start
```

Sign in as **Guest**, then open a catalog entity that has `akeyless.io/secrets-path` (see [examples/entities.yaml](./examples/entities.yaml)).

Run a single plugin in isolation:

```sh
yarn workspace @backstage-community/plugin-akeyless start
yarn workspace @backstage-community/plugin-akeyless-backend start
```

## Troubleshooting

| Symptom                                                                              | Likely cause                                                                                 |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `GET /api/akeyless/health` returns `{"status":"disabled","reason":"missing config"}` | `akeyless` block missing from `app-config.yaml`                                              |
| Empty table / 404 from frontend                                                      | Backend plugin not installed or backend not running                                          |
| Card shows "Missing annotation"                                                      | Entity lacks `akeyless.io/secrets-path`                                                      |
| CRUD buttons hidden                                                                  | `akeyless.allowCrud: false` in config and/or `akeyless.io/allow-crud: "false"` on the entity |
| Create/update/delete fails with path error                                           | Secret path is outside the entity's annotated `contextPath` scope                            |
