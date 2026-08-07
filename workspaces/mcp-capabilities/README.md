# MCP Capabilities for Backstage

Plugins that enrich native MCP server catalog entities (`kind: API`,
`spec.type: mcp-server`) with their live **capabilities** — the tools,
resources, and prompts each server exposes.

## Plugins

- [mcp-capabilities](./plugins/mcp-capabilities/README.md) — frontend (new
  frontend system, [Backstage UI](https://backstage.io/docs/getting-started/ui)):
  an overview card and a **Capabilities** tab on the entity page.
- [mcp-capabilities-backend](./plugins/mcp-capabilities-backend/README.md) —
  backend: serves live tool/resource/prompt detail on demand (`/spec`).
- [catalog-backend-module-mcp-capabilities](./plugins/catalog-backend-module-mcp-capabilities/README.md)
  — **opt-in** catalog module: enriches `mcp-server` entities with a searchable
  summary (capabilities, counts, tool names) and registers the model layer.
- [mcp-capabilities-common](./plugins/mcp-capabilities-common/README.md) — shared
  types, discovery mappers, and the schema-extension catalog model layer.

## How it works

Each `mcp-server` API entity declares its endpoint in `spec.remotes`. The backend
connects over the MCP streamable-http transport to discover what the server
exposes, via two independent mechanisms:

- an on-demand endpoint, `GET /api/mcp-capabilities/spec?entityRef=…` (the backend
  plugin), returns the full live tool/resource/prompt detail — powering the
  Capabilities tab;
- a catalog **processor** (the opt-in catalog module) writes a summary
  (capabilities, counts, and tool names) onto the entity — powering the
  overview card and catalog search.

The common package's catalog model layer **extends** the native `mcp-server`
schema additively (via `updateKind`), so entities that haven't been enriched yet
remain valid.

> **Alpha API.** Enrichment relies on the **Alpha** [catalog model layer system](https://backstage.io/docs/releases/v1.50.0/#catalog-model-layer-system-alpha-opt-in) — opt-in and subject to change.

> **Frontend system:** these plugins target the **new** Backstage frontend
> system. Legacy-frontend-system support is a planned follow-up.

## Installation

Add the pieces you need (each package README has the exact snippets):

1. **Native `mcp-server` kind** (prerequisite) — register `mcpServerApiEntityModel`
   in your backend's `provideStaticCatalogModel`, or `mcp-server` entities won't
   validate. See the [backend README](./plugins/mcp-capabilities-backend/README.md).
2. **[Backend](./plugins/mcp-capabilities-backend/README.md)** (`plugin-mcp-capabilities-backend`)
   — the live `/spec` endpoint powering the Capabilities tab.
3. **[Catalog module](./plugins/catalog-backend-module-mcp-capabilities/README.md)**
   (`plugin-catalog-backend-module-mcp-capabilities`, opt-in) — persists a
   searchable summary onto entities.
4. **[Frontend](./plugins/mcp-capabilities/README.md)** (`plugin-mcp-capabilities`)
   — the overview card + Capabilities tab.

## Local development

```sh
yarn install
yarn start
```

## Credits

Made at [EPAM](https://www.epam.com), with love for the community. ❤️
