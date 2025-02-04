# Advanced Cluster Security Backstage Plugin

This is a development mono-repo for the Advanced Cluster Security plugin. This mono-repo was created using @backstage/create-app to provide a frontend for the plugin to integrate with.

You can find the plugin code in plugins/acs

## Configuration
In `app-config.yaml` first add the proxies:

```yaml
proxy:
  endpoints:
    '/acs':
      credentials: dangerously-allow-unauthenticated
      target: ${ACS_API_URL}
      headers:
        authorization: "Bearer ${ACS_API_KEY}"
```
## RHDH Dynamic Plugin Config
Here's an example of how to configure all of the various plugins in your dynmaic plugins config for RHDH.

```yaml
    - package: "https://github.com/RedHatInsights/backstage-plugin-advanced-cluster-security/releases/download/v0.1.1/redhatinsights-backstage-plugin-acs-dynamic-0.1.1.tgz"
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
                        lg: "span 12"
                        md: "span 12"
                        xs: "span 12"
```

## Development

The `ACS_API_URL` and `ACS_API_KEY` will need to be set in order for the route to work in the `app-config.yaml` file. The purpose of this route is to access data from the ACS endpoint.

To start the app, run:
```sh
yarn install
yarn dev
```
