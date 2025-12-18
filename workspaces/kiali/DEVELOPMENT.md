# Development Guide

## Introduction

This document provides an overview of how to set up and work with the development environment for this project.  
It describes how to run the application locally, how to prepare an OpenShift-based development environment, and important considerations to keep in mind when upgrading the Backstage version.

## Contents

- [Setting up the local development environment](#setting-up-the-local-development-environment)
- [Setting up the OpenShift development environment](#setting-up-the-openshift-development-environment)
- [Considerations when upgrading Backstage](#considerations-when-upgrading-backstage)

## Setting up the local development environment

This section describes how to run the project locally using the Backstage local model in the Kiali workspace.

1. Configure you `app-config.local.yaml` with kiali configuration

   ```yaml
   catalog:
     providers:
       # highlight-add-start
       kiali:
         # Required. Kiali endpoint
         url: ${KIALI_ENDPOINT}
         # Optional. Required by token authentication
         serviceAccountToken: ${KIALI_SERVICE_ACCOUNT_TOKEN}
         # Optional. defaults false
         skipTLSVerify: true
         # Optional. defaults kiali-token-Kubernetes
         tokenName: 'kiali-token-Kubernetes'
         # Optional
         caData: ${KIALI_CONFIG_CA_DATA}
         # Optional. Local path to CA file
         caFile: ''
         # Optional. Time in seconds that session is enabled, defaults to 1 minute.
         sessionTime: 60
         # highlight-add-end
   ```

2. Run

```bash
    export KIALI_BASE_URL=https://kiali-istio-system.apps-crc.testing;`
    yarn start
```

## Configure auth

### Token authentication

1. Set the parameters in app-config.local.yaml

   ```yaml
   catalog:
     providers:
       # highlight-add-start
       kiali:
         # Required. Kiali endpoint
         url: ${KIALI_ENDPOINT}
         # Optional. Required by token authentication
         serviceAccountToken: ${KIALI_SERVICE_ACCOUNT_TOKEN}
         # Optional. defaults false
         skipTLSVerify: true
         # Optional
   ```

2. To get `KIALI_SERVICE_ACCOUNT_TOKEN` create your service account and create the token

   ```bash
   kubectl create token $KIALI_SERVICE_ACCOUNT
   ```

   or if you installed kiali with the operator then execute

   ```bash
   export KIALI_SERVICE_ACCOUNT_TOKEN=$(kubectl describe secret $(kubectl get secret -n istio-system | grep kiali-service-account-token | cut -d" " -f1) -n istio-system | grep token: | cut -d ":" -f2 | sed 's/^ *//')
   ```

## Setting up the OpenShift development environment

The Kiali plugin will be also published in the [Red Hat plugin exports overlay](https://github.com/redhat-developer/rhdh-plugin-export-overlays), for which is important to also test the changes in an OpenShift instance.
The easiest way to test the changes is using [rhdh-local](https://github.com/redhat-developer/rhdh-local), the steps are provided here:

Create the needed directories for the plugin in `rhdh/local-plugins`:

```bash
rhdh-local$ mkdir local-plugins/kiali-frontend
rhdh-local$ mkdir local-plugins/kiali-backend
```

Install and export the frontend plugin from this repository:

```bash
community-plugins/workspaces/kiali/plugins/kiali$ yarn install
community-plugins/workspaces/kiali/plugins/kiali$ npx @red-hat-developer-hub/cli plugin export
```

Copy the generated files in RHDH:

```bash
cp -r dist-dynamic/* rhdh-local/local-plugins/kiali-frontend/
```

Proceed with the same steps for the backend:

```bash
community-plugins/workspaces/kiali/plugins/kiali-backend$ npx @red-hat-developer-hub/cli@latest plugin export
cp -r dist-dynamic/* rhdh-local/local-plugins/kiali-backend/
```

Create the configuration in:

```bash
rhdh-local/configs/app-config/app-config.local.yaml
```

With the content:

```bash
kiali:
  providers:
  - name: Kubernetes
    url: 'http://kiali-istio-system.apps-crc.testing/kiali'
    skipTLSVerify: true
```

Create the plugins config in:

```bash
rhdh-local/configs/dynamic-plugins/dynamic-plugins.override.yaml
```

With the content:

```bash
includes:
  - dynamic-plugins.default.yaml

plugins:
  - package: ./local-plugins/kiali-frontend
    disabled: false

  - package: ./local-plugins/kiali-backend
    disabled: false
    pluginConfig:
      mountPoints:
        - mountPoint: entity.page.kiali
          importName: EntityKialiContent
        - mountPoint: entity.page/overview/cards
          importName: EntityKialiGraphCard
          config:
            layouts:
              lg: 'span 4'
              md: 'span 6'
              xs: 'span 12'
      dynamicPlugins:
        frontend:
          backstage-community.plugin-kiali:
            appIcons:
              - importName: KialiIcon
                name: kialiIcon
            dynamicRoutes:
              - importName: KialiPage
                menuItem:
                  icon: kialiIcon
                  text: Kiali
                path: /kiali
```

In order for docker compose to have access to Kiali in crc, we can update;

```bash
~/dev/rhdh-local$ nano compose.yaml
```

And add the network_mode:

```bash
rhdh:
  container_name: rhdh
  image: ${RHDH_IMAGE:-quay.io/rhdh-community/rhdh:1.8}
  network_mode: host
```

Mount (docker or podman):

```bash
docker compose up -d
```

Useful commands to restart/debug:

```bash
docker logs rhdh-plugins-installer
docker compose down
docker compose start
docker compose stop
docker compose ps
```

If the installer is working but there is no process running, we can check it here:

```bash
docker logs rhdh
```

We can check if everything is working on:

http://localhost:7007/

## Considerations when upgrading backstage

Before upgrading, it is important to [check the compatibility](https://github.com/redhat-developer/rhdh-plugin-export-overlays?tab=readme-ov-file#backstage-compatibility) with the RHDH version.

Once checked, follow the steps:

```bash
# 1. Run the version bump
cd workspaces/kiali
yarn backstage-cli versions:bump --release main

# 2. Clean duplicate dependencies
yarn dedupe

# 3. Review generated changes
git diff

# 4. Test
yarn start
```

Verify e2e test pass with the following commands:

```bash
yarn install
yarn test:e2e
```

Or, in interactive mode:

```bash
yarn playwright test --ui
```
