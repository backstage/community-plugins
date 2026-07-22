# FireHydrant Plugin

## Overview

The [FireHydrant](https://firehydrant.io) plugin brings incident management to Backstage, and it displays service incidents information such as active incidents and incident analytics. There are also quick action links that let you create and view incidents in FireHydrant.

<img src="./doc/firehydrant_plugin_screenshot.png" alt="FireHydrant plugin screenshot">

## Features

- View total active incidents for a service declared in FireHydrant
- Quick links to the top 5 most recent active incidents in FireHydrant
- View incident metrics for a given service within the last 30 days, including: healthiness, total time impacted, total number of incidents, and MTT* (Mean Time To *) data such as MTTD (detect), MTTA (acknowledge), MTTM (mitigate) and MTTR (resolve).

## Setup

1. Install the plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-firehydrant
```

2. Add the plugin to `EntityPage.tsx`, inside the `const overviewContent`'s parent `<Grid>` component:

```ts
// In packages/app/src/components/catalog/EntityPage.tsx
import { FirehydrantCard } from '@backstage-community/plugin-firehydrant';

// Add to code as a grid item
<Grid item md={6}>
  <FirehydrantCard />
</Grid>;
```

3. Add proxy configuration to `app-config.yaml`:

```yaml
proxy:
  '/firehydrant/api':
    target: 'https://api.firehydrant.io/v1/'
    changeOrigin: true
    headers:
      # Supply the token you generated from https://app.firehydrant.io/organizations/bots
      Authorization: Bearer ${FIREHYDRANT_BOT_TOKEN}
```

Note: if you are not using environment variables, you can directly type the API Bot Token into `app-config.yaml`:

```yaml
proxy:
'/firehydrant/api':
  target: 'https://api.firehydrant.io/v1/'
  changeOrigin: true
  headers:
    # Supply the token you generated from https://app.firehydrant.io/organizations/bots
    Authorization: Bearer fhb-e4911b22bcd788c4a4afeb0c111ffbfa
```

4. Optionally add an annotation to the yaml config file of a component

```yaml
metadata:
  annotations:
    firehydrant.com/service-name: <firehydrant-service-name>
```

## New Frontend System (Alpha)

The FireHydrant plugin supports the New Frontend System via an `/alpha` export, here's how to use it:

1. Add the plugin to your app, using either auto discovery or the manual option:

   For auto discovery, add the following to your `app-config.yaml` file:

   ```yaml
   app:
     packages: all
   ```

   Alternatively, add the plugin manually in your `packages/app(-next)/src/App.tsx`, after all other imports:

   ```tsx
   import firehydrantPlugin from '@backstage-community/plugin-firehydrant/alpha';
   ```

   ```tsx
   export const app = createApp({
     features: [
       catalogPlugin,
       catalogImportPlugin,
       userSettingsPlugin,
       firehydrantPlugin,
       // ...
     ],
   });
   ```

2. Next, enable the entity card extension in your `app-config.yaml`:

   ```yaml
   app:
     extensions:
       - entity-card:firehydrant/EntityFirehydrantCard
   ```

   The card is shown on components annotated with `firehydrant.com/service-name`, as described above.
