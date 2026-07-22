---
'@backstage-community/plugin-mcp-capabilities': minor
'@backstage-community/plugin-mcp-capabilities-backend': minor
'@backstage-community/plugin-mcp-capabilities-common': minor
---

Introduce the MCP Capabilities plugins for native `API` / `spec.type: mcp-server` catalog entities.

- **Backend**: connects to each MCP server (streamable-http) to discover its tools, resources, and prompts. A catalog processor enriches the entity with a summary (capabilities, counts, and tool names for search), and an on-demand endpoint serves the full live detail.
- **Frontend** (new frontend system, Backstage UI): an overview card with the server's identity and capabilities, and a "Capabilities" tab listing tools, resources, and prompts.
- **Common**: shared types and a catalog model layer that additively extends the native `mcp-server` schema (existing entities remain valid).
