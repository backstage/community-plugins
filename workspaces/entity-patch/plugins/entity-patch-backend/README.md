# @backstage-community/plugin-entity-patch-backend

The backend plugin for entity-patch. Provides the REST API that the frontend uses to store and retrieve patch data per entity, and triggers a catalog entity refresh after each save so the catalog processor picks up changes immediately.

> **See also** — the catalog processor that reads these patches and applies them to entities lives in [`@backstage-community/plugin-catalog-backend-module-entity-patch`](../catalog-backend-module-entity-patch/README.md).

---

## Responsibilities

- **Store patch data** — keeps a per-entity, per-patch key-value store (SQLite / PostgreSQL via Knex).
- **Serve patch data** — exposes an HTTP endpoint that the catalog processor polls using HTTP conditional requests (`ETag` / `If-None-Match`) to avoid redundant processing.
- **Fill-from-entity** — on request, reads the current catalog entity and pre-populates form values from it (scalar fields and existing catalog relations), so the dialog opens with the current state rather than blank.
- **Trigger catalog refresh** — after each successful save, calls `catalogClient.refreshEntity` so the processor re-runs immediately without waiting for the next scheduled loop.

---

## Installation

```sh
yarn add @backstage-community/plugin-entity-patch-backend
```

Register the plugin in your backend:

```ts
// packages/backend/src/index.ts
const backend = createBackend();

// ... other plugins
backend.add(import('@backstage-community/plugin-entity-patch-backend'));

backend.start();
```

The plugin uses the default Backstage database and auth services — no additional wiring is needed.

---

## API endpoints

All endpoints are mounted under `/api/entity-patch`.

| Method | Path                                            | Description                                                                                                                         |
| ------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/values/:namespace/:kind/:name`                | Returns the raw stored patch data for an entity (used by the processor). Supports `ETag` / `If-None-Match` for conditional caching. |
| `GET`  | `/values/:namespace/:kind/:name?fillFromEntity` | Returns patch data pre-populated from the live catalog entity (used by the frontend on dialog open).                                |
| `POST` | `/patches/:namespace/:kind/:name`               | Saves a patch section for an entity and triggers a catalog refresh. Body: `{ patchName, data }`.                                    |

---

## Configuration

No plugin-specific configuration is required. The patch schema and mapping are configured in `app-config.yaml` under `entityPatch.patches` — see the [frontend plugin README](../entity-patch/README.md) for the full configuration reference.

---

## Local development

```sh
yarn start
```

Starts both the frontend and backend together. The backend runs at `http://localhost:7007`.
