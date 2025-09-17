# Feedback Backend

This is feedback-backend plugin which provides Rest API to create feedbacks.

It is also responsible for creating JIRA tickets,

## Getting started

### Installation

Install the NPM Package

```bash
# From your backstage root directory
yarn workspace backend add @backstage-community/plugin-feedback-backend
```

#### Adding the plugin to the new backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(import('@backstage-community/plugin-feedback-backend'));

backend.start();
```

#### Adding the plugin to the legacy backend (`@backstage-community/plugin-feedback-backend@1.2.6` and lower)

1. Create a new file `packages/backend/src/plugins/feedback.ts` and add the following:

   ```ts title="packages/backend/src/plugins/feedback.ts"
   import { Router } from 'express';

   import { createRouter } from '@backstage-community/plugin-feedback-backend';

   import { PluginEnvironment } from '../types';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     return await createRouter({
       logger: env.logger,
       config: env.config,
       discovery: env.discovery,
     });
   }
   ```

2. Next we wire this into overall backend router by editing the `packages/backend/src/index.ts` file:

   ```ts title="packages/backend/src/index.ts"
   import feedback from './plugins/feedback';

   // ...
   async function main() {
     // ...
     const feedbackEnv = useHotMemoize(module, () => createEnv('feedback'));
     apiRouter.use('/feedback', await feedback(feedbackEnv));
   }
   ```

### Configurations

Add the following config in your `app-config.yaml` file.

```yaml
feedback:
  integrations:
    jira:
      # Under this object you can define multiple jira hosts
      - host: ${JIRA_HOST_URL}
        # Add your jira token along with Basic or Bearer type eg: Basic/Bearer <token>
        token: ${JIRA_TOKEN}
        # (optional) Due to GDPR limitations on jira cloud instances
        # set hostType: CLOUD to make api work
        # default value is SERVER
        hostType: CLOUD
        # (optional) When using a scoped API token with Jira cloud, provide the API host
        # in the format https://api.atlassian.com/ex/jira/<cloudId>
        # Defaults to the value of host if not set.
        apiHost: ${JIRA_API_HOST_URL}

    email:
      ## Email integration uses nodemailer to send emails
      host: ${EMAIL_HOST}
      port: ${EMAIL_PORT} # defaults to 587, if not found

      ## Email address of sender
      from: ${EMAIL_FROM}

      ## [optional] Authorization using user and password
      auth:
        user: ${EMAIL_USER}
        pass: ${EMAIL_PASS}

      # boolean, Set to false if port: 587
      secure: false

      # Path to ca certificate if required by mail server
      caCert: ${NODE_EXTRA_CA_CERTS}
```

### Set up frontend plugin

Follow instructions provided [feedback-plugin](../feedback/README.md)

### API reference

The API specifications file can be found at [docs/openapi3_0](./docs/openapi3_0.yaml)

### Running the plugin

Run `yarn workspace @backstage-community/plugin-feedback-backend start`.
