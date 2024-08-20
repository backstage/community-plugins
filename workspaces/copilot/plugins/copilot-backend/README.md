# GitHub Copilot Plugin

This GitHub Copilot plugin integrates with Backstage to provide metrics and insights for members of your organization or enterprise.

## Installation

### New Backend System

To configure the plugin using the new backend system:

1. In the `packages/backend/src/index.ts` file, add the following:

   ```typescript
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();

   backend.add(import('@backstage-community/plugin-copilot'));

   backend.start();
   ```

### Old System

To install the plugin using the old method:

1. Add the `@backstage-community/plugin-copilot` package to your backend:

   ```sh
   yarn --cwd packages/backend add @backstage-community/plugin-copilot
   ```

2. In your `packages/backend/src/plugins/copilot.ts` file, add the following code:

   ```typescript
   import { TaskScheduleDefinition } from '@backstage/backend-tasks';
   import { createRouterFromConfig } from '@backstage-community/plugin-copilot';

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
     // Backend setup
     const env = createEnv('copilot');
     // Plugin registration
     apiRouter.use('/copilot', await createRouterFromConfig(env));
   }
   ```

## Configuration

### Environment Variables

To configure the GitHub Copilot plugin, you need to set the following environment variables:

- **`copilot.host`**: The host URL for your GitHub Copilot instance (e.g., `github.com` or `github.enterprise.com`).
- **`copilot.enterprise`**: The name of your GitHub Enterprise instance (e.g., `my-enterprise`).

These variables are used to configure the plugin and ensure it communicates with the correct GitHub instance.

### GitHub Credentials

**Important:** The GitHub token, which is necessary for authentication, should be managed within your Backstage integrations configuration. The token must be added to your GitHub integration settings, and the plugin will retrieve it through the `GithubCredentialsProvider`.

Ensure that your GitHub integration in the Backstage configuration includes the necessary token for the `GithubCredentialsProvider` to work correctly.

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
```

### Generating GitHub Copilot Token

To generate an access token for using GitHub Copilot:

- Visit [Generate GitHub Access Token](https://github.com/settings/tokens).
- Follow the instructions to create a new token with the `read:enterprise` scope.

### API Documentation

For more details on using the GitHub Copilot API:

- Refer to the [API documentation](https://docs.github.com/en/rest/copilot/copilot-usage?apiVersion=2022-11-28) for comprehensive information on available functionalities.

## Run

1. Start the backend:

   ```sh
   yarn start-backend
   ```

2. Verify the plugin is running by accessing `http://localhost:7007/api/copilot/health`.

## Links

- [GitHub Copilot Plugin Frontend](https://github.com/backstage/backstage/tree/master/plugins/copilot)
- [Backstage Homepage](https://backstage.io)
