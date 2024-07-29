# GitHub Copilot Plugin

This GitHub Copilot plugin integrates with Backstage to provide metrics and insights for members of your organization or enterprise.

## Installation

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
   import { createRouter } from './plugins/copilot';

   async function main() {
     // Backend setup
     const env = createEnv('copilot');
     // Plugin registration
     apiRouter.use('/copilot', await createRouter(env));
   }
   ```

4. Start the backend:

   ```sh
   yarn start-backend
   ```

5. Verify the plugin is running by accessing `http://localhost:7007/api/copilot/health`.

### New Backend System

To configure the plugin using the new backend system:

1. In the `packages/backend/src/index.ts` file, add the following:

   ```typescript
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();

   backend.add(import('@backstage-community/plugin-copilot'));

   backend.start();
   ```

## Plugin Configuration

This plugin supports multiple configuration methods:

- **Default**: Uses predefined default settings.
- **Via Code**: Passes configurations directly in the code.
- **Via YAML**: Reads configurations from an `app-config.yaml` file.

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
  enterprise: YOUR_ENTERPRISE_NAME_HERE
  token: YOUR_GITHUB_COPILOT_TOKEN_HERE
```

### Generating GitHub Copilot Token

To generate an access token for using GitHub Copilot:

- Visit [Generate GitHub Access Token](https://github.com/settings/tokens).
- Follow the instructions to create a new token with the `read:enterprise` scope.

### API Documentation

For more details on using the GitHub Copilot API:

- Refer to the [API documentation](https://docs.github.com/en/rest/copilot/copilot-usage?apiVersion=2022-11-28) for comprehensive information on available functionalities.

## Links

- [GitHub Copilot Plugin Frontend](https://github.com/backstage/backstage/tree/master/plugins/copilot)
- [Backstage Homepage](https://backstage.io)