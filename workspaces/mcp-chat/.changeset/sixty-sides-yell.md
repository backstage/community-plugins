---
'@backstage-community/plugin-mcp-chat-backend': minor
'@backstage-community/plugin-mcp-chat-common': minor
'@backstage-community/plugin-mcp-chat-node': minor
'@backstage-community/plugin-mcp-chat': minor
---

Introduce shared libraries and extension points for future isolation of LLM providers in dedicated backend modules.

This change also updates the public API surface for provider-related base classes/types and shared MCP chat types:

- Move provider base classes and provider-related Node/backend integration types out of `@backstage-community/plugin-mcp-chat-backend` into `@backstage-community/plugin-mcp-chat-node`.
- Move shared/common MCP chat types out of `@backstage-community/plugin-mcp-chat-backend` into `@backstage-community/plugin-mcp-chat-common`.
- Consumers importing these APIs from `@backstage-community/plugin-mcp-chat-backend` should update their import paths to the new packages above.

No functional behavior is changed, but downstream consumers may need to update imports to compile against the new package structure.
