# MCP Chat Backend - Library Usage Guide

This document describes how to use `@backstage-community/plugin-mcp-chat-backend` as a library in your own Backstage backend plugins.

## Table of Contents

- [Quick Start](#quick-start)
- [Provider System](#provider-system)
- [MCPClientService](#mcpclientservice)
- [Conversation Storage](#conversation-storage)
- [Types Reference](#types-reference)
- [Configuration](#configuration)
- [Examples](#examples)

---

## Quick Start

### Installation

```bash
# Using yarn (recommended for Backstage)
yarn add @backstage-community/plugin-mcp-chat-backend

# Using npm
npm install @backstage-community/plugin-mcp-chat-backend
```

### Basic Usage

```typescript
import {
  ProviderFactory,
  getProviderConfig,
  MCPClientServiceImpl,
  type ChatMessage,
} from '@backstage-community/plugin-mcp-chat-backend';

// In your plugin initialization
const providerConfig = getProviderConfig(config);
const llmProvider = ProviderFactory.createProvider(providerConfig);

// Send a message
const response = await llmProvider.sendMessage([
  { role: 'user', content: 'Hello, how are you?' },
]);
```

---

## Provider System

The provider system offers a unified interface to multiple LLM providers.

### Available Providers

| Provider         | Class                     | Description                                  |
| ---------------- | ------------------------- | -------------------------------------------- |
| OpenAI           | `OpenAIProvider`          | OpenAI Chat Completions API                  |
| OpenAI Responses | `OpenAIResponsesProvider` | OpenAI Responses API with native MCP support |
| Claude           | `ClaudeProvider`          | Anthropic Claude                             |
| Gemini           | `GeminiProvider`          | Google Gemini                                |
| Ollama           | `OllamaProvider`          | Local Ollama models                          |
| LiteLLM          | `LiteLLMProvider`         | LiteLLM proxy (100+ LLMs)                    |

### Using ProviderFactory

```typescript
import {
  ProviderFactory,
  getProviderConfig,
  type ProviderConfig,
} from '@backstage-community/plugin-mcp-chat-backend';

// Option 1: From Backstage config
const providerConfig = getProviderConfig(config);
const provider = ProviderFactory.createProvider(providerConfig);

// Option 2: Manual configuration
const manualConfig: ProviderConfig = {
  type: 'openai',
  apiKey: 'sk-...',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
};
const provider = ProviderFactory.createProvider(manualConfig);
```

### Direct Provider Usage

```typescript
import {
  OpenAIProvider,
  type ChatMessage,
} from '@backstage-community/plugin-mcp-chat-backend';

const provider = new OpenAIProvider({
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
});

const messages: ChatMessage[] = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is Kubernetes?' },
];

const response = await provider.sendMessage(messages);
console.log(response.choices[0].message.content);
```

### Testing Provider Connection

```typescript
const status = await provider.testConnection();
if (status.connected) {
  console.log('Available models:', status.models);
} else {
  console.error('Connection failed:', status.error);
}
```

---

## MCPClientService

The `MCPClientService` provides full MCP (Model Context Protocol) integration with LLM providers.

### Using MCPClientServiceImpl

```typescript
import {
  MCPClientServiceImpl,
  type MCPClientServiceOptions,
} from '@backstage-community/plugin-mcp-chat-backend';

// In your plugin initialization
const mcpService = new MCPClientServiceImpl({
  logger,
  config,
});

// Initialize MCP servers (connects to configured servers)
const servers = await mcpService.initializeMCPServers();

// Process a query with tool support
const result = await mcpService.processQuery(
  [{ role: 'user', content: 'List all pods in the default namespace' }],
  ['kubernetes-server'], // Optional: filter to specific MCP servers
);

console.log('Response:', result.reply);
console.log('Tools used:', result.toolCalls);
console.log('Tool responses:', result.toolResponses);
```

### MCPClientService Interface

```typescript
interface MCPClientService {
  // Initialize and connect to MCP servers
  initializeMCPServers(): Promise<MCPServer[]>;

  // Process a chat query with optional tool filtering
  processQuery(
    messagesInput: ChatMessage[],
    enabledTools?: string[], // Server IDs to enable
  ): Promise<QueryResponse>;

  // Get list of available tools from connected MCP servers
  getAvailableTools(): ServerTool[];

  // Get LLM provider status
  getProviderStatus(): Promise<ProviderStatusData>;

  // Get MCP server connection status
  getMCPServerStatus(): Promise<MCPServerStatusData>;
}
```

### Getting Available Tools

```typescript
const tools = mcpService.getAvailableTools();

tools.forEach(tool => {
  console.log(`Tool: ${tool.function.name}`);
  console.log(`  Description: ${tool.function.description}`);
  console.log(`  Server: ${tool.serverId}`);
});
```

---

## Conversation Storage

The `ChatConversationStore` provides database-backed conversation persistence for authenticated users.

### Using ChatConversationStore

```typescript
import {
  ChatConversationStore,
  type ChatConversationStoreOptions,
  type ConversationRecord,
} from '@backstage-community/plugin-mcp-chat-backend';

// Create store (requires DatabaseService from Backstage)
const store = await ChatConversationStore.create({
  database, // DatabaseService from coreServices.database
  logger, // LoggerService
  config, // Config
});

// Save a new conversation
const conversation = await store.saveConversation(
  'user:default/john', // userId (entity ref)
  messages, // ChatMessage[]
  ['kubernetes-server'], // toolsUsed (optional)
);

// Update an existing conversation (pass conversationId)
const updated = await store.saveConversation(
  'user:default/john',
  updatedMessages,
  ['kubernetes-server'],
  conversation.id, // existing conversation ID
);

// Get user's conversations (most recent first)
const conversations = await store.getConversations('user:default/john');

// Get with custom limit
const recent5 = await store.getConversations('user:default/john', 5);

// Get a specific conversation
const conv = await store.getConversationById(
  'user:default/john',
  conversationId,
);

// Toggle star status
const isNowStarred = await store.toggleStarred(
  'user:default/john',
  conversationId,
);

// Update title
await store.updateTitle('user:default/john', conversationId, 'New Title');

// Delete a conversation
const deleted = await store.deleteConversation(
  'user:default/john',
  conversationId,
);

// Delete all conversations for a user
await store.deleteUserConversations('user:default/john');
```

### SummarizationService

The `SummarizationService` generates AI-powered titles for conversations:

```typescript
import {
  SummarizationService,
  type SummarizationServiceOptions,
} from '@backstage-community/plugin-mcp-chat-backend';

const summarizer = new SummarizationService({
  mcpClientService, // MCPClientService instance
  logger,
  config,
});

// Generate a title for a conversation
const title = await summarizer.summarizeConversation(messages);
// Returns: "Kubernetes Pod Troubleshooting" or falls back to first user message
```

**Configuration options** (in `app-config.yaml`):

```yaml
mcpChat:
  conversationHistory:
    autoSummarize: true # Enable AI title generation (default: true)
    summarizeTimeout: 3000 # Timeout in ms (default: 3000)
```

---

## Types Reference

### Provider Types

```typescript
import type {
  ProviderConfig,
  ProviderStatusData,
  ProviderInfo,
  ProviderConnectionStatus,
  LLMProviderType,
} from '@backstage-community/plugin-mcp-chat-backend';

// LLMProviderType - Supported provider types
type LLMProviderType =
  | 'openai'
  | 'openai-responses'
  | 'claude'
  | 'gemini'
  | 'ollama'
  | 'litellm';

// ProviderConfig - Configuration for an LLM provider
interface ProviderConfig {
  type: string; // Use LLMProviderType for type safety
  apiKey?: string; // API key (optional for Ollama)
  baseUrl: string; // API base URL
  model: string; // Model name
}

// ProviderInfo - Runtime information about an active provider
interface ProviderInfo {
  id: string; // Provider type identifier
  model: string; // Currently configured model
  baseUrl: string; // API base URL
  connection: ProviderConnectionStatus;
}
```

### Chat Types

```typescript
import type {
  ChatMessage,
  ChatResponse,
  QueryResponse,
  ToolExecutionResult,
} from '@backstage-community/plugin-mcp-chat-backend';

// ChatMessage - A message in the conversation
interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[]; // Tool calls requested by assistant
  tool_call_id?: string; // Required when role is 'tool'
}

// QueryResponse - Result from processQuery
interface QueryResponse {
  reply: string; // Final text response
  toolCalls: ToolCall[]; // Tool calls that were made
  toolResponses: ToolExecutionResult[]; // Results from tool executions
}

// ToolExecutionResult - Result of executing a tool
interface ToolExecutionResult {
  id: string; // Original tool call ID
  name: string; // Tool name
  arguments: Record<string, unknown>; // Parsed arguments
  result: string; // Tool output
  serverId: string; // MCP server that handled it
}
```

### Conversation Types

```typescript
import type { ConversationRecord } from '@backstage-community/plugin-mcp-chat-backend';

// ConversationRecord - A stored conversation
interface ConversationRecord {
  id: string; // UUID
  userId: string; // User entity ref (e.g., 'user:default/john')
  messages: ChatMessage[]; // Conversation messages
  toolsUsed?: string[]; // Tool names used in the conversation
  title?: string; // AI-generated or user-edited title
  isStarred: boolean; // Whether the conversation is starred
  createdAt: Date; // When the conversation was created
  updatedAt: Date; // When the conversation was last updated
}
```

### MCP Server Types

```typescript
import {
  MCPServerType,
  type MCPServerConfig,
  type MCPServerSecrets,
  type MCPServerFullConfig,
  type MCPServer,
  type MCPServerStatusData,
} from '@backstage-community/plugin-mcp-chat-backend';

// MCPServerType enum - Connection types
enum MCPServerType {
  STDIO = 'stdio', // Local process via stdin/stdout
  STREAMABLE_HTTP = 'streamable-http', // HTTP streaming
}

// MCPServerConfig - Base server configuration
interface MCPServerConfig {
  id: string; // Unique identifier
  name: string; // Display name
  type: MCPServerType; // Connection type
  scriptPath?: string; // For STDIO: path to script
  npxCommand?: string; // For STDIO: npx package
  args?: string[]; // Command-line arguments
  url?: string; // For HTTP: endpoint URL
}

// MCPServerSecrets - Sensitive configuration
interface MCPServerSecrets {
  env?: Record<string, string>; // Environment variables
  headers?: Record<string, string>; // HTTP headers
}

// MCPServerFullConfig - Complete configuration
type MCPServerFullConfig = MCPServerConfig & MCPServerSecrets;
```

### Tool Types

```typescript
import type {
  Tool,
  ToolCall,
  ServerTool,
} from '@backstage-community/plugin-mcp-chat-backend';

// Tool - OpenAI function calling format
interface Tool {
  type: 'function';
  function: {
    name: string; // Function name
    description: string; // Description for LLM
    parameters: Record<string, unknown>; // JSON Schema for parameters
  };
}

// ToolCall - A tool invocation from the LLM
interface ToolCall {
  id: string; // Unique call identifier
  type: 'function'; // Always 'function'
  function: {
    name: string; // Function to call
    arguments: string; // JSON-encoded arguments (parse with JSON.parse)
  };
}

// ServerTool - Tool with server identification
interface ServerTool extends Tool {
  serverId: string; // MCP server that provides this tool
}
```

### Validation Types

```typescript
import type { MessageValidationResult } from '@backstage-community/plugin-mcp-chat-backend';

// MessageValidationResult - Result of validateMessages()
interface MessageValidationResult {
  isValid: boolean; // Whether validation passed
  error?: string; // Error message if validation failed
}
```

---

## Configuration

### app-config.yaml

```yaml
mcpChat:
  # LLM Provider Configuration
  providers:
    - id: openai
      token: ${OPENAI_API_KEY}
      model: gpt-4
      # Optional: baseUrl for custom endpoints
      # baseUrl: https://api.openai.com/v1

  # MCP Server Configuration
  mcpServers:
    # STDIO server (npx command)
    - id: kubernetes-server
      name: Kubernetes MCP Server
      type: stdio
      npxCommand: kubernetes-mcp-server@latest

    # STDIO server (script path)
    - id: custom-server
      name: Custom MCP Server
      type: stdio
      scriptPath: /path/to/server.js

    # HTTP server
    - id: http-server
      name: HTTP MCP Server
      type: streamable-http
      url: http://localhost:3000/mcp
      headers:
        Authorization: Bearer ${MCP_TOKEN}

  # Optional: Custom system prompt
  systemPrompt: 'You are a helpful Kubernetes assistant.'
```

---

## Examples

### Example 1: Simple Chat Plugin

```typescript
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import {
  ProviderFactory,
  getProviderConfig,
  type ChatMessage,
} from '@backstage-community/plugin-mcp-chat-backend';

export const simpleChatPlugin = createBackendPlugin({
  pluginId: 'simple-chat',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, config, httpRouter }) {
        const providerConfig = getProviderConfig(config);
        const llmProvider = ProviderFactory.createProvider(providerConfig);

        httpRouter.post('/chat', async (req, res) => {
          const { message } = req.body;

          const response = await llmProvider.sendMessage([
            { role: 'user', content: message },
          ]);

          res.json({
            reply: response.choices[0].message.content,
          });
        });
      },
    });
  },
});
```

### Example 2: Plugin with MCP Tools

```typescript
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import {
  MCPClientServiceImpl,
  validateMessages,
} from '@backstage-community/plugin-mcp-chat-backend';

export const mcpToolsPlugin = createBackendPlugin({
  pluginId: 'mcp-tools',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, config, httpRouter }) {
        // Initialize MCP service
        const mcpService = new MCPClientServiceImpl({ logger, config });
        await mcpService.initializeMCPServers();

        // Chat endpoint with tool support
        httpRouter.post('/chat', async (req, res) => {
          const { messages, enabledServers } = req.body;

          // Validate messages
          const validation = validateMessages(messages);
          if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
          }

          // Process with tools
          const result = await mcpService.processQuery(
            messages,
            enabledServers,
          );

          res.json({
            reply: result.reply,
            toolsUsed: result.toolCalls.map(tc => tc.function.name),
            toolResponses: result.toolResponses,
          });
        });

        // Tools list endpoint
        httpRouter.get('/tools', async (_req, res) => {
          const tools = mcpService.getAvailableTools();
          res.json({ tools });
        });
      },
    });
  },
});
```

### Example 3: Reusing the Router

```typescript
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import {
  MCPClientServiceImpl,
  createRouter,
  validateConfig,
} from '@backstage-community/plugin-mcp-chat-backend';

export const myPlugin = createBackendPlugin({
  pluginId: 'my-plugin',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, config, httpRouter }) {
        // Validate configuration
        validateConfig(config);

        // Create MCP service
        const mcpService = new MCPClientServiceImpl({ logger, config });

        // Reuse the standard router (provides /chat, /tools, /provider/status, /mcp/status)
        const router = await createRouter({
          logger,
          mcpClientService: mcpService,
        });
        httpRouter.use(router);

        // Add your custom endpoints
        httpRouter.get('/custom', async (_req, res) => {
          res.json({ message: 'Custom endpoint' });
        });
      },
    });
  },
});
```

### Example 4: Custom Provider Extension

```typescript
import {
  LLMProvider,
  type ChatMessage,
  type Tool,
  type ChatResponse,
  type ProviderConfig,
} from '@backstage-community/plugin-mcp-chat-backend';

// Extend the base provider for custom behavior
class CustomProvider extends LLMProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  async sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse> {
    // Add custom preprocessing
    const processedMessages = this.preprocessMessages(messages);

    // Use parent's makeRequest
    const response = await this.makeRequest('/chat/completions', {
      model: this.model,
      messages: processedMessages,
      tools,
    });

    return this.parseResponse(response);
  }

  async testConnection() {
    // Custom connection test
    return { connected: true, models: [this.model] };
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'X-Custom-Header': 'custom-value',
    };
  }

  protected formatRequest(messages: ChatMessage[], tools?: Tool[]) {
    return { model: this.model, messages, tools };
  }

  protected parseResponse(response: any): ChatResponse {
    return response;
  }

  private preprocessMessages(messages: ChatMessage[]): ChatMessage[] {
    // Custom preprocessing logic
    return messages;
  }
}
```

---

## Utilities

### validateConfig

Validates the `mcpChat` configuration section.

```typescript
import { validateConfig } from '@backstage-community/plugin-mcp-chat-backend';

try {
  validateConfig(config);
} catch (error) {
  console.error('Invalid configuration:', error.message);
}
```

### validateMessages

Validates chat message array structure.

```typescript
import { validateMessages } from '@backstage-community/plugin-mcp-chat-backend';

const validation = validateMessages(messages);
if (!validation.isValid) {
  console.error('Invalid messages:', validation.error);
}
```

### loadServerConfigs

Loads MCP server configurations from Backstage config.

```typescript
import { loadServerConfigs } from '@backstage-community/plugin-mcp-chat-backend';

const serverConfigs = loadServerConfigs(config);
serverConfigs.forEach(server => {
  console.log(`Server: ${server.name} (${server.type})`);
});
```

### executeToolCall

Executes a tool call using MCP clients.

```typescript
import { executeToolCall } from '@backstage-community/plugin-mcp-chat-backend';

const result = await executeToolCall(
  toolCall, // The tool call from LLM response
  tools, // Available tools list
  mcpClients, // Map of server ID to MCP Client
);
```

---

## Migration from Direct Imports

If you were previously using direct imports from `/dist/`:

```typescript
// Before (workaround)
const {
  OpenAIProvider,
} = require('@backstage-community/plugin-mcp-chat-backend/dist/providers/openai-provider.cjs.js');

// After (clean import)
import { OpenAIProvider } from '@backstage-community/plugin-mcp-chat-backend';
```

---

## Support

- [GitHub Issues](https://github.com/backstage/community-plugins/issues)
- [Backstage Discord](https://discord.gg/backstage-687207715902193673)

## License

Apache-2.0
