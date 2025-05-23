# 3scale Backstage provider

The 3scale Backstage provider plugin synchronizes the 3scale content into the [Backstage](https://backstage.io/) catalog.

## For administrators

### Installation

Run the following command to install the 3scale Backstage provider plugin:

```console
yarn workspace backend add @backstage-community/plugin-3scale-backend
```

### Configuration

3scale Backstage provider allows configuration of one or multiple providers using the `app-config.yaml` configuration file of Backstage.

#### New Backend Procedure

1. Use a `threeScaleApiEntity` marker to start configuring the `app-config.yaml` file of Backstage:

   ```yaml title="app-config.yaml"
   catalog:
     providers:
       threeScaleApiEntity:
         dev:
           baseUrl: https://<TENANT>-admin.3scale.net
           accessToken: <ACCESS_TOKEN>
           systemLabel: 3scale # optional; default is "3scale"; used to apply a custom system label to api entities
           ownerLabel: 3scale # optional; default is "3scale"; used to apply a custom owner label to api entities
           schedule: # optional; same options as in TaskScheduleDefinition
             # supports cron, ISO duration, "human duration" as used in code
             frequency: { minutes: 30 }
             # supports ISO duration, "human duration" as used in code
             timeout: { minutes: 3 }
   ```

   **NOTE**
   Make sure to configure the schedule inside the `app-config.yaml` file. The default schedule is a frequency of 30 minutes and a timeout of 3 minutes.

2. Add the following code to the `packages/backend/src/index.ts` file:

   ```ts title="packages/backend/src/index.ts"
   const backend = createBackend();

   /* highlight-add-next-line */
   backend.add(import('@backstage-community/plugin-3scale-backend'));

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
