# npm plugin

## Screenshots

### Npm info card

![Screenshot](docs/npm-info-card.png)

### Npm release overview card

![Screenshot](docs/npm-release-overview-card.png)

### Extended catalog entity overview tab (example)

![Screenshot](docs/catalog-entity-overview-tab.png)

### New catalog entity npm release tab

![Screenshot](docs/catalog-entity-npm-release-tab.png)

## Setup

Add to `packages/app/src/components/catalog/EntityPage.tsx`:

After all other imports:

```tsx
import {
  isNpmAvailable,
  NpmInfoCard,
  NpmReleaseOverviewCard,
  NpmReleaseTableCard,
} from '@backstage-community/plugin-npm';
```

Add to `const overviewContent` after `EntityAboutCard`:

```tsx
<EntitySwitch>
  <EntitySwitch.Case if={isNpmAvailable}>
    <Grid container item md={6} xs={12}>
      <Grid item md={12}>
        <NpmInfoCard />
      </Grid>
      <Grid item md={12}>
        <NpmReleaseOverviewCard />
      </Grid>
    </Grid>
  </EntitySwitch.Case>
</EntitySwitch>
```

Add to `const serviceEntityPage` and `const websiteEntityPage` after the `/ci-cd` case
and to `const defaultEntityPage` between the `/` and `/docs` routecase.

```tsx
<EntityLayout.Route
  if={isNpmAvailable}
  path="/npm-releases"
  title="NPM Releases"
>
  <NpmReleaseTableCard />
</EntityLayout.Route>
```
