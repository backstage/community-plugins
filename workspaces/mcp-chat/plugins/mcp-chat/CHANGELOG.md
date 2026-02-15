# @backstage-community/plugin-mcp-chat

## 0.3.1

### Patch Changes

- a4dddac: enable knip report

## 0.3.0

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

## 0.2.0

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

## 0.1.2

### Patch Changes

- 0cd7a1d: Bump typescript compiler to 5.4

## 0.1.1

### Patch Changes

- 5c4b01f: Added OpenAI Responses API Support

## 0.1.0

### Minor Changes

- 8c37936: Initial stable release
