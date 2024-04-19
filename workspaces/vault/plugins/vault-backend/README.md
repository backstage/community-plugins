# @backstage-community/plugin-vault-backend

A backend for [Vault](https://www.vaultproject.io/), this plugin adds a few routes that are used by the frontend plugin to fetch the information from Vault.

## Introduction

Vault is an identity-based secrets and encryption management system. A secret is anything that you want to tightly control access to, such as API encryption keys, passwords, or certificates. Vault provides encryption services that are gated by authentication and authorization methods.

This plugins allows you to view all the available secrets at a certain location, and redirect you to the official UI so backstage can rely on LIST permissions, which is safer.

## Getting started

To get started, first you need a running instance of Vault. You can follow [this tutorial](https://learn.hashicorp.com/tutorials/vault/getting-started-intro?in=vault/getting-started) to install vault and start your server locally.

1. When your Vault instance is up and running, then you will need to install the plugin into your app:

   ```bash
     # From your Backstage root directory
     yarn --cwd packages/backend add @backstage-community/plugin-vault-backend
   ```

2. Create a file in `src/plugins/vault.ts` and add a reference to it in `src/index.ts`:

   ```typescript
   // In packages/backend/src/plugins/vault.ts
   import { createRouter } from '@backstage-community/plugin-vault-backend';
   import { Router } from 'express';
   import { PluginEnvironment } from '../types';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     return await createRouter({
       logger: env.logger,
       config: env.config,
       scheduler: env.scheduler,
     });
   }
   ```

   ```diff
   diff --git a/packages/backend/src/index.ts b/packages/backend/src/index.ts
   index f2b14b2..2c64f47 100644
   --- a/packages/backend/src/index.ts
   +++ b/packages/backend/src/index.ts
   @@ -22,6 +22,7 @@ import { Config } from '@backstage/config';
    import app from './plugins/app';
   +import vault from './plugins/vault';
    import scaffolder from './plugins/scaffolder';
   @@ -56,6 +57,7 @@ async function main() {
      const authEnv = useHotMemoize(module, () => createEnv('auth'));
   +  const vaultEnv = useHotMemoize(module, () => createEnv('vault'));
      const proxyEnv = useHotMemoize(module, () => createEnv('proxy'));
   @@ -63,6 +65,7 @@ async function main() {

      const apiRouter = Router();
      apiRouter.use('/catalog', await catalog(catalogEnv));
   +  apiRouter.use('/vault', await vault(vaultEnv));
      apiRouter.use('/scaffolder', await scaffolder(scaffolderEnv));
   ```

3. Add some extra configurations in your [`app-config.yaml`](https://github.com/backstage/backstage/blob/master/app-config.yaml).

   ```yaml
   vault:
     baseUrl: http://your-internal-vault-url.svc
     publicUrl: https://your-vault-url.example.com
     token: <VAULT_TOKEN>
     secretEngine: 'customSecretEngine' # Optional. By default it uses 'secrets'. Can be overwritten by the annotation of the entity
     kvVersion: <kv-version> # Optional. The K/V version that your instance is using. The available options are '1' or '2'
     schedule: # Optional. If the token renewal is enabled this schedule will be used instead of the hourly one
       frequency: { hours: 1 }
       timeout: { hours: 1 }
   ```

4. Get a `VAULT_TOKEN` with **LIST** permissions, as it's enough for the plugin. You can check [this tutorial](https://learn.hashicorp.com/tutorials/vault/tokens) for more info.

5. If you also want to use the `renew` functionality, you need to attach the following block to your custom policy, so that Backstage can perform a token-renew:
   ```
     # Allow tokens to renew themselves
     path "auth/token/renew-self" {
       capabilities = ["update"]
     }
   ```

## New Backend System

The Vault backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
+ backend.add(import('@backstage-community/plugin-vault-backend');
  backend.start();
```

The token renewal is enabled automatically in the new backend system depending on the `app-config.yaml`. If the `schedule` is not defined there, no
task will be executed. If you want to use the default renewal scheduler (which runs hourly), set `schedule: true`. In case you want a custom schedule
just use a configuration like the one set above.

## Integration with the Catalog

The plugin can be integrated into each Component in the catalog. To allow listing the available secrets a new annotation must be added to the `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    vault.io/secrets-path: path/to/secrets
```

The path is relative to your secrets engine folder. So if you want to get the secrets for backstage and you have the following directory structure:

    .
    ├── ...
    ├── secrets                 # Your secret engine name (usually it is `secrets`)
    │   ├── test                # Folder with test secrets
    │   │   ├── backstage       # In this folder there are secrets for Backstage
    │   ├── other               # Other folder with more secrets inside
    │   └── folder              # And another folder
    └── ...

You will set the `vault.io/secret-path` to `test/backstage`. If the folder `backstage` contains other sub-folders, the plugin will fetch the secrets inside them and adapt the **View** and **Edit** URLs to point to the correct place.

In case you need to support different secret engines for entities of the catalog you can provide optional annotation to the entity in `catalog-info.yaml`:

```diff
 apiVersion: backstage.io/v1alpha1
 kind: Component
 metadata:
   # ...
   annotations:
     vault.io/secrets-path: path/to/secrets
+    vault.io/secrets-engine: customSecretEngine # Optional. By default it uses the 'secretEngine' value from your app-config.
```

That will overwrite the default secret engine from the configuration.

## Renew token

In a secure Vault instance, it's usual that the tokens are refreshed after some time. In order to always have a valid token to fetch the secrets, it might be necessary to execute a renew action after some time. By default this is deactivated, but it can be easily activated and configured to be executed periodically (hourly by default, but customizable by the user within the app-config.yaml file). In order to do that, modify your `src/plugins/vault.ts` file to look like this one:

```typescript
import { VaultBuilder } from '@backstage-community/plugin-vault-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await VaultBuilder.createBuilder({
    logger: env.logger,
    config: env.config,
    scheduler: env.scheduler,
  }).enableTokenRenew(
    env.scheduler.createScheduledTaskRunner({
      frequency: { minutes: 10 },
      timeout: { minutes: 1 },
    }),
  );

  const { router } = builder.build();

  return router;
}
```

If the `taskRunner` is not set when calling the `enableTokenRenew`, the plugin will automatically check what is set in the `app-config.yaml` file. Refer to [the new backend system setup](#new-backend-system) for more information about it.

## Features

- List the secrets present in a certain path
- Use different secret engines for different entities
- Open a link to view the secret
- Open a link to edit the secret
- Renew the token automatically with a defined periodicity

The secrets cannot be edited/viewed from within Backstage to make it more secure. Backstage will only have permissions to LIST data from Vault or to renew its own token if that is needed. And the user who wants to edit/view a certain secret needs the correct permissions to do so.
