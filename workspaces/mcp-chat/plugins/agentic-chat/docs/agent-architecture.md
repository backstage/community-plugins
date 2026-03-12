# Agentic Chat: Agentic Capabilities

> **How Agentic Chat provides AI agent capabilities through the Responses API**

Agentic Chat is a Backstage plugin with a **frontend** (React-based chat UI) and **backend** (Node.js services) that provides agentic AI capabilities for platform onboarding, application migration, and operations tasks.

It achieves the agentic behavior by using Llama Stack's Responses API, which handles user questions as an AI agent would — reasoning about them, calling tools, and synthesizing responses.

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [The Responses API as an Agent](#the-responses-api-as-an-agent)
4. [Agentic Chat's Role](#agentic-chats-role)
5. [Agentic Capabilities](#agentic-capabilities)
6. [Use Cases](#use-cases)
7. [Architecture Summary](#architecture-summary)

---

## Overview

Agentic Chat helps developers:

- **Onboard** to OpenShift and similar platforms
- **Migrate** applications from other environments
- **Operate** and troubleshoot their deployments
- **Learn** platform concepts and best practices

It provides these capabilities through an AI-powered chat interface that can:

- Search documentation and provide relevant answers (RAG)
- Query and interact with clusters (MCP tools)
- Reason about user questions and synthesize actionable responses

**The agentic behavior comes from the Responses API.** Agentic Chat is the interface that makes this accessible within Backstage.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER                                            │
│                                                                              │
│  "How do I configure liveness probes for my payment-service?"               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AGENTIC CHAT PLUGIN (Backstage)                           │
│                                                                              │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │   FRONTEND (React)          │    │   BACKEND (Node.js)                  │ │
│  │                             │    │                                      │ │
│  │  • Chat UI                  │───▶│  • Receives request                  │ │
│  │  • Streaming display        │    │  • Reads config (tools, prompts)     │ │
│  │  • Conversation history     │◀───│  • Calls Responses API               │ │
│  │  • Tool call visualization  │    │  • Streams response back             │ │
│  │                             │    │  • Manages document ingestion        │ │
│  └─────────────────────────────┘    └─────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESPONSES API                                        │
│                       (Llama Stack)                                          │
│                                                                              │
│  The Responses API handles the question as an agent:                        │
│                                                                              │
│  1. REASONS about the question                                              │
│     "User wants to configure liveness probes for a specific service"        │
│                                                                              │
│  2. DECIDES which tools to use                                              │
│     "I should search documentation AND check their cluster config"          │
│                                                                              │
│  3. EXECUTES tools                                                          │
│     • file_search → Finds liveness probe documentation                      │
│     • mcp_call → Gets current deployment configuration                      │
│                                                                              │
│  4. SYNTHESIZES a response                                                  │
│     Combines documentation + cluster state into actionable guidance         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER RECEIVES                                        │
│                                                                              │
│  An intelligent response with:                                              │
│  • Documentation on liveness probe configuration                            │
│  • Their current deployment's configuration                                 │
│  • Specific steps to add/modify probes                                      │
│  • Source citations                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Responses API as an Agent

The Responses API (from Llama Stack, OpenAI-compatible) provides built-in agentic behavior. When Agentic Chat sends a request, the API:

### 1. Reasons About the Question

The LLM analyzes what the user is asking and what information is needed:

```
User: "Why is my pod crashing?"

LLM reasons:
  → This is a troubleshooting question
  → I need to find out which pod they mean
  → I should check the pod's logs and status
  → I should search for common crash causes in documentation
```

### 2. Decides Which Tools to Call

Based on its reasoning, the API decides what actions to take:

| Question Type            | Tools Used                        |
| ------------------------ | --------------------------------- |
| Documentation question   | `file_search` (RAG)               |
| Cluster status question  | `mcp_call` (OpenShift tools)      |
| Troubleshooting question | Both `file_search` and `mcp_call` |

### 3. Executes Tools

The API calls the configured tools:

- **file_search**: Searches the vector store containing platform documentation
- **mcp_call**: Executes tools on connected MCP servers (e.g., OpenShift MCP server)

### 4. Synthesizes a Response

The API combines tool outputs with its reasoning to generate a helpful response:

```
Based on your pod logs showing "OOMKilled", your container is running out
of memory. According to the platform documentation, you should:

1. Increase the memory limit in your deployment...
2. Check your application for memory leaks...

Your current memory limit is 256Mi. The recommended minimum for this
workload type is 512Mi.
```

---

## Agentic Chat's Role

Agentic Chat is a Backstage plugin consisting of:

- **Frontend Plugin** (`@backstage-community/plugin-agentic-chat`): React-based chat UI, streaming display, conversation history
- **Backend Plugin** (`@backstage-community/plugin-agentic-chat-backend`): Node.js services for API routing, document ingestion, configuration management

The agentic behavior (reasoning, tool calling, synthesis) is provided by the Responses API. Agentic Chat's role is to:

### 1. Configure the Responses API

Agentic Chat reads configuration from `app-config.yaml` and sends requests with:

```typescript
// What Agentic Chat sends to the Responses API
{
  input: userQuestion,
  model: "gemini/gemini-2.5-flash",
  instructions: systemPrompt,
  tools: [
    { type: "file_search", vector_store_ids: ["vs_..."] },
    { type: "mcp", server_url: "https://...", server_label: "openshift" }
  ],
  store: true,
  previous_response_id: previousResponseId
}
```

### 2. Manage the Knowledge Base

Agentic Chat handles document ingestion:

- Fetches documents from configured sources (directories, URLs, GitHub)
- Uploads them to Llama Stack's vector store
- Keeps them synchronized on a schedule

This populates the knowledge base that the Responses API searches via `file_search`.

### 3. Provide the User Interface

Agentic Chat provides a chat interface within Backstage:

- Chat input and message display
- Streaming response visualization
- Tool call progress indicators
- RAG source citations
- Conversation history

### 4. Handle Streaming

Agentic Chat streams responses from the Responses API to the UI, showing:

- Thinking/reasoning phases
- Tool execution progress
- Text generation in real-time

---

## Agentic Capabilities

The combination of Agentic Chat + Responses API provides these agentic capabilities:

| Capability                   | How It Works                                          |
| ---------------------------- | ----------------------------------------------------- |
| **Contextual Understanding** | LLM reasons about user questions in context           |
| **Knowledge Retrieval**      | `file_search` queries the documentation vector store  |
| **Cluster Interaction**      | `mcp_call` executes actions on OpenShift/Kubernetes   |
| **Tool Selection**           | LLM decides which tools to use based on the question  |
| **Response Synthesis**       | LLM combines tool outputs into actionable answers     |
| **Conversation Continuity**  | `previous_response_id` maintains context across turns |

### What Makes This Agentic

An agent is typically defined by:

| Agent Characteristic | How Responses API Provides It                             |
| -------------------- | --------------------------------------------------------- |
| **Autonomy**         | Decides which tools to call without explicit instructions |
| **Goal-Directed**    | Works toward answering the user's question                |
| **Reasoning**        | Analyzes questions and plans tool usage                   |
| **Tool Use**         | Executes file_search and MCP tools                        |
| **Synthesis**        | Combines multiple sources into coherent responses         |

---

## Use Cases

### Onboarding to OpenShift

```
User: "I'm new to OpenShift. How do I deploy my first application?"

Agent behavior:
  → Searches documentation for getting started guides
  → Provides step-by-step deployment instructions
  → Can check cluster access if MCP tools are available
```

### Application Migration

```
User: "I need to migrate my Node.js app from Heroku. What changes are needed?"

Agent behavior:
  → Searches migration guides and best practices
  → Identifies Heroku-specific configurations that need changes
  → Provides OpenShift equivalents (Routes vs domains, etc.)
```

### Troubleshooting

```
User: "My payment-service pod keeps crashing with OOMKilled"

Agent behavior:
  → Queries cluster for pod status and logs (MCP)
  → Searches documentation for memory configuration (RAG)
  → Synthesizes diagnosis with specific fix recommendations
```

### Learning Platform Concepts

```
User: "What's the difference between a Deployment and a DeploymentConfig?"

Agent behavior:
  → Searches documentation for both concepts
  → Provides comparison with use case recommendations
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BACKSTAGE / RHDH                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                 AGENTIC CHAT PLUGIN                           │    │   │
│  │  │                                                              │    │   │
│  │  │  Frontend          Backend                                   │    │   │
│  │  │  ├── Chat UI       ├── Sends requests to Responses API      │    │   │
│  │  │  ├── Streaming     ├── Manages document ingestion           │    │   │
│  │  │  └── History       └── Configures tools from app-config     │    │   │
│  │  │                                                              │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         LLAMA STACK                                  │   │
│  │                                                                      │   │
│  │  Responses API                    Vector Store                       │   │
│  │  ├── Receives questions           ├── Platform documentation        │   │
│  │  ├── Reasons about intent         ├── Migration guides              │   │
│  │  ├── Calls tools (agent behavior) └── Runbooks                      │   │
│  │  └── Synthesizes responses                                          │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         MCP SERVERS                                  │   │
│  │                                                                      │   │
│  │  OpenShift MCP Server                                               │   │
│  │  ├── list_pods, get_logs, describe_deployment                       │   │
│  │  ├── get_routes, get_services                                       │   │
│  │  └── Other cluster operations                                       │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component                 | Package                                            | Responsibility                                                                        |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Agentic Chat Frontend** | `@backstage-community/plugin-agentic-chat`         | Chat UI, streaming display, conversation history, right pane components               |
| **Agentic Chat Backend**  | `@backstage-community/plugin-agentic-chat-backend` | API routes, document ingestion, Responses API communication, configuration management |
| **Responses API**         | Llama Stack                                        | Agentic behavior — reasoning, tool calling, synthesis                                 |
| **Vector Store**          | Llama Stack                                        | Knowledge base for RAG (file_search)                                                  |
| **MCP Servers**           | External                                           | Cluster interaction tools (e.g., OpenShift MCP Server)                                |

### Key Point

> **Agentic Chat is a Backstage plugin (frontend + backend) that provides agentic AI capabilities.** The agentic behavior — reasoning, tool calling, response synthesis — comes from the Responses API. Agentic Chat makes this accessible within Backstage for platform onboarding and operations use cases.

---

## Further Reading

- [Architecture Overview](./architecture.md) - Technical component details and configuration
- [Llama Stack](https://github.com/meta-llama/llama-stack) - The Responses API provider
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
