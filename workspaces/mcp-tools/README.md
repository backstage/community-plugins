# mcp-tools

This workspace contains plugins that define MCP actions that interact with the Backstage MCP server.

For information on each MCP tool, see each plugin's README:

- [software-catalog-mcp-tool](./plugins/software-catalog-mcp-tool/README.md) - MCP tools for interacting with the software catalog
- [techdocs-mcp-tool](./plugins/techdocs-mcp-tool/README.md) - MCP tools for interacting with TechDocs

## Development

A sample dev environment under `packages/` is provided to test the MCP tools. To start the instance:

1. Set `MCP_TOKEN` to some value (8 characters or longer)

2. Run `yarn install`

3. Run `yarn dev` to launch the frontend and backend.

## Configuring Remote Backstage Instances

If you are deploying these plugins on a remote instance of Backstage, you'll need to make the following changes to your app-config (the local dev environment app-config already has these set):

1. Add the MCP Tool as a plugin source for the action registry

```yaml
backend:
  actions:
    pluginSources:
      - 'software-catalog-mcp-tool'
```

2. Specify a static token for authentication against the MCP server

```yaml
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: ${MCP_TOKEN}
          subject: mcp-clients
```

## Interacting with the MCP Tool(s)

See https://github.com/backstage/backstage/tree/master/plugins/mcp-actions-backend#configuring-mcp-clients for more information.

Sample mcp.json for Cursor:

```json
{
  "mcpServers": {
    "backstage-actions": {
      "url": "http://localhost:7007/api/mcp-actions/v1",
      "headers": {
        "Authorization": "Bearer ${MCP_TOKEN}"
      }
    }
  }
}
```

### Example Queries

Below are some example queries that show the MCP Tools in operation

_Query 1: Get the API entity that the "beneficiary-management-api" component exposes (verbose: true), and from that, retrieve the OpenAPI spec. Then using the OpenAPI spec, construct a curl command to add a new beneficiary:_

<img width="703" height="331" alt="Image" src="https://github.com/user-attachments/assets/bf438016-5c35-42af-8e33-904c55cc56c8" />

<img width="701" height="470" alt="Image" src="https://github.com/user-attachments/assets/018c3b58-d310-4098-bc41-dc361930b18f" />

_Query 2: How does the audio-to-text software template work?_

<img width="702" height="490" alt="Image" src="https://github.com/user-attachments/assets/9d053106-4de7-4037-a992-fba9b1d31461" />

<img width="700" height="426" alt="Image" src="https://github.com/user-attachments/assets/3b824d39-0191-40ec-a075-90502b0514fb" />
