# @backstage-community/plugin-mcp-capabilities-common

Shared types and the **schema-extension catalog model layer** for the MCP
Capabilities suite. Isomorphic — safe to import from both the frontend and
backend packages.

It does **not** introduce a new entity kind. Instead it _extends_ the upstream
native `API` / `spec.type: 'mcp-server'` schema additively, using the catalog
model `updateKind` operation (deep-merged onto the existing version), so native
entities keep validating whether or not they've been enriched.

> **Alpha API.** The model layer builds on the **Alpha** [catalog model layer system](https://backstage.io/docs/releases/v1.50.0/#catalog-model-layer-system-alpha-opt-in) — opt-in and may change in a minor release.

## What it adds to `mcp-server` entities

Optional `spec` fields, populated by the catalog module's discovery processor:

- `spec.capabilities` — `{ tools, resources, prompts }` booleans
- `spec.toolCount` / `spec.resourceCount` / `spec.promptCount`
- `spec.serverInfo` — `{ name, version }` from the MCP handshake
- `spec.instructions` — optional server instructions
- `spec.toolNames` — flat list of tool names (enables catalog search by tool)

## Usage

You don't register anything from this package directly — installing the
[catalog module](../catalog-backend-module-mcp-capabilities/README.md) registers
the model layer and runs discovery. This package just provides the shared types,
the model layer, and the discovery helpers those plugins build on.

## Exports

- `mcpServerEnrichmentModelLayer` — the schema-extension catalog model layer
- Discovery (used by the backend consumers): `discoverFromClient`,
  `McpDiscoveryClient` — the shared capability-gating + mapping over a connected
  MCP client
- Remote helpers: `selectMcpServerRemote`, `parseMcpRemoteUrl`
- Types: `MCPToolInfo`, `MCPResourceInfo`, `MCPPromptInfo`, `MCPServerInfo`,
  `MCPServerSpec`, `MCPServerEnrichmentSpec`, `MCPCapabilities`,
  `MCPToolAnnotations`, `McpServerRemote`

## Credits

Made at [EPAM](https://www.epam.com), with love for the community. ❤️
