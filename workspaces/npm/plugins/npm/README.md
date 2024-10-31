# npm plugin for Backstage

A Backstage plugin that shows information and latest releases/versions from a npm registry
for catalog entities.

## Screenshots

### Npm info card

![Screenshot](docs/npm-info-card.png)

### Npm release overview card

![Screenshot](docs/npm-release-overview-card.png)

### Extended catalog entity overview tab (example)

![Screenshot](docs/catalog-entity-overview-tab.png)

### New catalog entity npm release tab

![Screenshot](docs/catalog-entity-npm-release-tab.png)

## For users

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

The "npm info" card shows the information of the latest 'stable' npm release
and use the common `latest` tag by default. This could be changed with `npm/stable-tag`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: react
  annotations:
    npm/package: react
    npm/stable-tag: latest, stable, next, etc.
```

## For administrators

### Install on Backstage

1. Install the frontend plugin:

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

### Test catalog entities

For testing purpose you can import this catalog entities:

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/backstage/community-plugins/blob/main/workspaces/npm/examples/entities.yaml
      rules:
        - allow: [System, Component]
```
