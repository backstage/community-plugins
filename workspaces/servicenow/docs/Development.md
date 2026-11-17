# Development

This workspace is **plugin-only** (no `packages/app` / `packages/backend`). Local work uses the frontend and backend `dev/` harnesses. Install and operator setup live in [index.md](./index.md) and [Configuration.md](./Configuration.md).

## Prerequisites

- Node.js matching `engines` in `workspaces/servicenow/package.json`
- Yarn (Berry)
- From `workspaces/servicenow`: `yarn install`

A ServiceNow developer instance is required only for the **Backend** UI page and `/incidents` curl. You can request one from the [ServiceNow Developer Portal](https://developer.servicenow.com/dev.do#!/learn/learning-plans/washingtondc/new_to_servicenow/app_store_learnv2_buildmyfirstapp_washingtondc_personal_developer_instances).

## Start the harnesses

From `workspaces/servicenow`:

```bash
yarn start
```

That starts the frontend harness on http://localhost:3000 and the backend harness on http://localhost:7007.

After guest sign-in, the frontend sidebar has two pages:

- **ServiceNow (Mock)** (`/servicenow`) — fixture incidents; no backend or ServiceNow instance needed.
- **ServiceNow (Backend)** (`/servicenow-live`) — real frontend client → this workspace's backend plugin. Needs the backend harness. Needs ServiceNow credentials for real tickets.

Frontend-only: `yarn workspace @backstage-community/plugin-servicenow start` (use the Mock page).

Backend-only: `yarn workspace @backstage-community/plugin-servicenow-backend start` (do **not** pass `--config app-config.yaml`; that path is resolved from `plugins/servicenow-backend/`, not this workspace. See [backend CONTRIBUTING.md](../plugins/servicenow-backend/CONTRIBUTING.md)).

## ServiceNow instance (Backend page)

Put secrets in an untracked `app-config.local.yaml` next to [`app-config.yaml`](../app-config.yaml), or export env vars. See [Configuration.md](./Configuration.md) and [backend CONTRIBUTING.md](../plugins/servicenow-backend/CONTRIBUTING.md).

The harness entity uses the annotation `servicenow.com/entity-id: website-for-my-nice-service`. In ServiceNow, create incidents whose custom field `u_backstage_entity_id` (`Backstage entity id`) matches that value. Then open **ServiceNow (Backend)** and confirm the table lists those tickets.

## Tests

From `workspaces/servicenow`, run scoped package tests (`yarn workspace @backstage-community/plugin-servicenow test`, and the same for `-backend` / `-common`) and `yarn tsc`. Playwright is Mock-page UI smoke only; it does not prove backend or live ServiceNow connectivity.
