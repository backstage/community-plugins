# backstage-mta-plugins

Welcome to the backstage-mta plugin!

_These plugins were created through the Backstage CLI_

## Getting started

There are four plugins available in this repository:

- [MTA Backend Plugin](./plugins/mta-backend)
- [MTA Frontend Plugin](./plugins/mta-frontend)
- [Catalog MTA Entity Providwer Plugin](./plugins/catalog-backend-module-mta-entity-provider)
- [Scaffolder MTA Plugin](./plugins/scaffolder-backend-module-mta)

You can also serve each plugin in isolation by running `yarn start` in each plugins respective
directory. This method of serving the plugin provides quicker iteration speed and a faster startup
and hot reloads. It is only meant for local development, and the setup for it can be found inside
the [/dev](/dev) directory.

## Introduction

These plugins are designed to work in unison to provide a means to create and analyze applications
in MTA (Migration toolkit for Applications). Within this readme, you will find instructions on how
to develop, test, and deploy these plugins.

### MTA / Tackle prerequisites

- To begin, you will need to have an MTA instance running in your cluster. For upstream MTA
  (Tackle), you can follow the instructions
  [here](https://github.com/konveyor/operator?tab=readme-ov-file#konveyor-operator-installation-on-k8s).



- Create a Tackle instance in the cluster. This can be done by running the following command:

```
kubectl apply -f https://raw.githubusercontent.com/konveyor/tackle2-operator/main/tackle-k8s.yaml
```

- Once the tackle instance is running, you can create a Tackle CR to configure the tackle instance.
  You can apply the CR by running the following command:

```
cat << EOF | kubectl apply -f -
kind: Tackle
apiVersion: tackle.konveyor.io/v1alpha1
metadata:
  name: tackle
  namespace: konveyor-tackle
spec:
  feature_auth_required: true
EOF
```

```

  - Obtain the URL for the tackle instance by running the following command:

```

oc get routes

```

You will need the URL for the tackle instance to configure the MTA plugin. This URL needs to be added to the app-config configmap [here](app-config.yaml) under the `mta` key. Be sure to add the `http://` or `https://` prefix to the URL.

- Additionally, The MTA plugin requires a keycloak instance to authenticate with the MTA instance. This can be created and configured simply by running the [Tackle create keycloak script](tackle-create-keycloak-client.sh) or the [MTA create keycloak script](mta-create-keycloak-client.sh). This will create a keycloak client for the MTA instance and provide the necessary configuration for the MTA plugin. The keycloak configuration also needs to be added to the app-config configmap [here](app-config.yaml) under the `mta` key.

## Authentication Setup

This plugin requires proper authentication with Keycloak to access the MTA API. If authentication is
not set up correctly, you may experience 401 errors that can cause navigation issues in the UI.

**Important:** You must configure your Keycloak client with the appropriate scopes to use this
plugin.

### Authentication Error Handling

This plugin includes improved error handling for authentication issues:

- Graceful handling of 401 errors without page navigation disruptions
- Detailed error messages with specific instructions for fixing Keycloak configuration
- Retry buttons that allow users to attempt requests again after fixing authentication issues
- Prevention of hard refreshes and URL issues when authentication errors occur

## Configuration

The MTA plugin requires configuration in your app-config.yaml file. The keys are as follows:

- `mta` - Contains the configuration for the MTA resources.
  - `url` - The URL for the MTA instance running in the cluster.
  - `providerAuth` - The keycloak authentication configuration for the MTA instance.
    - `realm` - The realm for the keycloak instance.
    - `clientId` - The client ID for the keycloak instance.
    - `secret` - The client secret for the keycloak instance.

## Development

You can also serve each plugin in isolation by running `yarn start` in each plugins respective
directory. This method of serving the plugin provides quicker iteration speed and a faster startup
and hot reloads. It is only meant for local development, and the setup for it can be found inside
the [/dev](/dev) directory.
