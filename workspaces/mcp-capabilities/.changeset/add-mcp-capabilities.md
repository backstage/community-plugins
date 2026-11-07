---
'@backstage-community/plugin-mcp-capabilities': minor
'@backstage-community/plugin-mcp-capabilities-backend': minor
'@backstage-community/plugin-catalog-backend-module-mcp-capabilities': minor
'@backstage-community/plugin-mcp-capabilities-common': minor
---

Introduce the MCP Capabilities plugins for native `API` / `spec.type: mcp-server` catalog entities.

- **Backend plugin**: an on-demand endpoint that connects to an MCP server (streamable-http) and returns its full live tools, resources, and prompts — powering the Capabilities tab. The endpoint is authenticated (accepts user and service credentials).
- **Catalog module** (opt-in): a processor that enriches `mcp-server` entities with a searchable summary (capabilities, counts, and tool names), plus the catalog model extension that lets those fields validate. Enrichment scope and cache TTL are configurable. Note that enrichment discovery runs during catalog processing — see the module README before enabling it on a large catalog.
- **Frontend** (new frontend system, Backstage UI): an overview card with the server's identity and capabilities, and a "Capabilities" tab listing tools, resources, and prompts.
- **Common**: shared types, discovery mappers, and a catalog model layer that additively extends the native `mcp-server` schema (existing entities remain valid).
