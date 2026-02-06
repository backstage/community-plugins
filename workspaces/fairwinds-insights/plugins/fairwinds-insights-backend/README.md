# Fairwinds Insights Backend

This backend plugin is primarily responsible for the following:

- Exposes HTTP API routes used by the [Fairwinds Insights frontend plugin](../fairwinds-insights/README.md) to show vulnerabilities, action items, and cost (MTD) for Backstage entities.
- Resolves entity → Fairwinds Insights **app-groups** via the catalog (annotation `insights.fairwinds.com/app-groups` or spec `app-groups` / `app-group`), then proxies requests to the Fairwinds Insights API with authentication and optional in-memory caching.

## Install

Add the backend plugin to your Backstage backend:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-fairwinds-insights-backend
```

## Configuration

Configure the plugin in `app-config.yaml` (or via environment variables). The frontend calls the backend; the backend uses these settings to talk to the Fairwinds Insights API.

```yaml
fairwindsInsights:
  apiUrl: ${INSIGHTS_URL} # optional; base Fairwinds Insights URL (default: https://insights.fairwinds.com)
  apiKey: ${INSIGHTS_TOKEN} # Bearer token for Insights API
  organization: ${INSIGHTS_ORGANIZATION}
  cacheTTL: 300 # optional; cache TTL in seconds (default: 300)
```

## Setup (New Backend System)

This plugin uses the [new backend system](https://backstage.io/docs/backend-system/). In `packages/backend/src/index.ts`:

```ts
const backend = createBackend();

// ... other plugins

backend.add(import('@backstage-community/plugin-fairwinds-insights-backend'));

backend.start();
```

No separate router wiring is needed; the plugin registers its routes on the shared HTTP router under the `fairwinds-insights` plugin scope.

## API Endpoints

All endpoints that take an entity require the query parameter `entityRef`. The backend looks up the entity in the catalog and uses its app-groups (from `insights.fairwinds.com/app-groups` or spec) to call the Insights API. Responses may include an `insightsUrl` linking to the corresponding Fairwinds Insights UI.

| Method | Path                                                      | Description                                                                                      |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| GET    | `/vulnerabilities?entityRef=...`                          | Vulnerability summaries and top lists (by title, severity, package).                             |
| GET    | `/action-items?entityRef=...&page=0&pageSize=25&...`      | Paginated action items list (supports `orderBy`, `Search`, `ReportType`, `Fixed`, `Resolution`). |
| GET    | `/action-item-filters?entityRef=...&Field=ReportType&...` | Filter options for action items (e.g. `ReportType` values).                                      |
| GET    | `/action-items/top?entityRef=...`                         | Top action items aggregated by severity, title, namespace, resource (for charts).                |
| GET    | `/costs-mtd-summary?entityRef=...`                        | Current and previous month-to-date cost from resources-total-costs.                              |

## Entity requirement

Entities must expose at least one **app-group** so the backend can scope Insights API requests:

- **Annotation (preferred):** `insights.fairwinds.com/app-groups`: comma-separated list of app-group names.
- **Fallback:** `spec['app-groups']` or `spec['app-group']` (string or comma-separated).

If no app-groups are found for the given `entityRef`, the backend returns `404` with a message that app-groups are required.

## Caching

The plugin uses an in-memory cache with TTL controlled by `fairwindsInsights.cacheTTL` (default 300 seconds). Cached data includes `vulnerabilities`, `action-items/top`, and `costs-mtd-summary`.
