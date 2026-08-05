# @backstage-community/plugin-mcp-capabilities-backend

Backend plugin for the MCP Capabilities suite. It exposes an on-demand endpoint,
`GET /api/mcp-capabilities/spec?entityRef=<ref>`, that connects live to a native
`API` / `spec.type: mcp-server` catalog entity's remote (read from
`spec.remotes[].url`) and returns the full tool / resource / prompt detail that
powers the Capabilities tab.

It speaks the streamable-http transport via the official
[`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk)
client (handshake, capability-gated `tools/list` / `resources/list` /
`prompts/list`, SSE, session handling).

> Persisting a searchable summary onto entities is a **separate, opt-in**
> concern handled by
> [`@backstage-community/plugin-catalog-backend-module-mcp-capabilities`](../catalog-backend-module-mcp-capabilities/README.md).
> This plugin serves live detail only.

## Installation

```sh
yarn --cwd packages/backend add @backstage-community/plugin-mcp-capabilities-backend
```

`mcp-server` entities are native `API` entities whose specType is defined by the
upstream `mcpServerApiEntityModel` layer (it uses `spec.remotes` in place of the
usual `spec.definition`), so it must be registered or the entities won't
validate. Register that layer, then add this plugin:

```ts
// packages/backend/src/index.ts
import { provideStaticCatalogModel } from '@backstage/plugin-catalog-node/alpha';
import { mcpServerApiEntityModel } from '@backstage/catalog-model/alpha';

// If your app already calls provideStaticCatalogModel, add mcpServerApiEntityModel
// to that single call instead of adding a second one.
backend.add(provideStaticCatalogModel({ layers: [mcpServerApiEntityModel] }));
backend.add(import('@backstage-community/plugin-mcp-capabilities-backend'));
```

Then register some `mcp-server` entities, e.g.:

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: aws-docs
spec:
  type: mcp-server
  lifecycle: production
  owner: group:default/guests
  remotes:
    - type: streamable-http
      url: https://your-mcp-server.example.com/mcp
```

## Verify

Aside from visual verification in the UI — open an `mcp-server` entity and check
that the **Capabilities** tab lists the server's tools — you can call the API
directly.

The `/spec` endpoint is **authenticated**, so calling it directly needs a service
token. For local testing, add a scoped static token:

```yaml
# app-config.local.yaml
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: ${MCP_SPEC_TOKEN} # any sufficiently long secret
          subject: mcp-capabilities-curl
        accessRestrictions:
          - plugin: mcp-capabilities
```

```sh
curl -H "Authorization: Bearer $MCP_SPEC_TOKEN" \
  'http://localhost:7007/api/mcp-capabilities/spec?entityRef=api:default/aws-docs'
```

## Limitations

- **Network reachability (backend egress).** Discovery runs from the Backstage
  **backend**, connecting _outbound_ to each server's `spec.remotes[].url`. Your
  backend must be able to reach every MCP server you register — servers on a
  private network, behind a VPN, or firewalled need a route (VPC/peering,
  allow-listed egress, or an HTTP proxy). The browser never connects to the MCP
  server directly, so this is a backend-egress concern, not a CORS one.
- **Slow or unreachable servers.** Discovery is time-boxed (30s). A server that
  is unreachable or times out returns an error that the Capabilities tab
  surfaces.
- **Per-request auth to remotes.** Remotes requiring signed requests (e.g. AWS
  Bedrock AgentCore Gateway, SigV4) are not yet signed and will error from
  `/spec`. Per-remote auth is a possible future enhancement.

## Related plugins

`mcp-server` API entities in the catalog are exactly the kind of server list the
[`mcp-chat`](../../../mcp-chat/README.md) plugin configures.

## Development

`yarn start` in this directory runs the plugin standalone (see [`/dev`](./dev)).

## Exports

- default — the backend plugin (mounts the `/spec` router)

## Credits

Made at [EPAM](https://www.epam.com), with love for the community. ❤️
