# Agentic Chat Architecture

> **RAG-Powered AI Assistant for Application Platform**

Agentic Chat is an intelligent documentation assistant that combines **Retrieval Augmented Generation (RAG)** with **Model Context Protocol (MCP)** tool execution, built on Llama Stack's Responses API.

📖 **Related Documentation:**

- [Agentic Capabilities](./agent-architecture.md) - How Agentic Chat provides AI agent capabilities through the Responses API

---

## High-Level Overview

```mermaid
flowchart TB
    subgraph User["👤 User"]
        Q["Question: How do I configure liveness probes?"]
    end

    subgraph Backstage["🌐 BACKSTAGE / RHDH"]
        subgraph Frontend["Frontend Plugin"]
            Chat["💬 Chat Interface"]
            Sidebar["📊 Right Pane"]
        end

        subgraph Backend["Backend Service"]
            Orchestration["Chat Orchestration"]
            Ingestion["Document Ingestion"]
            Status["Status Monitoring"]
        end
    end

    subgraph External["External Services"]
        subgraph LlamaStack["🦙 LLAMA STACK"]
            Responses["Responses API"]
            VectorStore["Vector Store"]
            Files["Files API"]
            Embeddings["Embedding Model"]
        end

        subgraph MCP["🔧 MCP SERVERS"]
            OpenShift["OpenShift MCP"]
            Other["Other Tools..."]
        end
    end

    Q --> Chat
    Chat --> Orchestration
    Orchestration --> Responses
    Responses --> VectorStore
    Responses --> OpenShift
    Ingestion --> Files
    Files --> VectorStore
    Embeddings --> VectorStore

    style User fill:#e8f5e9
    style Backstage fill:#e3f2fd
    style LlamaStack fill:#f3e5f5
    style MCP fill:#fff3e0
```

### Key Capabilities

| RAG (Retrieval Augmented Generation) | MCP (Model Context Protocol)     |
| ------------------------------------ | -------------------------------- |
| Auto-ingest docs from config         | Execute actions on OpenShift/K8s |
| Semantic search over knowledge base  | Extensible tool ecosystem        |
| Context-aware AI responses           | Real-time cluster operations     |
| Source citations in responses        | Tool results in chat             |

| Document Sources    | LLM Providers             | Embedding Models                       |
| ------------------- | ------------------------- | -------------------------------------- |
| Local directories   | Gemini (gemini-2.5-flash) | sentence-transformers/all-MiniLM-L6-v2 |
| GitHub repositories | OpenAI-compatible models  | text-embedding-004                     |
| Remote URLs         | Ollama (local)            | Custom models                          |

---

## Plugin Initialization Flow

```mermaid
sequenceDiagram
    participant P as Plugin Startup
    participant S as LlamaStackOrchestrator
    participant L as Llama Stack
    participant V as Vector Store

    P->>S: initialize()
    S->>S: loadLlamaStackConfig()
    S->>L: ensureVectorStoreExists()

    alt Vector Store ID configured
        L-->>S: Validate exists
    else Auto-create
        S->>L: POST /vector_stores (with embeddingModel)
        L-->>S: New vector store ID
    end

    P->>S: await postInitialize()
    S->>S: syncDocuments()

    loop For each document source
        S->>S: Fetch from directory/URL/GitHub
        S->>L: POST /files (upload)
        S->>V: POST /vector_stores/{id}/files (chunk + embed)
    end

    S->>V: listDocuments() - Verify
    S-->>P: Ready with X documents

    Note over P: Plugin accepts requests
```

### Startup Sequence

1. **initialize()**

   - Load config from `app-config.yaml`
   - `ensureVectorStoreExists()` - Create with embedding model if needed
   - Load MCP server configs
   - Test connections

2. **await postInitialize()** ← BLOCKS until complete

   - `syncDocuments()` - Fetch, upload, chunk, embed
   - Verify documents in vector store
   - Log document count

3. **Router setup** → Plugin READY

---

## Document Ingestion (RAG Pipeline)

```mermaid
flowchart LR
    subgraph Config["📋 app-config.yaml"]
        D1["type: directory"]
        D2["type: url"]
        D3["type: github"]
    end

    subgraph Ingestion["⚙️ DocumentIngestionService"]
        Fetch["Fetch Documents"]
    end

    subgraph LlamaStack["🦙 Llama Stack"]
        FilesAPI["Files API<br/>POST /v1/openai/v1/files"]
        VectorAPI["Vector Store API<br/>POST /vector_stores/{id}/files"]
        Chunk["Chunking<br/>(200 tokens, 50 overlap)"]
        Embed["Embedding<br/>(all-MiniLM-L6-v2)"]
        Store["Vector Store<br/>(techx-db)"]
    end

    D1 --> Fetch
    D2 --> Fetch
    D3 --> Fetch
    Fetch --> FilesAPI
    FilesAPI --> VectorAPI
    VectorAPI --> Chunk
    Chunk --> Embed
    Embed --> Store

    style Config fill:#e1f5fe
    style Ingestion fill:#fff3e0
    style LlamaStack fill:#f3e5f5
```

### RAG Configuration

```yaml
agenticChat:
  llamaStack:
    # Vector Store (auto-created if not specified)
    vectorStoreName: 'techx-db'
    embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2'
    embeddingDimension: 384

    # Chunking
    chunkingStrategy: 'static' # or 'auto'
    maxChunkSizeTokens: 200
    chunkOverlapTokens: 50
```

---

## Chat with RAG + MCP Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 🖥️ Frontend
    participant B as ⚙️ Backend
    participant L as 🦙 Llama Stack
    participant M as 🔧 MCP Server

    U->>F: Ask question
    F->>B: POST /chat (SSE streaming)
    B->>L: POST /v1/openai/v1/responses

    par RAG Retrieval
        L->>L: file_search (Vector Store)
        L-->>B: file_search_call.results
    and Tool Execution
        L->>M: mcp_call (OpenShift tools)
        M-->>L: Tool results
        L-->>B: mcp_call.results
    end

    L->>L: Generate response with context
    L-->>B: Streaming response chunks
    B-->>F: SSE events
    F-->>U: Display answer + citations + tool results
```

### Responses API Request

```json
{
  "input": "How do I configure liveness probes?",
  "model": "gemini/gemini-2.5-flash",
  "instructions": "You are Agentic Chat...",
  "tools": [
    { "type": "file_search", "vector_store_ids": ["vs_..."] },
    { "type": "mcp", "server_url": "https://...", "server_label": "openshift" }
  ],
  "store": true,
  "include": ["file_search_call.results"]
}
```

---

## Component Architecture

```mermaid
flowchart TB
    subgraph Frontend["🖥️ FRONTEND (React)"]
        AgenticChatPage["AgenticChatPage"]

        subgraph MainArea["Main Chat Area"]
            ChatContainer["ChatContainer"]
            WelcomeScreen["WelcomeScreen"]
            ChatMessage["ChatMessage"]
            StreamingMessage["StreamingMessage"]
        end

        subgraph RightPane["Right Pane (Auto-Hide)"]
            ConvoHistory["ConversationHistory"]
            AgentStatus["AgentStatusPanel"]
            DocPanel["DocumentPanel"]
            StatusPanel["StatusPanel (MCP)"]
        end

        API["AgenticChatApi"]
    end

    subgraph Backend["⚙️ BACKEND (Node.js)"]
        Router["router.ts (Express)"]

        subgraph Services["Services"]
            TechService["LlamaStackOrchestrator"]
            DocService["DocumentIngestionService"]
            SafetyService["SafetyService"]
        end
    end

    subgraph External["🌐 External"]
        LlamaStack["Llama Stack"]
        MCPServers["MCP Servers"]
    end

    AgenticChatPage --> MainArea
    AgenticChatPage --> RightPane
    MainArea --> API
    API --> Router
    Router --> Services
    TechService --> LlamaStack
    TechService --> MCPServers
```

---

## API Endpoints

| Endpoint                                          | Method   | Description                                 |
| ------------------------------------------------- | -------- | ------------------------------------------- |
| `/api/agentic-chat/health`                        | `GET`    | Health check                                |
| `/api/agentic-chat/chat`                          | `POST`   | Send chat message (SSE streaming)           |
| `/api/agentic-chat/documents`                     | `GET`    | List documents in knowledge base            |
| `/api/agentic-chat/sync`                          | `POST`   | Trigger document sync from sources          |
| `/api/agentic-chat/status`                        | `GET`    | Get service status (LLM, Vector Store, MCP) |
| `/api/agentic-chat/conversations`                 | `GET`    | List conversation history                   |
| `/api/agentic-chat/conversations/:id`             | `GET`    | Get specific conversation                   |
| `/api/agentic-chat/conversations/:id`             | `DELETE` | Delete a conversation                       |
| `/api/agentic-chat/conversations/:id/input_items` | `GET`    | Get conversation input items                |
| `/api/agentic-chat/branding`                      | `GET`    | Get branding configuration                  |
| `/api/agentic-chat/workflows`                     | `GET`    | Get workflow cards                          |
| `/api/agentic-chat/quick-actions`                 | `GET`    | Get quick action prompts                    |

---

## Configuration Reference

### Complete Configuration

```yaml
agenticChat:
  # =============================================================================
  # LLAMA STACK - AI Backend
  # =============================================================================
  llamaStack:
    baseUrl: 'https://llama-stack-server.example.com'

    # Vector Store Configuration
    # Option 1: Use existing vector store
    vectorStoreId: 'vs_abc123...'
    # Option 2: Auto-create (if vectorStoreId not specified)
    vectorStoreName: 'techx-db'

    # Embedding Model (for RAG)
    embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2'
    embeddingDimension: 384

    # LLM Model
    model: 'gemini/gemini-2.5-flash'

    # Chunking Configuration
    chunkingStrategy: 'static' # 'auto' or 'static'
    maxChunkSizeTokens: 200
    chunkOverlapTokens: 50

    # TLS Configuration
    skipTlsVerify: true # For dev/self-signed certs

  # =============================================================================
  # DOCUMENT SOURCES - For RAG
  # =============================================================================
  documents:
    syncMode: full # 'full' removes deleted, 'append' only adds
    sources:
      # Local directory
      - type: directory
        path: ./examples/docs
        patterns: ['**/*.md', '**/*.yaml']

      # GitHub repository
      - type: github
        repo: owner/repo
        branch: main
        path: /docs
        patterns: ['*.md']
        # token: ${GITHUB_TOKEN}  # For private repos

      # Remote URLs
      - type: url
        urls:
          - 'https://example.com/doc1.md'
          - 'https://example.com/doc2.md'

  # =============================================================================
  # MCP SERVERS - Tool Execution
  # =============================================================================
  mcpServers:
    - id: openshift-server
      name: OpenShift MCP Server
      type: streamable-http
      url: 'https://openshift-mcp-server.example.com/mcp'

  # =============================================================================
  # SYSTEM PROMPT
  # =============================================================================
  systemPrompt: |
    You are Agentic Chat, an AI assistant for Application Platform.
    You have access to documentation via RAG and can execute actions via MCP tools.
    Always provide helpful, accurate responses with source citations.
```

---

## Frontend Components

| Component               | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| **AgenticChatPage**     | Main page container, state management          |
| **ChatContainer**       | Chat interface with messages, input, streaming |
| **ChatMessage**         | Individual message display (user/assistant)    |
| **StreamingMessage**    | Real-time streaming response with phases       |
| **WelcomeScreen**       | Initial screen with workflow cards             |
| **RightPane**           | Collapsible sidebar (auto-hides on send)       |
| **ConversationHistory** | Browse and resume past conversations           |
| **AgentStatusPanel**    | LLM and Vector Store status                    |
| **DocumentPanel**       | Knowledge base documents list                  |
| **StatusPanel**         | MCP server connection status                   |

---

## Backend Services

| Service                      | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| **LlamaStackOrchestrator**   | Core: chat, RAG, documents, conversations, status |
| **DocumentIngestionService** | Fetch documents from directory, URL, GitHub       |
| **SafetyService**            | AI safety guardrails and content filtering        |
| **router.ts**                | Express routes for REST API endpoints             |

---

## Key Features

| Feature                        | Description                                                   |
| ------------------------------ | ------------------------------------------------------------- |
| **Vector Store Auto-Creation** | Creates vector store with embedding model if not configured   |
| **Blocking Ingestion**         | Plugin waits for document ingestion before accepting requests |
| **Conversation History**       | Persistent chat sessions using Responses API `store: true`    |
| **Auto-Hide Right Pane**       | Sidebar collapses when user sends a message                   |
| **RAG with Citations**         | Shows source documents used in responses                      |
| **MCP Tool Execution**         | Execute actions on OpenShift/Kubernetes via MCP servers       |
| **Streaming Responses**        | Real-time SSE streaming with phase indicators                 |

---

## Llama Stack APIs Used

| API                    | Endpoint                                      | Purpose                     |
| ---------------------- | --------------------------------------------- | --------------------------- |
| **Responses API**      | `POST /v1/openai/v1/responses`                | Unified chat with RAG + MCP |
| **Files API**          | `POST /v1/openai/v1/files`                    | Upload documents            |
| **Vector Stores API**  | `POST /v1/openai/v1/vector_stores`            | Create vector store         |
| **Vector Store Files** | `POST /v1/openai/v1/vector_stores/{id}/files` | Attach files with chunking  |
| **List Responses**     | `GET /v1/openai/v1/responses`                 | Conversation history        |

---

## Deployment

### Static Plugin (Standard Backstage)

```bash
# Backend
yarn --cwd packages/backend add @backstage-community/plugin-agentic-chat-backend

# Frontend
yarn --cwd packages/app add @backstage-community/plugin-agentic-chat
```

### Dynamic Plugin (Red Hat Developer Hub)

See [README.md](../README.md) for complete RHDH deployment instructions including:

- Building and exporting dynamic plugins
- Packaging as OCI image
- Configuration in `dynamic-plugins.override.yaml`

---

## Screenshots

![Welcome Screen](./images/welcome-screen.png)
_Welcome screen with workflow cards and quick actions_

![Chat Interface](./images/chat-response.png)
_Chat interface with AI response and code formatting_

![Right Pane](./images/right-pane-expanded.png)
_Right pane with conversation history and agent status_
