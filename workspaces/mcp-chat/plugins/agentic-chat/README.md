# Agentic Chat Plugin

A Backstage plugin that provides a **general-purpose RAG-powered documentation assistant** using Llama Stack's Responses API with built-in file_search capabilities.

**Agentic Chat adapts to YOUR documentation** - whether it's migration guides, API docs, runbooks, architecture decisions, or any other technical content.

## Features

- 🔍 **RAG-Powered Search**: Ask questions and get accurate answers from your documentation
- 📄 **Config-Driven Ingestion**: Documents are automatically synced from configured sources
- 🤖 **Agentic AI**: Powered by Responses API — reasons about questions, calls tools, and synthesizes answers
- 💬 **Rich Chat Interface**: Beautiful UI with markdown support and source citations
- 🔌 **MCP Integration**: Connect to MCP servers for extended tool capabilities (e.g., Kubernetes, OpenShift)
- ⚡ **Configurable Prompts**: Customize quick prompts for your specific use cases
- 💾 **Conversation History**: Persistent chat sessions with the ability to resume previous conversations
- 🔐 **3 Security Modes**: Flexible authentication from open access to full Keycloak integration

## Screenshots

### Welcome Screen

The welcome screen displays quick-action workflow cards and common tasks to help users get started quickly.

![Welcome Screen](./docs/images/welcome-screen.png)

### Chat Interface

Ask questions and receive AI-powered responses with markdown formatting, code blocks, and helpful explanations.

![Chat Interface](./docs/images/chat-response.png)

### Right Pane with Conversation History

The collapsible right pane shows conversation history, agent status, knowledge base info, and connected MCP servers.

![Right Pane](./docs/images/right-pane-expanded.png)

## Installation

### Static Plugin Installation (Standard Backstage)

#### Backend Installation

1. **Install the backend plugin**:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-agentic-chat-backend
```

2. **Add to your backend**:

```ts
// In packages/backend/src/index.ts
const backend = createBackend();
// ... other plugins
backend.add(import('@backstage-community/plugin-agentic-chat-backend'));
```

#### Frontend Installation

1. **Install the frontend plugin**:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-agentic-chat
```

2. **Add to your app**:

```tsx
// In packages/app/src/App.tsx
import { AgenticChatPage } from '@backstage-community/plugin-agentic-chat';

// Add to your routes
<Route path="/agentic-chat" element={<AgenticChatPage />} />;
```

3. **Add navigation**:

```tsx
// In packages/app/src/components/Root/Root.tsx
import { AgenticChatIcon } from '@backstage-community/plugin-agentic-chat';

// In your sidebar items
<SidebarItem icon={AgenticChatIcon} to="agentic-chat" text="Agentic Chat" />;
```

---

## Dynamic Plugin Deployment (Red Hat Developer Hub)

This section describes how to build, package, and deploy Agentic Chat as a dynamic plugin for Red Hat Developer Hub (RHDH).

### Prerequisites

- Node.js 18+ and Yarn installed
- Podman or Docker installed
- Access to a container registry (e.g., Quay.io, Docker Hub)
- `@red-hat-developer-hub/cli` package (installed via npx)

### Step 1: Install Dependencies

```bash
cd workspaces/mcp-chat
yarn install
```

### Step 2: Build the Plugins

```bash
# Build frontend plugin
cd plugins/agentic-chat
yarn build

# Build backend plugin
cd ../agentic-chat-backend
yarn build
```

### Step 3: Export as Dynamic Plugins

```bash
# Export frontend plugin
cd plugins/agentic-chat
npx @red-hat-developer-hub/cli@latest plugin export

# Export backend plugin
cd ../agentic-chat-backend
npx @red-hat-developer-hub/cli@latest plugin export
```

This creates `dist-dynamic/` directories in each plugin folder containing the dynamic plugin packages.

### Step 4: Package into OCI Image

```bash
# Create a temporary directory for packaging
rm -rf /tmp/techx-plugins
mkdir -p /tmp/techx-plugins

# Copy exported plugins
cp -r plugins/agentic-chat/dist-dynamic /tmp/techx-plugins/backstage-community-plugin-agentic-chat
cp -r plugins/agentic-chat-backend/dist-dynamic /tmp/techx-plugins/backstage-community-plugin-agentic-chat-backend

# Create metadata file
cat > /tmp/techx-plugins/index.json << 'EOF'
[
  {
    "backstage-community-plugin-agentic-chat": {
      "name": "@backstage-community/plugin-agentic-chat-dynamic",
      "version": "0.1.0",
      "description": "Frontend plugin for Agentic Chat",
      "backstage": { "role": "frontend-plugin", "pluginId": "agentic-chat", "supported-versions": "1.42.0" },
      "license": "Apache-2.0"
    }
  },
  {
    "backstage-community-plugin-agentic-chat-backend": {
      "name": "@backstage-community/plugin-agentic-chat-backend-dynamic",
      "version": "0.1.0",
      "description": "Backend plugin for Agentic Chat",
      "backstage": { "role": "backend-plugin", "pluginId": "agentic-chat", "supported-versions": "1.42.0" },
      "license": "Apache-2.0"
    }
  }
]
EOF

# Build OCI image
cd /tmp/techx-plugins
echo "FROM scratch
COPY . ." | podman build --platform linux/amd64 -t <your-registry>/<your-repo>:<tag> -f - .
```

Replace `<your-registry>/<your-repo>:<tag>` with your actual registry path, e.g., `quay.io/myorg/agentic-chat:v0.1.0`.

### Step 5: Push to Registry

```bash
# Login to your registry
podman login <your-registry> -u <username> -p <password>

# Push the image
podman push <your-registry>/<your-repo>:<tag>
```

### Step 6: Configure in RHDH

Add the following to your `dynamic-plugins.override.yaml`:

```yaml
plugins:
  # Frontend plugin
  - package: oci://<your-registry>/<your-repo>:<tag>!backstage-community-plugin-agentic-chat
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          backstage-community-plugin-agentic-chat:
            dynamicRoutes:
              - path: /agentic-chat
                importName: AgenticChatPage
            menuItems:
              agentic-chat:
                title: Agentic Chat
                icon: chat

  # Backend plugin
  - package: oci://<your-registry>/<your-repo>:<tag>!backstage-community-plugin-agentic-chat-backend
    disabled: false
```

### Step 7: Apply Changes in RHDH

```bash
# Reinstall plugins
podman compose run install-dynamic-plugins

# Restart RHDH
podman compose stop rhdh && podman compose start rhdh
```

---

## Configuration

Add the following to your `app-config.yaml`:

```yaml
agenticChat:
  # Security mode (see docs/SECURITY_MODES.md for details)
  security:
    mode: 'plugin-only' # 'none' | 'plugin-only' | 'full'

  llamaStack:
    # Base URL for the Llama Stack server
    baseUrl: 'https://your-llama-stack-server.com'
    # ID of the vector store to use for RAG
    vectorStoreId: 'your-vector-store-id'
    # Model to use for chat completions
    model: 'meta-llama/Llama-3.2-3B-Instruct'
    # Optional: Chunking strategy for file uploads
    chunkingStrategy: 'static' # or 'auto'
    maxChunkSizeTokens: 200
    chunkOverlapTokens: 50
    # Optional: API token for authentication
    # token: ${LLAMA_STACK_TOKEN}

  # Document sources for automatic ingestion
  documents:
    # Sync mode: 'full' (add new + remove deleted) or 'append' (only add new)
    syncMode: full
    # Optional: How often to sync (e.g., '1h', '30m', '1d')
    syncSchedule: '1h'

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
          - https://raw.githubusercontent.com/org/repo/main/docs/README.md

      # GitHub repository
      - type: github
        repo: 'your-org/documentation'
        branch: main
        path: docs/
        patterns:
          - '*.md'
        # token: ${GITHUB_TOKEN}  # For private repos

  # Optional: MCP servers for extended capabilities
  mcpServers:
    - id: kubernetes
      name: 'Kubernetes Tools'
      type: streamable-http
      url: 'http://localhost:8080/mcp'

  # Optional: Custom system prompt
  systemPrompt: 'You are a helpful documentation assistant...'

  # Optional: Quick prompts for common queries
  quickPrompts:
    - title: 'Search Documentation'
      description: 'Find relevant information'
      prompt: 'Search the documentation for...'
      category: Search
```

## How It Works

1. **Automatic Ingestion**: On startup, documents are fetched from configured sources (directories, URLs, GitHub repos)
2. **Chunking**: Documents are automatically chunked and indexed in the vector store
3. **Periodic Sync**: If `syncSchedule` is configured, documents are re-synced periodically
4. **RAG Search**: When you ask a question, the Responses API uses the `file_search` tool to find relevant content
5. **Answer Generation**: The LLM generates an answer based on the retrieved context
6. **Conversation Persistence**: Chat sessions are stored and can be resumed later

## UI Components

| Component                | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| **Chat Interface**       | Ask questions and get AI-powered answers with streaming responses |
| **Welcome Screen**       | Quick action cards and workflow suggestions                       |
| **Conversation History** | Browse and resume previous chat sessions                          |
| **Knowledge Base Panel** | Read-only view of indexed documents with status indicators        |
| **Agent Status Panel**   | Shows connection status for Agentic Chat Agent and MCP servers    |
| **Right Pane**           | Collapsible sidebar with conversation history and settings        |

## Prerequisites

- Backstage v1.20+ (for new backend system support)
- Llama Stack server with:
  - Files API enabled
  - Vector store created
  - Responses API with file_search tool support
- For RHDH: Red Hat Developer Hub 1.3+ with dynamic plugin support

## API Endpoints

| Endpoint                              | Method | Description                                     |
| ------------------------------------- | ------ | ----------------------------------------------- |
| `/api/agentic-chat/chat`              | POST   | Send chat messages with streaming RAG responses |
| `/api/agentic-chat/documents`         | GET    | List indexed documents (read-only)              |
| `/api/agentic-chat/conversations`     | GET    | List conversation history                       |
| `/api/agentic-chat/conversations/:id` | GET    | Get a specific conversation                     |
| `/api/agentic-chat/conversations/:id` | DELETE | Delete a conversation                           |
| `/api/agentic-chat/sync`              | POST   | Trigger manual document sync                    |
| `/api/agentic-chat/status`            | GET    | Get service and MCP server status               |

## Exports

The frontend plugin exports the following:

```ts
// Main exports
export { agenticChatPlugin } from './plugin'; // The plugin instance
export { AgenticChatPage } from './plugin'; // Main page component
export { AgenticChatIcon } from './plugin'; // Icon component for navigation
export { agenticChatApiRef } from './api'; // API reference for dependency injection
export * from './types'; // TypeScript types
```

## Development

```bash
# Navigate to the workspace
cd workspaces/mcp-chat

# Install dependencies
yarn install

# Start the development server
yarn start

# Run tests
yarn test

# Run linting
yarn lint

# Build all plugins
yarn build:all
```

## Troubleshooting

### Common Issues

**Plugin not loading in RHDH:**

- Verify the OCI image is accessible from RHDH
- Check `dynamic-plugins.override.yaml` syntax
- Review RHDH logs: `podman compose logs rhdh`

**RAG not returning results:**

- Verify vector store ID in configuration
- Check that documents have been ingested
- Confirm Llama Stack server is accessible

**MCP tools not available:**

- Verify MCP server URL is correct
- Check MCP server is running and accessible
- Review backend logs for connection errors

**Conversation history not loading:**

- Check Llama Stack Responses API is accessible
- Verify no corrupted data in Llama Stack storage
- Review network requests for error responses

## Documentation

For deeper technical understanding, see the documentation in the `docs/` folder:

| Document                                             | Description                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| [Architecture](./docs/architecture.md)               | Technical component architecture, APIs, and configuration reference       |
| [Agentic Capabilities](./docs/agent-architecture.md) | How Agentic Chat provides AI agent capabilities through the Responses API |

## License

Apache-2.0
