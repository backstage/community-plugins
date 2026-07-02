# Argo Workflows Backend plugin for Backstage

Backend plugin that proxies requests from the Backstage frontend to one or more Argo Workflows server instances. It handles authentication, label selector validation, and response parsing.

## Installation

```console
yarn workspace backend add @backstage-community/plugin-argo-workflows-backend
```

## Configuration

Add the following to your `app-config.yaml`:

```yaml
argoWorkflows:
  defaultInstance: main
  instances:
    - name: main
      baseUrl: https://argo.example.com
      token: ${ARGO_WORKFLOWS_TOKEN}
```

| Field                 | Required | Description                                                          |
| --------------------- | -------- | -------------------------------------------------------------------- |
| `defaultInstance`     | No       | Name of the default instance when no instance name is specified.     |
| `instances[].name`    | Yes      | Unique identifier for this Argo Workflows server.                    |
| `instances[].baseUrl` | Yes      | Base URL of the Argo Workflows API.                                  |
| `instances[].token`   | Yes      | Bearer token for API authentication. Marked as `@visibility secret`. |

### Multiple instances

You can configure multiple Argo Workflows instances and reference them by name in entity annotations:

```yaml
argoWorkflows:
  defaultInstance: production
  instances:
    - name: production
      baseUrl: https://argo-prod.example.com
      token: ${ARGO_PROD_TOKEN}
    - name: staging
      baseUrl: https://argo-staging.example.com
      token: ${ARGO_STAGING_TOKEN}
```

## New Backend System

The plugin is compatible with the Backstage new backend system. Register it in your backend:

```ts
// packages/backend/src/index.ts
const backend = createBackend();
backend.add(import('@backstage-community/plugin-argo-workflows-backend'));
backend.start();
```

## Legacy Backend System

For the legacy backend system, use the `createRouter` export:

```ts
import { createRouter } from '@backstage-community/plugin-argo-workflows-backend';

const router = await createRouter({
  config: env.config,
  logger: env.logger,
  httpAuth: env.httpAuth,
});
apiRouter.use('/argo-workflows', router);
```

## API Routes

| Method | Path                          | Description                                                                               |
| ------ | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `GET`  | `/workflows`                  | List workflows filtered by label selector. Query params: `labelSelector`, `instanceName`. |
| `GET`  | `/workflows/:namespace/:name` | Get a single workflow by namespace and name. Query param: `instanceName`.                 |

## Configuration Schema

The configuration schema is defined in [`config.d.ts`](./config.d.ts) and validated automatically by Backstage.
