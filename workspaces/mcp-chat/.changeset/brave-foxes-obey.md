---
'@backstage-community/plugin-mcp-chat-backend': minor
---

Added configurable path overrides for the inference and models endpoints used by REST-based providers.

This makes it possible to adapt provider requests to servers that expose APIs under custom relative paths instead of the previously hardcoded defaults
by using the config object `pathOverrides`.
