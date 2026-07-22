# @backstage-community/plugin-mcp-capabilities-common

Shared types and the **schema-extension catalog model layer** for the MCP
Capabilities suite. Isomorphic — safe to import from both the frontend and
backend packages.

It does **not** introduce a new entity kind. Instead it _extends_ the upstream
native `API` / `spec.type: 'mcp-server'` schema additively, using the catalog
model `updateKind` operation (deep-merged onto the existing version), so native
entities keep validating whether or not they've been enriched.

## What it adds to `mcp-server` entities

Optional `spec` fields, populated by the backend's discovery processor:

- `spec.capabilities` — `{ tools, resources, prompts }` booleans
- `spec.toolCount` / `spec.resourceCount` / `spec.promptCount`
- `spec.serverInfo` — `{ name, version }` from the MCP handshake
- `spec.instructions` — optional server instructions
- `spec.toolNames` — flat list of tool names (enables catalog search by tool)

## Usage

Register the model layer alongside the native kind in your backend:

```ts
import { provideStaticCatalogModel } from '@backstage/plugin-catalog-node/alpha';
import { mcpServerApiEntityModel } from '@backstage/catalog-model/alpha';
import { mcpServerEnrichmentModelLayer } from '@backstage-community/plugin-mcp-capabilities-common';

backend.add(
  provideStaticCatalogModel({
    layers: [mcpServerApiEntityModel, mcpServerEnrichmentModelLayer],
  }),
);
```

## Exports

- `mcpServerEnrichmentModelLayer` — the schema-extension catalog model layer
- Types: `MCPToolInfo`, `MCPResourceInfo`, `MCPPromptInfo`, `MCPServerInfo`,
  `MCPServerSpec`, `MCPServerEnrichmentSpec`, `MCPCapabilities`,
  `MCPToolAnnotations`

## Credits

Made at [EPAM](https://www.epam.com), with love for the community. ❤️
