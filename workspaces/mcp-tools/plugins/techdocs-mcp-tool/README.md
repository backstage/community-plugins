# techdocs-mcp-tool

This plugin defines a series of MCP tools for interacting with TechDocs on a Backstage instance.

## Installation
> [!NOTE]  
> This plugin depends on the mcp-actions-backend plugin, and it must also be installed. Consult its [readme](https://github.com/backstage/backstage/blob/master/plugins/mcp-actions-backend/README.md) for information on installation and configuration.

This plugin is installed via the `@backstage-community/backstage-plugin-techdocs-mcp-tool` package. To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @backstage-community/backstage-plugin-techdocs-mcp-tool
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(
  import('@backstage-community/backstage-plugin-techdocs-mcp-tool'),
);
```

## Tools

### Fetch TechDoc Entities

This tool retrieves entities from the software catalog that have TechDocs associated with them. Results are returned in JSON array format, where each entry includes entity details and TechDocs metadata (such as available pages, and timestamps).

**Parameters:**
- `entityType` (optional, string): Filter by entity type (e.g., Component, API, System)
- `namespace` (optional, string): Filter by namespace
- `owner` (optional, string): Filter by owner (e.g., team-platform, user:john.doe)
- `lifecycle` (optional, string): Filter by lifecycle (e.g., production, staging, development)
- `tags` (optional, string): Filter by tags as comma-separated values (e.g., "genai,frontend,api")


### Analyze TechDocs Coverage

This tool analyzes documentation coverage across Backstage entities. It calculate the percentage of entities that have TechDocs configured, helping to identify gaps in documentation.

**Parameters:**
- `entityType` (optional, string): Filter by entity type (e.g., Component, API, System)
- `namespace` (optional, string): Filter by namespace
- `owner` (optional, string): Filter by owner (e.g., team-platform, user:john.doe)
- `lifecycle` (optional, string): Filter by lifecycle (e.g., production, staging, development)
- `tags` (optional, string): Filter by tags as comma-separated values (e.g., "genai,frontend,api")


### Retrieve TechDocs Content

This tool retrieves tehcdocs associated with a given entity (`entityRef`). By default, it will return all of the techdocs for the given entity, but specific pages can also be returned.

**Parameters:**
- `entityRef` (required, string): Entity reference in format `kind:namespace/name` (e.g., `component:default/my-service`)
- `pagePath` (optional, string): Path to specific page within the documentation (defaults to `index.html`). Examples: `"api/endpoints.html"`, `"guides/setup.md"`


## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn dev` from the root directory.
