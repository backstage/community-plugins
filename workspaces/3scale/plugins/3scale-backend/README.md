# 3scale Backstage provider

The 3scale Backstage provider plugin synchronizes the 3scale content into the [Backstage](https://backstage.io/) catalog.

## For administrators

### Installation

Run the following command to install the 3scale Backstage provider plugin:

```console
yarn workspace backend add @janus-idp/backstage-plugin-3scale-backend
```

### Configuration

3scale Backstage provider allows configuration of one or multiple providers using the `app-config.yaml` configuration file of Backstage.

#### Legacy Backend Procedure

1. Use a `threeScaleApiEntity` marker to start configuring the `app-config.yaml` file of Backstage:

   ```yaml title="app-config.yaml"
   catalog:
     providers:
       threeScaleApiEntity:
         dev:
           baseUrl: https://<TENANT>-admin.3scale.net
           accessToken: <ACCESS_TOKEN>
           schedule: # optional; same options as in TaskScheduleDefinition
             # supports cron, ISO duration, "human duration" as used in code
             frequency: { minutes: 30 }
             # supports ISO duration, "human duration" as used in code
             timeout: { minutes: 3 }
   ```

2. If installing into the _legacy_ backend, configure the scheduler for the entity provider using one of the following methods:

   - **Method 1**: If the scheduler is configured inside the `app-config.yaml` using the schedule config key mentioned previously, add the following code to `packages/backend/src/plugins/catalog.ts` file:

     ```ts title="packages/backend/src/plugins/catalog.ts"
     /* highlight-add-next-line */
     import { ThreeScaleApiEntityProvider } from '@janus-idp/backstage-plugin-3scale-backend';

     export default async function createPlugin(
       env: PluginEnvironment,
     ): Promise<Router> {
       const builder = await CatalogBuilder.create(env);

       /* ... other processors and/or providers ... */
       /* highlight-add-start */
       builder.addEntityProvider(
         ThreeScaleApiEntityProvider.fromConfig(env.config, {
           logger: env.logger,
           scheduler: env.scheduler,
         }),
       );
       /* highlight-add-end */

       const { processingEngine, router } = await builder.build();
       await processingEngine.start();
       return router;
     }
     ```

     ***

     **NOTE**

     If you have made any changes to the schedule in the `app-config.yaml` file, then restart to apply the changes.

     ***

   - **Method 2**: Add a schedule directly inside the `packages/backend/src/plugins/catalog.ts` file as follows:

     ```ts title="packages/backend/src/plugins/catalog.ts"
     /* highlight-add-next-line */
     import { ThreeScaleApiEntityProvider } from '@janus-idp/backstage-plugin-3scale-backend';

     export default async function createPlugin(
       env: PluginEnvironment,
     ): Promise<Router> {
       const builder = await CatalogBuilder.create(env);

       /* ... other processors and/or providers ... */
       /* highlight-add-start */
       builder.addEntityProvider(
         ThreeScaleApiEntityProvider.fromConfig(env.config, {
           logger: env.logger,
           schedule: env.scheduler.createScheduledTaskRunner({
             frequency: { minutes: 30 },
             timeout: { minutes: 3 },
           }),
         }),
       );
       /* highlight-add-end */

       const { processingEngine, router } = await builder.build();
       await processingEngine.start();
       return router;
     }
     ```

   ***

   **NOTE**

   If both the `schedule` (hard-coded schedule) and `scheduler` (`app-config.yaml` schedule) option are provided in the `packages/backend/src/plugins/catalog.ts`, the `scheduler` option takes precedence. However, if the schedule inside the `app-config.yaml` file is not configured, then the `schedule` option is used.

   ***

#### New Backend Procedure

1. If installing into the new backend system, make the same configurations to the `app=config.yaml` as in the [Legacy Backend Installation Procedure](#legacy-backend-installation-procedure). Make sure to configure the schedule inside the `app-config.yaml` file. The default schedule is a frequency of 30 minutes and a timeout of 3 minutes.
2. Add the following code to the `packages/backend/src/index.ts` file:

   ```ts title="packages/backend/src/index.ts"
   const backend = createBackend();

   /* highlight-add-next-line */
   backend.add(import('@janus-idp/backstage-plugin-3scale-backend/alpha'));

   backend.start();
   ```

### Troubleshooting

When you start your Backstage application, you can see some log lines as follows:

```log
[1] 2023-02-13T15:26:09.356Z catalog info Discovered ApiEntity API type=plugin target=ThreeScaleApiEntityProvider:dev
[1] 2023-02-13T15:26:09.423Z catalog info Discovered ApiEntity Red Hat Event (DEV, v1.2.0) type=plugin target=ThreeScaleApiEntityProvider:dev
[1] 2023-02-13T15:26:09.620Z catalog info Discovered ApiEntity Red Hat Event (TEST, v1.1.0) type=plugin target=ThreeScaleApiEntityProvider:dev
[1] 2023-02-13T15:26:09.819Z catalog info Discovered ApiEntity Red Hat Event (PROD, v1.1.0) type=plugin target=ThreeScaleApiEntityProvider:dev
[1] 2023-02-13T15:26:09.819Z catalog info Applying the mutation with 3 entities type=plugin target=ThreeScaleApiEntityProvider:dev
```
