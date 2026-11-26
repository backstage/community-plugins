# @backstage-community/plugin-catalog-backend-module-mcp-capabilities

Opt-in catalog module that **enriches** native `API` / `spec.type: mcp-server`
entities with a discovered summary — capabilities, tool/resource/prompt counts,
server identity, and a flat list of tool names (so entities are searchable by
tool). Add it only if you want that summary persisted onto entities; the live
[`/spec` endpoint](../mcp-capabilities-backend/README.md) works without it.

> **⚠️ Catalog processing impact.** This module registers a catalog
> **processor** that opens a network connection to each `mcp-server` entity's
> remote **during catalog processing**. Discovery runs inside the catalog's
> shared processing worker pool, so a slow or unreachable MCP server ties up a
> worker until it times out (15s), which can delay processing and stitching for
> **all** entities — not just MCP ones. Results are cached per remote (default
> 10 min TTL) and failures are skipped gracefully, but on a large catalog with
> many or slow MCP servers, weigh this before enabling. See documentation on
> [The life of an entity](https://backstage.io/docs/features/software-catalog/life-of-an-entity).

> **Alpha API.** Enrichment relies on the **Alpha** [catalog model layer system](https://backstage.io/docs/releases/v1.50.0/#catalog-model-layer-system-alpha-opt-in), which is opt-in and may change in a minor release.

## Installation

```sh
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-mcp-capabilities
```

Enrichment extends the native `mcp-server` API kind, so register the upstream
`mcpServerApiEntityModel` layer (see the
[backend plugin README](../mcp-capabilities-backend/README.md)), then add the
module:

```ts
// packages/backend/src/index.ts
import { provideStaticCatalogModel } from '@backstage/plugin-catalog-node/alpha';
import { mcpServerApiEntityModel } from '@backstage/catalog-model/alpha';

// If your app already calls provideStaticCatalogModel, add mcpServerApiEntityModel
// to that single call instead of adding a second one.
backend.add(provideStaticCatalogModel({ layers: [mcpServerApiEntityModel] }));
backend.add(
  import('@backstage-community/plugin-catalog-backend-module-mcp-capabilities'),
);
```

The module registers the enrichment processor **and** the enrichment model layer
(as its own model source, so it composes cleanly with your app's static catalog
model) — no manual enrichment-layer wiring is required.

## Configuration

All optional:

```yaml
mcpCapabilities:
  enrichment:
    # How long a server's discovery result is cached before re-fetching.
    ttlMinutes: 10
    # 'summary' (default): capabilities, counts, server identity, tool names.
    # 'names': tool names + counts only — smaller entities, still searchable.
    fields: summary
```

## What it adds to entities

The optional `spec` fields defined by
[`@backstage-community/plugin-mcp-capabilities-common`](../mcp-capabilities-common/README.md)
— `capabilities`, `toolCount` / `resourceCount` / `promptCount`, `serverInfo`,
`instructions`, and `toolNames`. Tool _detail_ (input schemas etc.) is
intentionally **not** persisted; it is served live by the `/spec` router.

## Exports

- default — the `catalogModuleMcpCapabilities` backend module

## Credits

Made at [EPAM](https://www.epam.com), with love for the community. ❤️
