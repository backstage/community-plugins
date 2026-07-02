# MCP Capabilities for Backstage

Plugins that enrich native MCP server catalog entities (`kind: API`,
`spec.type: mcp-server`) with their live **capabilities** — the tools,
resources, and prompts each server exposes.

## Plugins

- [mcp-capabilities](./plugins/mcp-capabilities/README.md) — frontend (new
  frontend system, [Backstage UI](https://backstage.io/docs/getting-started/ui)):
  an overview card and a **Capabilities** tab on the entity page.
- [mcp-capabilities-backend](./plugins/mcp-capabilities-backend/README.md) —
  backend: connects to each MCP server, enriches its catalog entity, and serves
  live tool/resource/prompt detail.
- [mcp-capabilities-common](./plugins/mcp-capabilities-common/README.md) — shared
  types and the schema-extension catalog model layer.

## How it works

Each `mcp-server` API entity declares its endpoint in `spec.remotes`. The backend
connects over the MCP streamable-http transport to discover what the server
exposes:

- a catalog **processor** writes a summary (capabilities, counts, and tool names
  for search) onto the entity — powering the overview card and catalog search;
- an on-demand endpoint, `GET /api/mcp-capabilities/spec?entityRef=…`, returns the
  full live tool/resource/prompt detail — powering the Capabilities tab.

The common package's catalog model layer **extends** the native `mcp-server`
schema additively (via `updateKind`), so entities that haven't been enriched yet
remain valid.

> **Frontend system:** these plugins target the **new** Backstage frontend
> system. Legacy-frontend-system support is a planned follow-up.

## Local development

```sh
yarn install
yarn start
```

## Credits

Made at [EPAM](https://www.epam.com), with love for the community. ❤️
