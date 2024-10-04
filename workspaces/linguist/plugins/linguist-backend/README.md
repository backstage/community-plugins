# Linguist Backend

Welcome to the Linguist backend plugin! This plugin provides data for the Linguist frontend features. Additionally, it provides an optional entity processor which will automate adding language tags to your entities.

## Setup

The following sections will help you get the Linguist Backend plugin setup and running.

### Up and Running

Here's how to get the backend up and running:

1. First we need to add the `@backstage-community/plugin-linguist-backend` package to your backend:

   ```sh
   # From the Backstage root directory
   yarn --cwd packages/backend add @backstage-community/plugin-linguist-backend
   ```

2. Then we will create a new file named `packages/backend/src/plugins/linguist.ts`, and add the
   following to it:

   ```ts
   import { TaskScheduleDefinition } from '@backstage/backend-tasks';
   import { createRouter } from '@backstage-community/plugin-linguist-backend';
   import { Router } from 'express';
   import type { PluginEnvironment } from '../types';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     const schedule: TaskScheduleDefinition = {
       frequency: { minutes: 2 },
       timeout: { minutes: 15 },
       initialDelay: { seconds: 90 },
     };

     return createRouter({ schedule: schedule }, { ...env });
   }
   ```

3. Next we wire this into the overall backend router, edit `packages/backend/src/index.ts`:

   ```ts
   import linguist from './plugins/linguist';
   // ...
   async function main() {
     // ...
     // Add this line under the other lines that follow the useHotMemoize pattern
     const linguistEnv = useHotMemoize(module, () => createEnv('linguist'));
     // ...
     // Insert this line under the other lines that add their routers to apiRouter in the same way
     apiRouter.use('/linguist', await linguist(linguistEnv));
   ```

4. Now run `yarn start-backend` from the repo root
5. Finally open `http://localhost:7007/api/linguist/health` in a browser and it should return `{"status":"ok"}`

#### New Backend System

The Linguist backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@backstage-community/plugin-linguist-backend'));

  backend.start();
```

The plugin options can be set through the `app-config.yaml`:

```yaml
// ...

linguist:
  schedule:
    frequency:
      minutes: 2
    timeout:
      minutes: 2
    initialDelay:
      seconds: 15
  age:
    days: 30
  batchSize: 2
  useSourceLocation: false

// ...
```

## Plugin Option

The Linguist backend has various plugin options that you can provide to the `createRouter` function in your `packages/backend/src/plugins/linguist.ts` file that will allow you to configure various aspects of how it works. The following sections go into the details of these options

### Batch Size

The Linguist backend is setup to process entities by acting as a queue where it will pull down all the applicable entities from the Catalog and add them to it's database (saving just the `entityRef`). Then it will grab the `n` oldest entities that have not been processed to determine their languages and process them. To control the batch size simply provide that to the `createRouter` function in your `packages/backend/src/plugins/linguist.ts` like this:

```ts
return createRouter({ schedule: schedule, batchSize: 40 }, { ...env });
```

**Note:** The default batch size is 20

### Kind

The default setup only processes entities of kind `['API', 'Component', 'Template']`. To control the `kind` that are processed provide that to the `createRouter` function in your `packages/backend/src/plugins/linguist.ts` like this:

```ts
return createRouter({ schedule: schedule, kind: ['Component'] }, { ...env });
```

### Refresh

The default setup will only generate the language breakdown for entities with the linguist annotation that have not been generated yet. If you want this process to also refresh the data you can do so by adding the `age` (as a `HumanDuration`) in your `packages/backend/src/plugins/linguist.ts` when you call `createRouter`:

```ts
return createRouter({ schedule: schedule, age: { days: 30 } }, { ...env });
```

With the `age` setup like this if the language breakdown is older than 15 days it will get regenerated. It's recommended that if you choose to use this configuration to set it to a large value - 30, 90, or 180 - as this data generally does not change drastically.

### Linguist JS options

The default setup will use the default [linguist-js](https://www.npmjs.com/package/linguist-js) options, a full list of the available options can be found [here](https://www.npmjs.com/package/linguist-js#API).

```ts
return createRouter(
  { schedule: schedule, linguistJsOptions: { offline: true } },
  { ...env },
);
```

### Use Source Location

You may wish to use the `backstage.io/source-location` annotation over using the `backstage.io/linguist` as you may not be able to quickly add that annotation to your Entities. To do this you'll just need to set the `useSourceLocation` boolean to `true` in your `packages/backend/src/plugins/linguist.ts` when you call `createRouter`:

```ts
return createRouter(
  { schedule: schedule, useSourceLocation: true },
  { ...env },
);
```

**Note:** This has the potential to cause a lot of processing, be very thoughtful about this before hand

## Links

- [Frontend part of the plugin](https://github.com/backstage/backstage/tree/master/plugins/linguist)
- [The Backstage homepage](https://backstage.io)
