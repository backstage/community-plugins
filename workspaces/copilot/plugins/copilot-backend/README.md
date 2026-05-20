# GitHub Copilot Plugin

This GitHub Copilot plugin integrates with Backstage to provide metrics and insights for members of your organization or enterprise.

## Installation

### Install Dependencies

Add the `@backstage-community/plugin-copilot-backend` package to your backend:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-copilot-backend
```

### New Backend System

To configure the plugin using the new backend system:

1. In the `packages/backend/src/index.ts` file, add the following:

   ```typescript
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();

   backend.add(import('@backstage-community/plugin-copilot-backend'));

   backend.start();
   ```

### Old System

To install the plugin using the old method:

1. In your `packages/backend/src/plugins/copilot.ts` file, add the following code:

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

1. Integrate the plugin into the main backend router in `packages/backend/src/index.ts`:

   ```typescript
   import { createRouterFromConfig } from './plugins/copilot';

   async function main() {
     const env = createEnv('copilot');
     apiRouter.use('/copilot', await createRouterFromConfig(env));
   }
   ```

## Configuration

### App Config

To configure the GitHub Copilot plugin, you need to set the following values in the app-config:

- **`copilot.host`**: The host URL for your GitHub Copilot instance (e.g., `github.com` or `github.enterprise.com`).
- **`copilot.enterprise`**: The name of your GitHub Enterprise instance (e.g., `my-enterprise`).
- **`copilot.organization`**: The name of your GitHub Organization (e.g., `my-organization`).

These variables are used to configure the plugin and ensure it communicates with the correct GitHub instance.

### GitHub Credentials

GitHub supports different auth methods depending on which scope you are configuring.

- **Enterprise** — The current implementation only supports **classic PAT tokens** for the enterprise scope. This is a known limitation; the underlying [GitHub API](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-usage-metrics) also supports GitHub App installation tokens, but that is not yet wired up in this plugin.
- **Organization** — Supports GitHub App tokens, classic PAT tokens, and fine-grained PAT tokens.

This plugin detects the best authentication scheme based on which API(s) you have configured for use.

### GitHub Token/App Scopes

To ensure the GitHub Copilot plugin operates correctly within your organization or enterprise, your GitHub access token must include specific scopes. These scopes grant the plugin the necessary permissions to interact with your GitHub organization and manage Copilot usage.

#### Required Scopes

1. **List Teams (GraphQL)**

   - **Scope required:** `read:org`
   - **Purpose:** Allows the plugin to list all teams within your GitHub organization or enterprise via the GraphQL API.

2. **Copilot Metrics — Enterprise**

   - **Classic PAT scopes required:** `manage_billing:copilot` or `read:enterprise`
   - **Fine-grained permission required:** `Enterprise Copilot metrics` (read)
   - **Purpose:** Fetches the 28-day rolling usage metrics report for the enterprise.
   - **API reference:** [Get Copilot enterprise usage metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-usage-metrics)

3. **Copilot Metrics — Organization**

   - **Classic PAT scope required:** `read:org`
   - **Fine-grained permission required:** `Organization Copilot metrics` (read)
   - **GitHub App permission required:** `Organization Copilot metrics` (read)
   - **Purpose:** Fetches the 28-day rolling usage metrics report for the organization.
   - **API reference:** [Get Copilot organization usage metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-usage-metrics)

4. **Copilot Seats — Enterprise**

   - **Classic PAT scopes required:** `manage_billing:copilot` or `read:enterprise`
   - **Purpose:** Fetches seat assignment data for seat-utilization analysis.

5. **Copilot Seats — Organization**

   - **Classic PAT scopes required:** `manage_billing:copilot` or `read:org`
   - **GitHub App permission required:** `GitHub Copilot Business` (read)
   - **Purpose:** Fetches seat assignment data for seat-utilization analysis.

> **Note:** For the "Copilot usage metrics" policy to be in effect, it must be set to **Enabled everywhere** in your enterprise settings. See [Managing policies and features for GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies#defining-policies-for-your-enterprise).

#### How to Configure Token Scopes

**Generate a Personal Access Token (PAT) — Enterprise requires a "classic" PAT**

- Navigate to [GitHub Personal Access Tokens](https://github.com/settings/tokens).
- Click on **Generate new token**.
- Select the scopes according to your needs.

**Using a GitHub App (organization only)**

- Create or reuse an existing GitHub App that you own.
- Navigate to the app permissions.
- Grant `Organization Copilot metrics` (read) and `Members` (read) permissions and save.
- Install the app into your organization and approve the permissions.

### YAML Configuration Example

```yaml
copilot:
  schedule:
    frequency:
      hours: 2
    timeout:
      minutes: 2
    initialDelay:
      seconds: 15
  host: YOUR_GITHUB_HOST_HERE
  enterprise: YOUR_ENTERPRISE_NAME_HERE
  organization: YOUR_ORGANIZATION_NAME_HERE

# Using a PAT (required for enterprise; also works for organization)
integrations:
  github:
    - host: YOUR_GITHUB_HOST_HERE
      token: YOUR_GENERATED_TOKEN

# Using a GitHub App (organization only)
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

[You can find more about the integrations config in the official docs](https://backstage.io/docs/integrations/github/locations/)

### Metrics API

This plugin uses the GitHub Copilot **report-based metrics API** (API version `2026-03-10`). For each configured enterprise or organization, it fetches the latest 28-day rolling metrics report, which is provided as one or more signed JSON download links.

#### Endpoints used

| Scope              | Endpoint                                                                         |
| ------------------ | -------------------------------------------------------------------------------- |
| Enterprise         | `GET /enterprises/{enterprise}/copilot/metrics/reports/enterprise-28-day/latest` |
| Organization       | `GET /orgs/{org}/copilot/metrics/reports/organization-28-day/latest`             |
| Enterprise seats   | `GET /enterprises/{enterprise}/copilot/billing/seats`                            |
| Organization seats | `GET /orgs/{org}/copilot/billing/seats`                                          |

The metrics endpoints return an object with `download_links` (signed URLs to JSON report files) and `report_start_day` / `report_end_day`. Each downloaded file contains aggregated day-level totals in the `day_totals` array.

> **Historical data:** Report files are available from **October 10, 2025** onwards. Earlier data cannot be retrieved via this API.

For full details on the API, see:

- [Get Copilot enterprise usage metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-usage-metrics)
- [Get Copilot organization usage metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-usage-metrics)
- [Example metrics schema](https://docs.github.com/en/copilot/reference/copilot-usage-metrics/example-schema)
- [GitHub Teams API - List Teams (GraphQL)](https://docs.github.com/en/graphql/reference/objects#team)

### Metrics mapping and known limitations

The plugin maps the report API's flat aggregation format into the internal database schema. Some nuances to be aware of:

| Area                                                     | Behaviour                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `total_active_users` / `total_engaged_users`             | Both are mapped to `daily_active_users` (falling back to `monthly_active_users`). The new API does not provide a separate "engaged" count at the top level, so these two fields will be identical.                                   |
| IDE chat engaged users                                   | Mapped from `monthly_active_chat_users`, which is a rolling 28-day aggregate rather than a daily count.                                                                                                                              |
| Editor name for model-level rows                         | The new schema does not nest models under editors, so the `editor` column is stored as `'unknown'` in `ide_completions_language_editors_model` and `ide_chat_editors_model`.                                                         |
| `total_chat_copy_events` / `total_chat_insertion_events` | Not present in the new schema; stored as `0`.                                                                                                                                                                                        |
| `dotcom_chats` / `dotcom_prs` tables                     | These tables exist in the database (from a prior migration) but are **not populated** by the current implementation because the new report schema does not expose dotcom chat or pull-request data as separate top-level aggregates. |
| CLI and agent metrics                                    | Fields such as `totals_by_cli`, `daily_active_cli_users`, and `monthly_active_agent_users` are present in the raw report but are not yet captured in the database schema.                                                            |
| PR metrics                                               | The report includes pull-request data (`pull_requests.*`) that is not yet captured.                                                                                                                                                  |
| Deletion activity                                        | `loc_deleted_sum` and `loc_suggested_to_delete_sum` are present in the raw report but not yet stored.                                                                                                                                |

## Run

1. Start the backend:

   ```sh
   yarn start-backend
   ```

2. Verify the plugin is running by accessing `http://localhost:7007/api/copilot/health`.

## Links

- [GitHub Copilot Plugin Frontend](https://github.com/backstage/community-plugins/tree/main/workspaces/copilot/plugins/copilot)
- [Backstage Homepage](https://backstage.io)
