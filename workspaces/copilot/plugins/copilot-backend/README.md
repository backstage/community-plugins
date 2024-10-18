# GitHub Copilot Plugin

This GitHub Copilot plugin integrates with Backstage to provide metrics and insights for members of your organization or enterprise.

## Installation

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

1. Add the `@backstage-community/plugin-copilot-backend` package to your backend:

   ```sh
   yarn --cwd packages/backend add @backstage-community/plugin-copilot-backend
   ```

2. In your `packages/backend/src/plugins/copilot.ts` file, add the following code:

   ```typescript
   import { TaskScheduleDefinition } from '@backstage/backend-tasks';
   import { createRouterFromConfig } from '@backstage-community/plugin-copilot-backend';

   export default async function createPlugin(): Promise<void> {
     const schedule: TaskScheduleDefinition = {
       frequency: { cron: '0 2 * * *' },
       timeout: { minutes: 15 },
       initialDelay: { seconds: 15 },
     };

     return createRouterFromConfig({ schedule });
   }
   ```

3. Integrate the plugin into the main backend router in `packages/backend/src/index.ts`:

   ```typescript
   import { createRouterFromConfig } from './plugins/copilot';

   async function main() {
     const env = createEnv('copilot');
     apiRouter.use('/copilot', await createRouterFromConfig(env));
   }
   ```

## Configuration

### Environment Variables

To configure the GitHub Copilot plugin, you need to set the following environment variables:

- **`copilot.host`**: The host URL for your GitHub Copilot instance (e.g., `github.com` or `github.enterprise.com`).
- **`copilot.enterprise`**: The name of your GitHub Enterprise instance (e.g., `my-enterprise`).
- **`copilot.organization`**: The name of your GitHub Organization (e.g., `my-organization`).

These variables are used to configure the plugin and ensure it communicates with the correct GitHub instance.

### GitHub Credentials

**Important:** The GitHub token, necessary for authentication, should be managed within your Backstage integrations configuration. Ensure that your GitHub integration in the Backstage configuration includes the necessary token for the `GithubCredentialsProvider` to function correctly.

### GitHub Token Scopes

To ensure the GitHub Copilot plugin operates correctly within your organization or enterprise, your GitHub access token must include specific scopes. These scopes grant the plugin the necessary permissions to interact with your GitHub organization and manage Copilot usage.

#### Required Scopes

1. **List Teams Endpoint**

   - **Scope Required:** `read:org`
   - **Purpose:** Allows the plugin to list all teams within your GitHub organization.

2. **Copilot Usage**
   - **Scopes Required - enterprise:** `manage_billing:copilot`, `read:enterprise`
   - **Scopes Required - organization:** `manage_billing:copilot`, `read:org`, or `read:enterprise`
   - **Purpose:** Enables the plugin to manage and monitor GitHub Copilot usage within your organization or/and enterprise.

#### How to Configure Token Scopes

1. **Generate a Personal Access Token (PAT):**
   - Navigate to [GitHub Personal Access Tokens](https://github.com/settings/tokens).
   - Click on **Generate new token**.
   - Select the scopes according to your needs

### YAML Configuration Example

```yaml
copilot:
  scheduler:
    frequency:
      hours: 2
    timeout:
      minutes: 2
    initialDelay:
      seconds: 15
  host: YOUR_GITHUB_HOST_HERE
  enterprise: YOUR_ENTERPRISE_NAME_HERE
  organization: YOUR_ORGANIZATION_NAME_HERE

integrations:
  github:
    - host: YOUR_GITHUB_HOST_HERE
      token: YOUR_GENERATED_TOKEN
```

### API Documentation

For more details on using the GitHub Copilot and Teams APIs, refer to the following documentation:

- [GitHub Teams API - List Teams](https://docs.github.com/en/rest/teams/teams?apiVersion=2022-11-28#list-teams)
- [GitHub Copilot API - Usage](https://docs.github.com/en/rest/copilot/copilot-usage?apiVersion=2022-11-28)

## Run

1. Start the backend:

   ```sh
   yarn start-backend
   ```

2. Verify the plugin is running by accessing `http://localhost:7007/api/copilot/health`.

## Links

- [GitHub Copilot Plugin Frontend](https://github.com/backstage/backstage/tree/master/plugins/copilot)
- [Backstage Homepage](https://backstage.io)
