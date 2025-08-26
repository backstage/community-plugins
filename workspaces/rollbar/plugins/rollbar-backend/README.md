# Rollbar Backend

Simple plugin that proxies requests to the [Rollbar](https://rollbar.com) API.

## Setup

1. Install the plugin using:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/backend add @backstage-community/plugin-rollbar-backend
   ```

2. In your `packages/backend/src/index.ts` make the following changes:

   ```diff
     import { createBackend } from '@backstage/backend-defaults';

     const backend = createBackend();

     // ... other feature additions

   + backend.add(import('@backstage-community/plugin-rollbar-backend'));

     // ...

     backend.start();
   ```

The following values are read from the configuration file.

```yaml
rollbar:
  accountToken: ${ROLLBAR_ACCOUNT_TOKEN}
```

> [!NOTE]
> The `ROLLBAR_ACCOUNT_TOKEN` environment variable must be set to a read
> access account token.

## Links

- [Frontend part of the plugin](https://github.com/backstage/community-plugins/tree/main/workspaces/rollbar/plugins/rollbar)
- [The Backstage homepage](https://backstage.io)
