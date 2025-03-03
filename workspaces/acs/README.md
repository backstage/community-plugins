# Advanced Cluster Security Backstage Plugin

![ACS plugin image 1](images/acs_plugin_screenshot_1.png)
![ACS plugin image 2](images/acs_plugin_screenshot_2.png)

## Local Development

### Prerequisites

Please refer to the [Backstage Prerequisites page](https://backstage.io/docs/getting-started/#prerequisites) regarding getting started.

### Node CLI Tools

You will want to use node verion 20. You can set the version with the following command:

```
nvm use 20
```

NodeJS comes with `npm` the Node Package Manager. Use it to install `yarn` and `npx`.

```bash
> npm install yarn npx

added 2 packages in 6s
```

### Test Catalog Data

This repo comes with test data at `./catalog_default`.

First copy the `catalog_default` directory and rename it to `catalog`:

```
cp -R catalog_default catalog
```

Edit line 20 of `./catalog/components/test-app.yaml` to have a comma separated string of deployment names from the ACS API you wish to test.

### Export Environment Variables

The `ACS_API_URL` and `ACS_API_KEY` will need to be set in order for the route to work in the `app-config.yaml` file. The purpose of this route is to access data from the ACS endpoint.

To start the app, run:

```sh
yarn install
yarn dev
```

The app will be available at `http://localhost:3000`.

## RHDH Dynamic Plugin Config

The ACS plugin is also available as an [Red Hat Developer Hub](https://github.com/redhat-developer/rhdh) dynamic plugin. The following should be able to run within the [RHDH local](https://github.com/redhat-developer/rhdh-local) repo.

### Configuration

In `app-config.yaml` first add the proxies:

```yaml
proxy:
  endpoints:
    '/acs':
      credentials: dangerously-allow-unauthenticated
      target: ${ACS_API_URL}
      headers:
        authorization: 'Bearer ${ACS_API_KEY}'
```

Add the following top-level stanza to the `app-config.yaml` file:

```
acs:
  acsUrl: ${ACS_API_URL}
```

Here's an example of how to configure all of the various plugins in your dynmaic plugins config for RHDH.

```yaml
- package: 'https://github.com/RedHatInsights/backstage-plugin-advanced-cluster-security/releases/download/v0.1.1/redhatinsights-backstage-plugin-acs-dynamic-0.1.1.tgz'
  integrity: sha256-9JeRK2jN/Jgenf9kHwuvTvwTuVpqrRYsTGL6cpYAzn4=
  disabled: false
  pluginConfig:
    dynamicPlugins:
      frontend:
        redhatinsights.backstage-plugin-acs:
          entityTabs:
            - path: /acs
              title: RHACS
              mountPoint: entity.page.acs
          mountPoints:
            - mountPoint: entity.page.acs/cards
              importName: EntityACSContent
              config:
                layout:
                  gridColumnEnd:
                    lg: 'span 12'
                    md: 'span 12'
                    xs: 'span 12'
```

Each entity in the catalog will need to have an annotation added that references the deployment(s) in order to display vulnerability data for them. Here is an example:

```
acs/deployment-name: "test-deployment-1,test-deployment-2,test-deployment-3"
```
