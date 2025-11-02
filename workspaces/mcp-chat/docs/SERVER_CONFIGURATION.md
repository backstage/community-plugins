# MCP Server Configuration Guide

This guide demonstrates how to configure the MCP Chat to connect with different types of MCP servers. The plugin supports three connection methods: STDIO (local processes), HTTP (remote servers), and SSE (real-time updates).

## Configuration Overview

All server configurations are defined in the `mcpServers` array in your `app-config.yaml`. Each server requires:

- `id`: Unique identifier for the server
- `name`: Display name in the UI
- Connection-specific properties (detailed below)

Additionally, you can customize the AI assistant's behavior using the optional `systemPrompt` configuration at the `mcpChat` level (see [main README](../README.md) for details).

### Universal Properties

These properties can be added to **any** MCP server configuration:

- `env`: Environment variables object
- `args`: Command-line arguments array (for STDIO servers) or query parameters (for HTTP/SSE servers)
- `headers`: HTTP headers object (primarily for HTTP/SSE servers, but can be used for metadata in STDIO)

---

## STDIO Servers (Local Processes)

STDIO servers run as child processes and communicate through standard input/output. This is the most common method for local development and npm-packaged servers.

### Basic Configuration

```yaml
mcpServers:
  - id: brave-search-server
    name: Brave Search Server
    npxCommand: '@modelcontextprotocol/server-brave-search@latest'
    env:
      BRAVE_API_KEY: ${BRAVE_API_KEY}

  - id: kubernetes-server
    name: Kubernetes Server
    npxCommand: 'kubernetes-mcp-server@latest'
```

### Advanced STDIO Options

```yaml
mcpServers:
  # Server with command-line arguments
  - id: custom-server
    name: Custom Server
    npxCommand: 'custom-mcp-server@latest'
    args:
      - '--port=9000'
      - '--log-level=debug'
    env:
      NODE_ENV: development

  # Local script execution
  - id: local-script-server
    name: Local Script Server
    scriptPath: './servers/my-mcp-server.js'
    args:
      - '--port=9100'
      - '--env=dev'
    env:
      DEBUG: true
```

**STDIO-Specific Properties:**

- `npxCommand`: NPM package to execute via npx
- `scriptPath`: Path to a local Node.js script (alternative to npxCommand)

---

## HTTP Servers (Remote Connections)

HTTP servers provide MCP functionality over standard HTTP connections, ideal for cloud deployments or networked services.

```yaml
mcpServers:
  - id: backstage-server
    name: Backstage Server
    url: 'http://localhost:7007/api/mcp-actions/v1'
    headers:
      Authorization: 'Bearer your-token'
      Content-Type: 'application/json'
    env:
      API_TIMEOUT: '30000'
```

**HTTP-Specific Properties:**

- `url`: HTTP endpoint URL

---

## SSE Servers (Real-time Updates)

Server-Sent Events (SSE) servers provide real-time streaming capabilities for dynamic MCP interactions.

```yaml
mcpServers:
  - id: sse-server
    name: SSE Server
    url: 'http://localhost:8080/sse'
    type: sse
    headers:
      Authorization: 'Bearer ${SSE_TOKEN}'
    env:
      RECONNECT_INTERVAL: '5000'
```

**SSE-Specific Properties:**

- `url`: SSE endpoint URL
- `type`: Must be set to `sse`

---

## Mixed Configuration Example

You can combine different server types in a single configuration:

```yaml
mcpServers:
  # Local STDIO server
  - id: local-tools
    name: Local Development Tools
    npxCommand: 'dev-tools-server@latest'
    env:
      NODE_ENV: development
      DEBUG: true
    args:
      - '--verbose'

  # Remote HTTP server
  - id: production-api
    name: Production API Server
    url: 'https://api.example.com/mcp'
    headers:
      Authorization: 'Bearer ${API_TOKEN}'
      X-Client-Version: '1.0.0'
    env:
      API_TIMEOUT: '60000'

  # Real-time SSE server
  - id: live-updates
    name: Live Updates Server
    url: 'wss://updates.example.com/sse'
    type: sse
    headers:
      Authorization: 'Bearer ${SSE_TOKEN}'
    env:
      RECONNECT_INTERVAL: '3000'
```

---

## Configuration Tips

- **Environment Variables**: Use `${VARIABLE_NAME}` syntax to reference environment variables
- **Universal Properties**: Remember that `env`, `args`, and `headers` can be added to any server configuration
- **Server Availability**: Ensure npm packages are installed and URLs are accessible before starting Backstage
- **Authentication**: Use the `headers` property for API keys, tokens, or custom authentication
- **Development**: STDIO servers are ideal for local development and testing
- **Production**: HTTP/SSE servers work better for distributed or cloud deployments

---

For additional setup instructions and troubleshooting, refer to the [main README](../README.md).
