# [Allure](https://docs.qameta.io/allure/)

Welcome to the Backstage Allure plugin. This plugin add an entity service page to display Allure test reports related to the service.

## Install

```shell
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-allure
```

## Configure

### Configure Allure service

Add below configuration in the `app-config.yaml`.

```yaml
allure:
  baseUrl: <ALLURE_SERVICE_BASE_URL> # Example: https://allure.my-company.net or when running allure locally, http://localhost:5050/allure-docker-service
```

### Setup entity service page

Add `EntityAllureReportContent` in the `EntityPage.tsx` like below:

```diff
+ import { EntityAllureReportContent } from '@backstage-community/plugin-allure';

...

const serviceEntityPage = (
  <EntityLayoutWrapper>
    ...
+    <EntityLayout.Route path="/allure" title="Allure Report">
+        <EntityAllureReportContent />
+    </EntityLayout.Route>
  </EntityLayoutWrapper>
);
```

## New Frontend System (Alpha)

The Allure plugin supports the New Frontend System via an `/alpha` export, here's how to use it:

1. Add the plugin to your app, using either auto discovery or the manual option:

   For auto discovery, add the following to your `app-config.yaml` file:

   ```yaml
   app:
     packages: all
   ```

   Alternatively, add the plugin manually in your `packages/app(-next)/src/App.tsx`, after all other imports:

   ```tsx
   import allurePlugin from '@backstage-community/plugin-allure/alpha';
   ```

   ```tsx
   export const app = createApp({
     features: [
       catalogPlugin,
       catalogImportPlugin,
       userSettingsPlugin,
       allurePlugin,
       // ...
     ],
   });
   ```

2. Next, enable the entity content extension in your `app-config.yaml`:

   ```yaml
   app:
     extensions:
       - entity-content:allure/entity
   ```

   The `Allure Report` tab is shown on entities annotated with `qameta.io/allure-project`, as described above.
