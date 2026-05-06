# @backstage-community/plugin-mcp-chat-backend

## 0.10.0

### Minor Changes

- 8db17fe: Added support for max_tokens and temperature customization
- 371fbad: Implement tool-level filtering using plugin configuration
- 2cb7b1b: Add support for configuring MCP tool call timeout
- 8db17fe: Added support for O-series and GPT-5 models

### Patch Changes

- 371fbad: Remove allowedTools from public MCPServerConfig API surface and improve disabledTools validation

## 0.9.0

### Minor Changes

- 81aead2: Backstage version bump to v1.50.2

## 0.8.0

### Minor Changes

- 1b22981: Migrating away from deprecated @google/generative-ai npm package to new @google/genai for gemini provider
- a81325a: Added support for debugging LLM calls
- 3e01b82: Backstage version bump to v1.49.2

  Updated `uuid` and `@types/uuid` to ^11.0.0, `@backstage/plugin-catalog-node` to ^2.1.0, and deduplicated yarn.lock

## 0.7.0

### Minor Changes

- 158dbf4: Backstage version bump to v1.48.5

### Patch Changes

- 8a6b81c: Updated dependency `@types/supertest` to `^7.0.0`.

## 0.6.1

### Patch Changes

- a4dddac: enable knip report

## 0.6.0

### Minor Changes

- 207781a: ### Added Conversation History Feature

  - **Conversation Persistence**: Chat sessions are automatically saved for authenticated users
  - **Starring**: Mark important conversations as favorites for quick access
  - **Search**: Filter conversations by title using client-side search
  - **Delete**: Remove individual conversations or clear all history
  - **AI-Generated Titles**: Conversations get auto-generated titles using the LLM (with fallback to first message)

  ### Backend Improvements

  - Refactored router into domain-specific modules (status, chat, conversations) for better maintainability
  - Added authentication and validation middleware
  - New API endpoints for conversation management (list, get, delete, star, update title)
  - Added `ChatConversationStore` and `SummarizationService` to public exports
  - Comprehensive unit tests for `ChatConversationStore`

  ### Configuration Options

  New `conversationHistory` config section with `displayLimit`, `autoSummarize`, and `summarizeTimeout` options.

  ### Notes

  - Guest users (`user:development/guest`) do not have conversations saved
  - Conversations stored in `mcp_chat_conversations` database table with automatic migrations

## 0.5.0

### Minor Changes

- c330b2c: **BREAKING**: Removed SSE (Server-Sent Events) transport support

  The deprecated `SSEClientTransport` has been removed in favor of `StreamableHTTPClientTransport`, which is the modern MCP standard.

  **Migration:**

  If you had MCP servers configured with `type: sse`, update your configuration:

  ```yaml
  # Before (no longer supported)
  mcpServers:
    - id: my-server
      name: My Server
      type: sse
      url: 'http://example.com/sse'

  # After
  mcpServers:
    - id: my-server
      name: My Server
      url: 'http://example.com/mcp'  # type is auto-detected when url is present
  ```

  **Changes:**

  - Removed `MCPServerType.SSE` enum value from both frontend and backend
  - Removed SSE transport fallback logic from `MCPClientServiceImpl`
  - Updated configuration schema to only accept `stdio` and `streamable-http` types
  - HTTP servers are now auto-detected when a `url` field is present

### Patch Changes

- 6d3ed24: Updated dependency `supertest` to `^7.0.0`.

## 0.4.1

### Patch Changes

- 0cd7a1d: Bump @modelcontextprotocol/sdk to v1.24.0 [security]

  The mcp-chat plugin is not affected since it does not start a MCP server. It uses the SDK to communicate to other servers.

  The Model Context Protocol (MCP) TypeScript SDK also does not enable DNS rebinding protection by default.

  References: [PR 6318](https://github.com/backstage/community-plugins/pull/6318) /
  [CVE-2025-66414](https://nvd.nist.gov/vuln/detail/CVE-2025-66414) /
  [GHSA-w48q-cv73-mx4w](https://redirect.github.com/advisories/GHSA-w48q-cv73-mx4w)

- 5edddd9: Bumps express from 4.21.2 to 4.22.0
- 0cd7a1d: Bump typescript compiler to 5.4

## 0.4.0

### Minor Changes

- 4abb76c: support use as a reusable library

## 0.3.0

### Minor Changes

- 5c4b01f: Added OpenAI Responses API Support

## 0.2.1

### Patch Changes

- 3f75d42: Updated dependency `ollama` to `^0.6.0`.

## 0.2.0

### Minor Changes

- 4d353dc: Added LiteLLM provider support for unified access to 100+ LLM providers

## 0.1.1

### Patch Changes

- 95d31eb: Add support for optional baseUrl parameter in OpenAI provider for compatible endpoints (e.g., Azure OpenAI)

## 0.1.0

### Minor Changes

- 8c37936: Initial stable release
