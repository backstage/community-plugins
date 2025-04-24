# npm plugin for Backstage

A Backstage plugin that shows information and latest releases/versions
from a npm registry for catalog entities.

The current version can show two cards and one additional tab for an catalog entity.

1. The "Npm info card" shows general information like the latest version, description, etc.
2. The "Npm release overview card" shows the latest tags of an npm package.
3. The "Npm release tab" shows the version hisory in detail.

## Screenshots

### Npm info card

![Screenshot](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/npm/docs/npm-info-card.png)

### Npm release overview card

![Screenshot](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/npm/docs/npm-release-overview-card.png)

### Extended catalog entity overview tab (example)

![Screenshot](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/npm/docs/catalog-entity-overview-tab.png)

### New catalog entity npm release tab

![Screenshot](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/npm/docs/catalog-entity-npm-release-tab.png)

## Usage

### Enable npm cards for a catalog entity

To enable the different npm cards you must add the `npm/package` annotation
with the name of the npm package:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: react
  annotations:
    npm/package: react
```

### Use other npm tag then `latest`

The "npm info" card shows the information of the latest 'stable' npm release
and use the common `latest` tag by default. This could be changed with `npm/stable-tag`:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: react
  annotations:
    npm/package: react
    npm/stable-tag: latest, stable, next, etc.
```

### Use a custom registry

To use another npm registry you need to specific a registry name in your
catalog entity that exists in your `app-config.yaml`.

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: react
  annotations:
    npm/package: another-package
    npm/registry: github
```

```yaml
# app-config.yaml
npm:
  registries:
    - name: github
      url: https://npm.pkg.github.com
      token: ghp_...
```

## Installation

To show information from a private package or an alternative npm registry
you must install also the backend plugin and [configure it](./registries.md).

### Frontend plugin

1. Install the frontend dependency:

   ```sh
   yarn workspace app add @backstage-community/plugin-npm
   ```

2. Add cards based on your needs to `packages/app/src/components/catalog/EntityPage.tsx`:

   After all other imports:

   ```tsx
   import {
     isNpmAvailable,
     EntityNpmInfoCard,
     EntityNpmReleaseOverviewCard,
     EntityNpmReleaseTableCard,
   } from '@backstage-community/plugin-npm';
   ```

3. Add to `const overviewContent` after `EntityAboutCard`:

   ```tsx
   <EntitySwitch>
     <EntitySwitch.Case if={isNpmAvailable}>
       <Grid container item md={6} xs={12}>
         <Grid item md={12}>
           <EntityNpmInfoCard />
         </Grid>
         <Grid item md={12}>
           <EntityNpmReleaseOverviewCard />
         </Grid>
       </Grid>
     </EntitySwitch.Case>
   </EntitySwitch>
   ```

4. Add to `const serviceEntityPage` and `const websiteEntityPage` after the `/ci-cd` case
   and to `const defaultEntityPage` between the `/` and `/docs` routecase.

   ```tsx
   <EntityLayout.Route
     if={isNpmAvailable}
     path="/npm-releases"
     title="NPM Releases"
   >
     <EntityNpmReleaseTableCard />
   </EntityLayout.Route>
   ```

### Alternative: Use the new frontend system (alpha)

For early adaopters of the new frontend system.

Your Backstage frontend app must use that new frontend system which isn't the default at the moment.

1. Install the frontend dependency:

   ```sh
   yarn workspace app-next add @backstage-community/plugin-npm
   ```

2. Add the package to your `packages/app[-next]/src/App.tsx`.

   ```tsx
   import npmPlugin from '@backstage-community/plugin-npm/alpha';
   ```

   And extend your createApp:

   ```tsx
   export const app = createApp({
     features: [
       catalogPlugin,
       catalogImportPlugin,
       userSettingsPlugin,
       npmPlugin,
       // ...
     ],
   });
   ```

### Optional: Backend plugin (req. for private packages or alternative registries)

1. Install the backend plugin:

   ```sh
   yarn workspace backend add @backstage-community/plugin-npm-backend
   ```

2. Add it to `packages/backend/src/index.ts`:

   ```tsx
   backend.add(import('@backstage-community/plugin-npm-backend'));
   ```

3. The backend is only used for catalog entities with a registry by default.

   If no `npm/registry` annotation is defined, the npm plugin loads the
   information directly from the frontend.
   (The browser of the user will connect to https://registry.npmjs.com.)

   You can enforce using the backend by defining a default registry:

   ```yaml
   # app-config.yaml
   # optional to enforce the frontend to use the backend
   npm:
     defaultRegistry: npmjs
   ```

For more information, please checkout the [Registries](./registries.md) documentation.

### Optional: Test with plugin-example catalog entities

For testing purpose you can import this catalog entities:

```yaml
# catalog-info.yaml
catalog:
  locations:
    - type: url
      target: https://github.com/backstage/community-plugins/blob/main/workspaces/npm/examples/entities.yaml
      rules:
        - allow: [System, Component]
```

## Registries

The npm plugin supports custom and private registries starting with v1.2.

### Default Configuration

The plugin loads information by default from https://registry.npmjs.com

This works without any additional configuration in your `app-config.yaml`
but only for public npm packages.

```yaml
npm:
  registries:
    - name: npmjs
      url: https://registry.npmjs.com
```

### Use an auth token for npmjs

To load information from another registry or to load information
from a private package, you must [install the backend](./install.md).

The catalog entity `npm/registry` annotation must be defined and match
one of the registries in the `app-config.yaml`:

Example:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: a-component
  annotations:
    npm/package: private-package
    npm/registry: npmjs
```

```yaml
# app-config.yaml
npm:
  registries:
    - name: npmjs
      url: https://registry.npmjs.com
      token: ...
```

The `npm/registry: npmjs` annotation is required to use the npm backend.

Alternativly you can setup a default registry (also for npmjs):

```yaml
# app-config.yaml
npm:
  defaultRegistry: npmjs
```

### Use an alternative registry

Entity example:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: a-component
  annotations:
    npm/package: private-package
    npm/registry: private-registry
```

```yaml
# app-config.yaml
npm:
  registries:
    - name: private-registry
      url: https://...
      token: ...
```

### Use GitHub npm registry

The GitHub npm registry reqires also a GitHub token for public entries.

You need to create a token at https://github.com/settings/tokens

```yaml
# app-config.yaml
npm:
  registries:
    - name: github
      url: https://npm.pkg.github.com
      token: ghp_...
```

### Other npm registries

Other npm registries should work the same way.

Please let us know if we should mention here another registry or
if you find any issue.

You can create a new [Issues on GitHub](https://github.com/backstage/community-plugins/issues/new?assignees=&labels=bug&projects=&template=1-bug.yaml&title=🐛+Npm%3A+<Title>)
