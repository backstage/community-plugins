# @backstage-community/plugin-mcp-capabilities-backend

Backend for the MCP Capabilities suite. It connects to the MCP servers described
by native `API` / `spec.type: mcp-server` catalog entities (reading their
`spec.remotes[].url`) and exposes what they offer.

Two parts, both reading `spec.remotes` off the catalog entity (no duplicate
config):

1. **Catalog module** (`catalogModuleMcpCapabilities`) — a processor that writes a
   discovered summary (capabilities, counts, `serverInfo`, and a flat list of tool
   names for catalog search) onto each `mcp-server` entity. Failures are skipped
   gracefully, so an unreachable server never fails catalog ingestion.
2. **Backend plugin** — an on-demand router,
   `GET /api/mcp-capabilities/spec?entityRef=<ref>`, returning the full live
   tool / resource / prompt detail for the Capabilities tab.

The MCP client speaks the streamable-http transport with the JSON-RPC handshake
(`initialize` → `notifications/initialized` → capability-gated
`tools/list` / `resources/list` / `prompts/list`), is SSE-aware, and handles the
`Mcp-Session-Id` header.

## Installation

```sh
yarn --cwd packages/backend add @backstage-community/plugin-mcp-capabilities-backend
```

```ts
// packages/backend/src/index.ts
import { provideStaticCatalogModel } from '@backstage/plugin-catalog-node/alpha';
import { mcpServerApiEntityModel } from '@backstage/catalog-model/alpha';
import { mcpServerEnrichmentModelLayer } from '@backstage-community/plugin-mcp-capabilities-common';
import { catalogModuleMcpCapabilities } from '@backstage-community/plugin-mcp-capabilities-backend';

const backend = createBackend();

// Native mcp-server kind + the additive enrichment model layer
backend.add(
  provideStaticCatalogModel({
    layers: [mcpServerApiEntityModel, mcpServerEnrichmentModelLayer],
  }),
);

// Discovery: enrichment processor + on-demand /spec router
backend.add(import('@backstage-community/plugin-mcp-capabilities-backend'));
backend.add(catalogModuleMcpCapabilities);

backend.start();
```

Register some native `mcp-server` entities, e.g.:

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: aws-docs
spec:
  type: mcp-server
  lifecycle: production
  owner: group:default/guests
  remotes:
    - type: streamable-http
      url: https://your-mcp-server.example.com/mcp
```

Verify:

```sh
curl 'http://localhost:7007/api/mcp-capabilities/spec?entityRef=api:default/aws-docs'
```

## Known limitation

Remotes requiring per-request auth (e.g. AWS Bedrock AgentCore Gateway, SigV4)
are not yet signed — discovery skips them gracefully, and `/spec` returns an error
for them. Per-remote auth is a planned enhancement.

## Development

`yarn start` in this directory runs the plugin standalone (see [`/dev`](./dev)).

## Exports

- default — the backend plugin (mounts the `/spec` router)
- `catalogModuleMcpCapabilities` — the enrichment catalog module
