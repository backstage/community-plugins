# Confluence Search Backend Module

This plugin provides the `ConfluenceCollatorFactory`, which can be used in the search backend to index Confluence space documents to your Backstage Search.

## Installation

Add the module package as dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-search-backend-module-confluence-collator
```

In your `packages/backend/src/index.ts`, Add the collator to your backend instance, along with the search plugin itself:

```tsx
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-search-backend'));
backend.add(
  import(
    '@backstage-community/plugin-search-backend-module-confluence-collator'
  ),
);
backend.start();
```

To display Confluence search results in your frontend, install the [`@backstage-community/plugin-confluence`](https://github.com/backstage/community-plugins/tree/main/workspaces/confluence/plugins/confluence) plugin.

## Configuration

### Confluence Cloud

There are several ways to authenticate with Confluence Cloud:

#### Personal API Token (classic / unscoped)

The simplest option. Create a [Personal Access Token (PAT)](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) with `Read` permissions. The token value should be the raw token — it will be encoded for you.

```yaml
confluence:
  baseUrl: 'https://<your-domain>.atlassian.net/wiki'
  auth:
    type: 'basic'
    token: ${CONFLUENCE_TOKEN}
    email: '<your-atlassian-account-email>'
  spaces: ['SPACE1', 'SPACE2'] # Recommended: limits indexing to specific spaces
```

#### Personal Scoped API Token

[Scoped API tokens](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/#Create-an-API-token-with-scopes) allow limiting the permissions of the token.

> **Important:** Scoped tokens require a different `baseUrl` — `https://api.atlassian.com/ex/confluence/<your-cloud-id>/wiki` instead of `https://<your-domain>.atlassian.net/wiki`. You can find your `cloudId` by visiting `https://<your-domain>.atlassian.net/_edge/tenant_info`.

The required scopes are:

- `read:confluence-content.all`
- `read:confluence-content.summary`
- `read:confluence-space.summary`
- `search:confluence`

```yaml
confluence:
  baseUrl: 'https://api.atlassian.com/ex/confluence/<your-cloud-id>/wiki'
  auth:
    type: 'basic'
    token: ${CONFLUENCE_SCOPED_TOKEN}
    email: '<your-atlassian-account-email>'
  spaces: ['SPACE1', 'SPACE2'] # Recommended: limits indexing to specific spaces
```

#### Service Account Scoped API Token

For production use, a [service account](https://support.atlassian.com/organization-administration/docs/manage-api-tokens-for-service-accounts/) is recommended over a personal token, as it is not tied to an individual user. Create a service account in your Atlassian organization and generate a scoped API token for it with the same scopes listed above.

```yaml
confluence:
  baseUrl: 'https://api.atlassian.com/ex/confluence/<your-cloud-id>/wiki'
  auth:
    type: 'basic'
    token: ${CONFLUENCE_SERVICE_ACCOUNT_TOKEN}
    email: '<generated-id>@serviceaccount.atlassian.com'
  spaces: ['SPACE1', 'SPACE2'] # Recommended: limits indexing to specific spaces
```

### Confluence Self-Hosted (Server / Data Center)

#### Personal Access Token

Create a [Personal Access Token (PAT)](https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html) in your Confluence Server or Data Center instance.

```yaml
confluence:
  baseUrl: 'https://<your-confluence-host>'
  auth:
    type: 'bearer'
    token: ${CONFLUENCE_TOKEN}
  spaces: ['SPACE1', 'SPACE2'] # Recommended: limits indexing to specific spaces
```

> **Tip:** For production use, create a dedicated Confluence user for API access rather than using a personal account. Generate a PAT for that user with the configuration above.

#### Username and Password

```yaml
confluence:
  baseUrl: 'https://<your-confluence-host>'
  auth:
    type: 'userpass'
    username: ${CONFLUENCE_USERNAME}
    password: ${CONFLUENCE_PASSWORD}
  spaces: ['SPACE1', 'SPACE2'] # Recommended: limits indexing to specific spaces
```

### Common Options

#### Spaces and Query Filtering

It is highly recommended to list the spaces you want to index, otherwise all spaces will be indexed. You can also use a [CQL query](https://developer.atlassian.com/server/confluence/advanced-searching-using-cql) for more precise filtering.

```yaml
confluence:
  # ...
  spaces: ['SPACE1', 'SPACE2'] # Recommended: limits indexing to specific spaces
  query: 'type = page'
  maxRequestsPerSecond: 5
```

**Behavior of `spaces` and `query`:**

- If both are provided, they are combined with `AND`. For example, `spaces: ["SPACE1", "SPACE2"]` and `query: "type = page"` produces `(space="SPACE1" or space="SPACE2") and (type = page)`.
- If only `spaces` is provided, only pages from those spaces will be indexed.
- If only `query` is provided, the query is applied to all accessible spaces.
- If neither is provided, the default CQL is `type IN (page, blogpost, comment, attachment)` across all accessible spaces.

#### Document Caching

Documents can be cached by setting `documentCacheEnabled: true`. The cache key includes the document version, so you can set a long `documentCacheTtl` if your cache storage allows it.

```yaml
confluence:
  # ...
  documentCacheEnabled: true
  documentCacheTtl: '24h'
```

> Note: Search queries are not cached.

#### Search Schedule

By default the indexing runs every two hours. To customize:

```yaml
search:
  collators:
    confluence:
      schedule:
        frequency:
          minutes: 45
        timeout:
          minutes: 3
        initialDelay:
          seconds: 3
```

## Multiple Instances

To index multiple Confluence instances, nest each instance under a named key instead of using the flat format shown above.

```yaml
confluence:
  default:
    baseUrl: 'https://api.atlassian.com/ex/confluence/<cloud-id-1>/wiki'
    auth:
      type: 'basic'
      token: ${CONFLUENCE_TOKEN_1}
      email: '<email-for-instance-1>'
    spaces: ['SPACE1', 'SPACE2']
  secondary:
    baseUrl: 'https://api.atlassian.com/ex/confluence/<cloud-id-2>/wiki'
    auth:
      type: 'basic'
      token: ${CONFLUENCE_TOKEN_2}
      email: '<email-for-instance-2>'
    spaces: ['SPACE3']
```

To display results from each instance separately in the frontend, see the [`@backstage-community/plugin-confluence` README](https://github.com/backstage/community-plugins/tree/main/workspaces/confluence/plugins/confluence).

## Special thanks & Disclaimer

Thanks to K-Phoen for creating the confluence plugin found [here](https://github.com/K-Phoen/backstage-plugin-confluence). As an outcome
of [this discussion](https://github.com/K-Phoen/backstage-plugin-confluence/issues/193), he gave us permission to keep working on this plugin.
