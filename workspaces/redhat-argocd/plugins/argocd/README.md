# Argo CD plugin for Backstage

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/argocd/deployment-lifecycle](http://localhost:3000/argocd/deployment-lifecycle).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## For Administrators

### Installation and configuration

#### Prerequisites

- Install `@roadiehq/backstage-plugin-argo-cd-backend` plugin using the following command from the root directory
<!-- configure it by following [Argo CD Backend Plugin docs](https://www.npmjs.com/package/@roadiehq/backstage-plugin-argo-cd-backend) -->

```bash
yarn workspace app add @roadiehq/backstage-plugin-argo-cd-backend
```

- Create plugin file for Argo CD backend in your `packages/backend/src/plugins/` directory.

```ts
// packages/backend/src/plugins/argocd.ts

import { createRouter } from '@roadiehq/backstage-plugin-argo-cd-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment) {
  return await createRouter({ logger, config });
}
```

- Modify your backend router to expose the APIs for Argo CD backend

```ts
// packages/backend/src/index.ts

import {legacyPlugin} from '@backstage/backend-common';
...

backend.add(legacyPlugin('argocd', import('./plugins/argocd')));
```

- add argocd instance information in app.config.yaml

```ts
argocd:
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: argoInstance1
          url: https://argoInstance1.com
          username: ${ARGOCD_USERNAME}
          password: ${ARGOCD_PASSWORD}
        - name: argoInstance2
          url: https://argoInstance2.com
          username: ${ARGOCD_USERNAME}
          password: ${ARGOCD_PASSWORD}
```

#### How to add argocd frontend plugin to Backstage app

1. Install the Argocd plugin using the following command:

```bash
yarn workspace app add @backstage-community/plugin-redhat-argocd
```

2. Add deployment summary and deployment lifecycle compoennt to the `entityPage.tsx` source file:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  ArgocdDeploymentSummary,
  ArgocdDeploymentLifecycle,
  isArgocdConfigured,
} from '@backstage-community/plugin-redhat-argocd';

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    ...
    <EntitySwitch>
      <EntitySwitch.Case if={e => Boolean(isArgocdConfigured(e))}>
        <Grid item sm={12}>
          <ArgocdDeploymentSummary />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
    ...
  </Grid>
);

const cicdcontent = (
  <EntitySwitch>
    {/* ... */}
    {/* highlight-add-start */}
    ...
    <EntitySwitch.Case if={e => Boolean(isArgocdConfigured(e))}>
      <Grid item sm={12}>
        <ArgocdDeploymentLifecycle />
      </Grid>
    </EntitySwitch.Case>
    {/* highlight-add-end */}
  </EntitySwitch>
);
```

- Add one of the following annotations to the entity's `catalog-info.yaml` file to enable Argo CD features in the backstage instance:

  - To get all the applications matching the metadata labels.

  ```yaml
  annotations:
    ...

    argocd/app-selector: 'rht-gitops.com/janus-argocd=quarkus-app' # format: `label.key=label.value`

  ```

      **or**

  - To fetch a single application, use the following annotation in `catalog-info.yaml` file:

  ```yaml
  annotations:
    ...

    argocd/app-name: 'quarkus-app'

  ```

  > [!Note] > **You should not add both the annotations in the same catalog, adding both annotations will result in error in the plugin.**

- To switch between argocd instances, you can use the following annotation

```yaml
 annotations:
   ...
    argocd/instance-name: 'argoInstance2'
```

> [!Note] > **If this annotation is not set, the plugin will default to the first Argo CD instance configured in the `app.config.yaml`**

## Loading as Dynamic Plugin

To install this plugin into Red Hat Developer Hub or Janus IDP via Helm use this configuration:

```yaml
global:
  dynamic:
    includes:
      - dynamic-plugins.default.yaml
    plugins:
      - package: ./dynamic-plugins/dist/roadiehq-backstage-plugin-argo-cd-backend-dynamic
        disabled: false
      - package: ./dynamic-plugins/dist/backstage-community-plugin-redhat-argocd
        disabled: false
```

This plugin can be loaded in backstage showcase application as a dynamic plugin.

Follow the below steps -

- Export dynamic plugin assets. This will build and create the static assets for the plugin and put it inside dist-scalprum folder.

`yarn install`

`yarn tsc`

`yarn build`

`yarn export-dynamic`

- Package and copy dist-scalprum folder assets to dynamic-plugins-root folder in showcase application.

```sh
pkg=../plugins/argocd
archive=$(npm pack $pkg)
tar -xzf "$archive" && rm "$archive"
mv package $(echo $archive | sed -e 's:\.tgz$::')
```

- Add the extension point inside the `app-config.yaml` or `app-config.local.yaml` file.

```yaml
dynamicPlugins:
  frontend:
    backstage-community.plugin-redhat-argocd:
      mountPoints:
        - mountPoint: entity.page.overview/cards
          importName: ArgocdDeploymentSummary
          config:
            layout:
              gridColumnEnd:
                lg: 'span 8'
                xs: 'span 12'
            if:
              allOf:
                - isArgocdAvailable
        - mountPoint: entity.page.cd/cards
          importName: ArgocdDeploymentLifecycle
          config:
            layout:
              gridColumn: '1 / -1'
            if:
              allOf:
                - isArgocdConfigured
```

For more detailed explanation on dynamic plugins follow this [doc](https://github.com/janus-idp/backstage-showcase/blob/main/showcase-docs/dynamic-plugins.md).
