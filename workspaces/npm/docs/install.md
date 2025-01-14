# Installation

To show information from a private package or an alternative npm registry
you must install also the backend plugin and [configure it](./registries.md).

## Frontend plugin

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

## Alternative: Use the new frontend system (alpha)

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

## Optional: Backend plugin (req. for private packages or alternative registries)

1. Install the backend plugin:

   ```sh
   yarn workspace backend add @backstage-community/plugin-npm
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

## Optional: Test with plugin-example catalog entities

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
