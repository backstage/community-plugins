# software-catalog-mcp-tool

This plugin defines MCP tools for interacting with the software catalog on a Backstage instance.

## Installation

> [!NOTE]  
> This plugin depends on the mcp-actions-backend plugin, and it must also be installed. Consult its [readme](https://github.com/backstage/backstage/blob/master/plugins/mcp-actions-backend/README.md) for information on installation and configuration.

This plugin is installed via the `@backstage-community/backstage-plugin-software-catalog-mcp-tool-backend` package. To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @backstage-community/backstage-plugin-software-catalog-mcp-tool-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(
  import(
    '@backstage-community/backstage-plugin-software-catalog-mcp-tool-backend'
  ),
);
```

## Tools

### Fetch Catalog Entities

This tool searches and retrieves catalog entities from the Backstage server. It can list all Backstage entities such as Components, Systems, Resources, APIs, Locations, Users, and Groups. By default, results are returned in a simplified format, which returns key metadata, but setting `verbose` to true will return the full Backstage entity objects.

**Parameters:**
- `kind` (optional, string): Filter entities by kind (e.g., Component, API, System, Resource)
- `type` (optional, string): Filter entities by type (e.g., ai-model, library, website, storage). Note: `type` can only be filtered on if a specified entity `kind` is also specified.
- `name` (optional, string): Filter entities by name
- `owner` (optional, string): Filter entities by owner (e.g., team-platform, user:john.doe)
- `lifecycle` (optional, string): Filter entities by lifecycle (e.g., production, staging, development)
- `tags` (optional, string): Filter entities by tags as comma-separated values (e.g., "genai,ibm,llm,granite,conversational,task-text-generation")
- `verbose` (optional, boolean): If true, returns the full Backstage Entity object from the API rather than the shortened output

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn dev` from the root directory.
