# Linkerd Plugins for Backstage

### Installation instructions

#### Backend

First off, you're going to want to make sure that you have followed the setup guide to enable the `kubernetes` plugin in Backstage. You can do that by following [this guide for installation](https://backstage.io/docs/features/kubernetes/installation/#new-backend-system) and [this guide for configuration](https://backstage.io/docs/features/kubernetes/configuration).

Once you have the `kubernetes` plugin set up, you can install the `linkerd-backend` plugin by adding the following to your Backstage by running `yarn add @backstage-community/plugin-linkerd-backend` in `packages/backend` and also adding the following in your `packages/backend/src/index.ts`.

```ts
const backend = createBackend();

// Other plugins...

backend.add(import('@backstage-community/plugin-linkerd-backend'));

backend.start();
```

#### Frontend

Installing the frontend package is as easy as running `yarn install @backstage-community/plugin-linkerd` in your `packages/app` directory. Once you have done that, you can add the some of the cards to your `packages/app/src/components/catalog/EntityPage.tsx` for use on `EntityPages`.

```diff
const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>
    <Grid item md={6} xs={12}>
      <EntitySwitch>
+        <EntitySwitch.Case if={isKubernetesAvailable}>
+           <LinkerdDependenciesCard />
+        </EntitySwitch.Case>
        <EntitySwitch.Case>
          <EntityCatalogGraphCard variant="gridItem" height={400} />
        </EntitySwitch.Case>
      </EntitySwitch>
    </Grid>

    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>
    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);
```
