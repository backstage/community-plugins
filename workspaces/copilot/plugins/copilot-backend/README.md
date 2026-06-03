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
- `copilot.enterprise`: Optional GitHub enterprise slug.
- `copilot.organization`: Optional GitHub organization slug.
- `copilot.schedule`: Optional Backstage scheduler configuration for recurring ingestion.
- `copilot.backfillFromDate`: Optional earliest V2 date to ingest. Must be `2025-10-10` or later. Default: `2025-10-10`.
- `copilot.backfillDelayMs`: Optional delay between per-day backfill requests. Default: `200`.
- `copilot.ingestTeams`: Optional flag that enables user and user-team ingestion so V2 team filtering can be derived. Default: `false`.

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
  defaultView: enterprise
  showLegacyView: true
```

`defaultView` and `showLegacyView` are consumed by the frontend plugin, but they commonly live in the same `copilot` config block.

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

The older schema and legacy read paths remain available during migration, but new data is written to the V2 tables.

### Historical Backfill

The V2 task runner performs gap-fill ingestion for missing days from `copilot.backfillFromDate` through yesterday.

GitHub's report API currently exposes historical data back to `2025-10-10`, which means existing users can backfill V2 data covering October 2025 onward.

Use `copilot.backfillDelayMs` to slow down day-by-day requests if you encounter rate pressure during historical ingestion.

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

### Legacy Endpoints

Legacy read endpoints remain mounted under `/api/copilot/legacy/*` while users validate V2 coverage and transition off the older dashboard.

## GitHub Credentials

GitHub supports different auth methods depending on which API you are using.

- Enterprise API: [only supports classic PAT tokens](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage?apiVersion=2022-11-28#get-a-summary-of-copilot-usage-for-enterprise-members)
- Organization API: [supports app tokens, classic PATs, and fine-grained PATs](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage?apiVersion=2022-11-28#get-a-summary-of-copilot-usage-for-organization-members)

This plugin supports both schemes and detects the best scheme based on which API scopes are configured.

## GitHub Token And App Scopes

To operate correctly, the GitHub credentials must include permissions that let the plugin read organization information and Copilot usage.

### Required Scopes

1. List Teams Endpoint

   Scope required: `read:org`

2. Copilot Usage

   Scopes required for enterprise: `manage_billing:copilot`, `read:enterprise`

   Scopes required for organization: `manage_billing:copilot`, `read:org`, or `read:enterprise`

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
