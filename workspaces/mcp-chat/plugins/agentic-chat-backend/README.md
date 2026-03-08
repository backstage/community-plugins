# Agentic Chat Backend

Backend plugin for Agentic Chat - a RAG-powered documentation assistant using Llama Stack's Responses API.

## Features

- **Config-Driven Ingestion**: Documents are automatically synced from configured sources
- **Multiple Sources**: Support for local directories, URLs, and GitHub repositories
- **Llama Stack Integration**: Uses Llama Stack's OpenAI-compatible APIs
- **File Search (RAG)**: Built-in support for Responses API's `file_search` tool
- **Periodic Sync**: Optional scheduled re-sync to keep documents up-to-date
- **Status Monitoring**: Health checks for provider and vector store connections
- **3 Security Modes**: Flexible authentication (`none`, `plugin-only`, `full`)
- **MCP Server Integration**: Connect to MCP servers for extended tool capabilities

## Installation

```bash
yarn --cwd packages/backend add @backstage-community/plugin-agentic-chat-backend
```

```ts
// In packages/backend/src/index.ts
const backend = createBackend();
backend.add(import('@backstage-community/plugin-agentic-chat-backend'));
```

## Configuration

```yaml
agenticChat:
  # =============================================================================
  # SECURITY - 3 Modes Available (see docs/SECURITY_MODES.md for details)
  # =============================================================================
  security:
    mode: 'plugin-only' # Options: 'none' | 'plugin-only' | 'full'
    # For 'full' mode, add mcpOAuth config for MCP server authentication

  llamaStack:
    baseUrl: 'https://your-llama-stack-server.com'
    vectorStoreId: 'your-vector-store-id'
    model: 'gemini/gemini-2.5-flash'
    chunkingStrategy: 'static'
    maxChunkSizeTokens: 200
    chunkOverlapTokens: 50
    skipTlsVerify: true # For self-signed certs

  # Document sources for automatic ingestion
  documents:
    syncMode: full # 'full' or 'append'
    syncSchedule: '1h' # Optional: periodic sync
    sources:
      # Local directory
      - type: directory
        path: ./docs/knowledge-base
        patterns:
          - '**/*.md'
          - '**/*.yaml'

      # URLs
      - type: url
        urls:
          - https://example.com/docs/guide.md

      # GitHub repository
      - type: github
        repo: 'org/documentation'
        branch: main
        path: docs/
        patterns:
          - '*.md'
        token: ${GITHUB_TOKEN}

  # MCP Servers for extended tool capabilities
  mcpServers:
    - id: openshift-server
      name: OpenShift MCP Server
      type: streamable-http # or 'sse'
      url: 'https://mcp-server.example.com/mcp'
      requireApproval: 'never' # or 'always' or { always: [...], never: [...] }
```

## Document Sources

### Directory Source

Fetch documents from a local directory:

```yaml
- type: directory
  path: ./docs/knowledge-base # Relative to Backstage root
  patterns:
    - '**/*.md'
    - '**/*.yaml'
    - '**/*.json'
```

### URL Source

Fetch documents from URLs:

```yaml
- type: url
  urls:
    - https://raw.githubusercontent.com/org/repo/main/README.md
    - https://internal-wiki.example.com/api/export/runbooks.md
  headers:
    Authorization: 'Bearer ${API_TOKEN}'
```

### GitHub Source

Fetch documents from a GitHub repository:

```yaml
- type: github
  repo: 'your-org/documentation'
  branch: main
  path: docs/ # Optional: subdirectory
  patterns:
    - '**/*.md'
  token: ${GITHUB_TOKEN} # Required for private repos
```

## Sync Behavior

- **On Startup**: Documents are synced immediately when the plugin starts
- **Periodic Sync**: If `syncSchedule` is set, documents are re-synced at the specified interval
- **Sync Modes**:
  - `append`: Only add new documents, never remove
  - `full`: Add new documents and remove documents no longer in sources

## API Reference

### POST /chat

Send a chat message with optional RAG.

**Request:**

```json
{
  "messages": [{ "role": "user", "content": "What is the architecture?" }],
  "enableRAG": true
}
```

**Response:**

```json
{
  "role": "assistant",
  "content": "Based on the documentation...",
  "filesSearched": ["architecture.md"]
}
```

### GET /documents

List all documents in the knowledge base (read-only).

### POST /sync

Trigger a manual document sync from configured sources.

### GET /status

Get the status of the service (provider, vector store, MCP servers).

## License

Apache-2.0
