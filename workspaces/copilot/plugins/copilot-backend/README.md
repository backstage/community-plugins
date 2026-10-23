# GitHub Copilot Plugin

This backend plugin integrates GitHub Copilot metrics with Backstage for organization and enterprise reporting.

The backend now ingests data through GitHub's report-based Copilot metrics API and stores the results in V2 plugin tables. Legacy read endpoints remain available during migration, but V2 is the primary ingestion path going forward.

## Installation

### Install Dependencies

Add the `@backstage-community/plugin-copilot-backend` package to your backend:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-copilot-backend
```

### New Backend System

To configure the plugin using the new backend system:

1. In `packages/backend/src/index.ts`, add the plugin:

   ```typescript
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();

   backend.add(import('@backstage-community/plugin-copilot-backend'));

   backend.start();
   ```

### Old System

To install the plugin using the legacy backend system:

1. In `packages/backend/src/plugins/copilot.ts`, add:

   ```typescript
   import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
   import { createRouterFromConfig } from '@backstage-community/plugin-copilot-backend';

   export default async function createPlugin(): Promise<void> {
     const schedule: SchedulerServiceTaskScheduleDefinition = {
       frequency: { cron: '0 2 * * *' },
       timeout: { minutes: 15 },
       initialDelay: { seconds: 15 },
     };

     return createRouterFromConfig({ schedule });
   }
   ```

2. Integrate the plugin into the main backend router in `packages/backend/src/index.ts`:

   ```typescript
   import { createRouterFromConfig } from './plugins/copilot';

   async function main() {
     const env = createEnv('copilot');
     apiRouter.use('/copilot', await createRouterFromConfig(env));
   }
   ```

## Configuration

### App Config

Configure the following `app-config.yaml` values:

- `copilot.host`: GitHub host for the integration, such as `github.com`.
- `copilot.apiBaseUrl`: Optional override for the base URL of the GitHub REST API. Falls back to `apiBaseUrl` on the matching `integrations.github` entry, then to `https://api.github.com`.
- `copilot.enterprise`: Optional GitHub enterprise slug.
- `copilot.organization`: Optional GitHub organization slug.
- `copilot.schedule`: Optional Backstage scheduler configuration for recurring ingestion.
- `copilot.backfillFromDate`: Optional earliest V2 date to ingest. Must be `2025-10-10` or later. Default: `2025-10-10`.
- `copilot.backfillDelayMs`: Optional delay between per-day backfill requests. Default: `200`.
- `copilot.ingestTeams`: Optional flag that enables user and user-team ingestion for V2 team filtering. The setting is also frontend-visible so the dashboard can expose the Team filter target. Default: `false`.
- `copilot.ingestCostCenters`: Optional flag that enables enterprise cost-center ingestion and organization cost-center reporting when both `copilot.enterprise` and `copilot.organization` are configured. The setting is also frontend-visible so the dashboard can expose the Cost center filter target. Default: `false`.

At least one of `copilot.enterprise` or `copilot.organization` must be configured.

Example:

```yaml
copilot:
  schedule:
    frequency:
      hours: 2
    timeout:
      minutes: 15
    initialDelay:
      seconds: 15
  host: github.com
  enterprise: my-enterprise
  organization: my-organization
  backfillFromDate: 2025-10-10
  backfillDelayMs: 200
  ingestTeams: true
  ingestCostCenters: true
  defaultView: enterprise
  showLegacyView: true
```

`defaultView` and `showLegacyView` are consumed by the frontend plugin, but they commonly live in the same `copilot` config block.

### Cost Centers

Set `copilot.ingestCostCenters: true` to enable cost-center ingestion for the enterprise view. Organization-view cost centers are also available when both `copilot.enterprise` and `copilot.organization` are configured; organization-only configurations continue to ingest without cost centers and log a warning. Cost-center memberships are resolved from enterprise-level resources and applied to each scope's per-user metrics. Cost-center ingestion fetches the per-user report itself, so `copilot.ingestTeams` is not required for cost-center filtering. `copilot.ingestTeams` independently controls team membership ingestion.

The V2 dashboard filters by either cost center or team, never both. When both settings are enabled for the current view, it shows a `Filter by` toggle button group (`Cost center | Team`, defaulting to Team) and only the selected target's dropdown. Changing targets clears the previous selection. A successful empty list disables that target's toggle button with an explanation; if the selected target is empty and the other has options, the dashboard falls back to the other target. If both lists are empty, Cost center remains selected with an enabled empty dropdown, while both toggle buttons are disabled.

Membership comes from GitHub cost-center resources: direct `User`, enterprise `Team`, or `Org`; repository resources are ignored. Each user is attributed to at most one cost center, in this order: direct user, enterprise team, then organization. Among teams, the earlier `created_at` wins when both dates are available. If dates tie or either is unavailable, the lower numeric team ID wins, then case-insensitive resource name. Organization ties use case-insensitive organization name. Remaining ties use the lexically lower cost-center ID. Users without a matching resource appear as **No cost center**.

Named cost centers are listed or queryable only when at least five distinct users have Copilot data over the selected date range. The **No cost center** listing flag uses that range, while its dashboard applies the threshold only to complete daily rows returned within the requested range; rolling lookback users contribute to displayed rolling counts, but not eligibility.

Days whose roster could not be fully resolved are omitted from the **No cost center** view, and their data is excluded from rolling-user counts and threshold checks.

When all relevant organization rosters are readable, users without a matching resource appear as **No cost center**. If a cost-center organization resource has no GitHub App installation, that resource is skipped with a warning and other cost centers continue to ingest. Because its members cannot be identified, no-cost-center results are withheld for affected days; the other named cost centers remain available. Previously complete days are retained if an organization installation later disappears; only newly aggregated days use the incomplete roster state. Permission or transient failures for an installed organization fail the whole snapshot and preserve existing data. A direct user resource that returns 404 is skipped because it cannot contribute metrics; other user-lookup failures fail closed.

The cost-center listing response contains real cost centers in `costCenters`
and reports the unassigned-user threshold separately in
`hasUsersWithoutCostCenter`; no cost-center ID is reserved. The dashboard's
unassigned scope is served by `GET /v2/no-cost-center/dashboard`, which accepts
`type`, `entityId`, `from`, and `to` only. Other metric and dashboard filters
accept real cost-center IDs only, including IDs that resemble former
implementation markers.

GitHub does not provide historical cost-center membership. Each ingested day uses the membership snapshot fetched at that time; backfilling existing per-user data applies the current snapshot to those historical days. GitHub's per-user and team reports cover roughly a rolling year, so newly enabled user, team, and cost-center data is backfilled only within that window. Older totals-only records remain unchanged and are not retried.

For expired native team-report days, `/v2/backfill/status` omits `teams` from `components_loaded` while preserving the successful totals status.

Detailed CLI and VS Code Agent breakdowns are not available for cost-center views, as with team views.

Cost-center dashboard breakdowns retain the ten highest-ranked named values
per day and combine the remaining additive report counters into `others`.
Pair breakdowns rank full pairs. These breakdown tables contain additive
counters rather than distinct-user, average, or median fields; PR median
metrics are not bucketed. Full breakdown detail remains stored in the database.

### GitHub Enterprise Cloud With Data Residency (GHE.com)

If your enterprise is hosted on a dedicated GHE.com subdomain, point the integration at that subdomain and set its `apiBaseUrl` to the tenant's API host:

```yaml
integrations:
  github:
    - host: octocorp.ghe.com
      apiBaseUrl: https://api.octocorp.ghe.com
      token: ${GITHUB_TOKEN}

copilot:
  host: octocorp.ghe.com
  enterprise: octocorp
```

`copilot.apiBaseUrl` is only needed if you want the plugin to use a different API host than the rest of Backstage. Note that Backstage only defaults `apiBaseUrl` for `github.com`, so on any other host you must set it in one place or the other — otherwise the plugin falls back to the public `https://api.github.com`.

To keep a token with enterprise scopes away from the rest of Backstage, for example when everything else authenticates as a GitHub App, put it on a separate integration entry for the API host and point `copilot.host` at that entry:

```yaml
integrations:
  github:
    - host: octocorp.ghe.com
      apiBaseUrl: https://api.octocorp.ghe.com
      apps:
        - $include: github-app-credentials.yaml
    - host: api.octocorp.ghe.com
      apiBaseUrl: https://api.octocorp.ghe.com
      token: ${COPILOT_TOKEN}

copilot:
  host: api.octocorp.ghe.com
  enterprise: octocorp
```

Report documents are downloaded from signed URLs. GitHub serves those from `copilot-reports.github.com`, or `copilot-reports.SUBDOMAIN.ghe.com` on GHE.com, and documents a fallback to Azure Blob Storage. The plugin only follows such links over HTTPS, and only to the configured `copilot.host` and its subdomains, to `githubusercontent.com` and its subdomains, or to the documented object storage hosts. When the API base URL is `https://api.SUBDOMAIN.ghe.com`, `SUBDOMAIN.ghe.com` and its subdomains are allowed too. Redirects are re-checked against the same rules on every hop.

### Why V2 Exists

GitHub replaced the older direct Copilot metrics endpoints with a report-envelope API based on signed download URLs and GitHub API version `2026-03-10`.

The backend now:

1. Requests report links from GitHub.
2. Downloads JSON and NDJSON report documents from signed URLs.
3. Parses those documents into V2 storage tables.
4. Serves the V2 dashboard and operator backfill APIs from those tables.

This migration was required to keep the plugin aligned with the current GitHub Copilot metrics design.

### Storage Changes

New V2 data is stored in plugin-owned tables aligned with the new GitHub report format, including:

- `copilot_daily_totals`
- `copilot_pr_metrics`
- `copilot_metrics_by_feature`
- `copilot_metrics_by_ide`
- `copilot_metrics_by_language_feature`
- `copilot_metrics_by_model_feature`
- `copilot_metrics_by_language_model`
- `copilot_metrics_by_cli`
- `copilot_user_metrics`
- `copilot_user_teams`
- `copilot_ingestion_log`
- `copilot_customization_metrics`
- `copilot_customization_summaries`

The older schema and legacy read paths remain available during migration, but new data is written to the V2 tables.

### Named Customization Metrics

The V2 dashboard includes a **Customizations** tab for named Copilot skills,
custom agents, MCP servers, slash commands, plugins, and compatible future
categories returned by GitHub. The backend discovers compatible
`totals_by_*` report arrays dynamically, so newly added categories do not
need a plugin database migration.

Named values are shown as GitHub reports them. GitHub may retain `other` or
`custom` buckets for unavailable names, and it only provides configured names
for reports processed from 2026-10-22 onward. Review customization names
before granting dashboard access outside the organization. Team and individual
customization views require `copilot.ingestTeams: true`; team views omit
distinct-item counts because capped per-user report entries cannot be combined
into an exact team-wide distinct count.

### Historical Backfill

The V2 task runner performs gap-fill ingestion for missing days from `copilot.backfillFromDate` through yesterday.

GitHub's report API currently exposes historical data from `2025-10-10` up to a rolling year. When enabling user, team, or cost-center ingestion after an upgrade, only missing components within that window are backfilled; existing totals-only data outside it is retained.

Use `copilot.backfillDelayMs` to slow down day-by-day requests if you encounter rate pressure during historical ingestion.

When upgrading to a version with customization metrics, the database migration
automatically re-ingests successful report days from 2026-10-22 onward so
named values are populated without a manual backfill.

### Manual Backfill Endpoints

The backend exposes V2 operator endpoints for manual historical ingestion:

- `POST /api/copilot/v2/backfill`
- `GET /api/copilot/v2/backfill/status`

Example backfill request:

```json
{
  "fromDate": "2025-10-10",
  "toDate": "2025-10-31",
  "type": "enterprise",
  "entityId": "my-enterprise"
}
```

The backfill request returns `202 Accepted` and starts processing asynchronously.

### Individual ("Me") Metrics

The backend also exposes a privacy-scoped endpoint for an individual, signed-in
user's own Copilot metrics, consumed by the individual ("me") metrics view
mounted by the `@backstage-community/plugin-copilot` frontend plugin:

- `GET /api/copilot/v2/me/dashboard`

This endpoint **never accepts a user or team identifier** — the caller's
GitHub login is always resolved server-side from their own request
credentials, so it is impossible to request another user's data through this
route. If the caller cannot be matched to any ingested Copilot data, the
endpoint returns `{ "matched": false }` (HTTP 200) rather than an error.

Requires `copilot.ingestTeams: true` (per-user breakdown data is only
ingested when that flag is enabled).

By default, the backend reads the caller's `github.com/user-login` annotation
from their catalog entity and uses that value as their GitHub login. This
avoids incorrectly matching users with the same entity name in different
namespaces. If the entity is inaccessible or does not have this annotation,
the endpoint returns `{ "matched": false }`.

To use another trusted identity source, register a custom resolver via the
`copilotUserResolverExtensionPoint`:

```typescript
import { createBackendModule } from '@backstage/backend-plugin-api';
import { copilotUserResolverExtensionPoint } from '@backstage-community/plugin-copilot-backend';

export const copilotCustomUserResolverModule = createBackendModule({
  pluginId: 'copilot',
  moduleId: 'custom-user-resolver',
  register(reg) {
    reg.registerInit({
      deps: { userResolver: copilotUserResolverExtensionPoint },
      async init({ userResolver }) {
        userResolver.setUserResolver({
          async resolveUserLogin({ userEntityRef, credentials, services }) {
            const entity = await services.catalog.getEntityByRef(
              userEntityRef,
              { credentials },
            );
            return entity?.metadata.annotations?.['github.com/user-login'];
          },
        });
      },
    });
  },
});
```

### Legacy Endpoints

Legacy read endpoints remain mounted under `/api/copilot/legacy/*` while users validate V2 coverage and transition off the older dashboard.

## GitHub Credentials

GitHub supports different auth methods depending on which API you are using.

- Enterprise and organization APIs: [Copilot usage metrics REST API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics)

This plugin uses the report-based API and supports both credential types. Authentication is configured via the integrations config in your app-config.

## Required GitHub Permissions

GitHub requires scope-specific permissions for the report-based Copilot metrics endpoints. These permissions are in addition to any access required by other plugin features.

### Organization reports

The GitHub App must be installed on the organization and granted the organization-level **Organization Copilot metrics: read** permission. Classic PATs require the `read:org` scope.

The organization per-user (`users-1-day`) and user-teams (`user-teams-1-day`) reports require this access. HTTP 403 or 404 responses are logged at ERROR level and do not stop other ingestion. If the per-user report is denied, organization team and organization-scope cost-center data will not sync; if the user-teams report is denied, team data will not sync. See GitHub's [Copilot usage metrics REST API documentation](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics) for the current permission names.

### Enterprise reports

GitHub Apps need the enterprise-level **Enterprise Copilot metrics: read** permission. Classic PATs require either `manage_billing:copilot` or `read:enterprise`.

### GitHub App Example

```yaml
integrations:
  github:
    - host: github.com
      apps:
        - appId: YOUR_APP_ID
          allowedInstallationOwners:
            - YOUR_ORG_NAME
          clientId: CLIENT_ID
          clientSecret: CLIENT_SECRET
          webhookSecret: WEBHOOK_SECRET
          privateKey: PRIVATE_KEY
```

### PAT Example

```yaml
integrations:
  github:
    - host: github.com
      token: YOUR_GENERATED_TOKEN
```

[You can find more about the integrations config in the official docs](https://backstage.io/docs/integrations/github/locations/)

### Cost centers

With `copilot.ingestCostCenters` enabled, cost-center and enterprise-team lookups use the credential selected for `copilot.enterprise` (an enterprise-installed App or PAT). Organization per-user reports continue to use the credential selected for `copilot.organization`. The enterprise credential needs the following additional access, depending on its type:

- **GitHub App:** install the App on the enterprise with **Enterprise Copilot metrics: read**, **Enterprise teams: read**, and **Enterprise billing: read**. Also install it on each organization included as a cost-center `Org` resource, with **Members: read**.
- **Classic PAT:** `read:enterprise` to read cost centers and enterprise teams, and `read:org` to read members of organizations included as cost-center `Org` resources.

If an organization roster, enterprise-team list or membership, or direct-user lookup cannot be resolved, the snapshot is marked incomplete. No cost-center memberships or aggregates are replaced for any affected day, and the next ingestion run retries. An empty or unverifiable organization roster also blocks the snapshot; for fine-grained PATs, a missing scopes header means roster completeness cannot be verified. A direct `User` resource that returns HTTP 404 is the exception: it is treated as permanently unresolvable and skipped because that user cannot contribute metrics. Other direct-user lookup failures, including permission and transient errors, block the snapshot.

## Run

1. Start the backend:

   ```sh
   yarn start-backend
   ```

2. Verify the plugin is running by accessing `http://localhost:7007/api/copilot/health`.

## Migration Guide

Existing users upgrading from the older dashboard and data model should follow [../../docs/copilot-v2-migration-guide.md](../../docs/copilot-v2-migration-guide.md).

## Links

- [GitHub Copilot Plugin Frontend](https://github.com/backstage/community-plugins/tree/main/workspaces/copilot/plugins/copilot)
- [Backstage Homepage](https://backstage.io)
