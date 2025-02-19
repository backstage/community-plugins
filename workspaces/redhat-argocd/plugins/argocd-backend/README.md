# Red Hat ArgoCD Backend Plugin for Backstage

This plugin enables integration between Backstage and ArgoCD instances, allowing you to monitor your ArgoCD applications.

## Installation

This plugin is installed via the `@backstage-community/plugin-redhat-argocd-backend` package. To install it to your backend package, run:

```bash
# From your root directory
yarn --cwd packages/backend add @backstage-community/plugin-redhat-argocd-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@backstage-community/plugin-redhat-argocd-backend'));
```

## Configuration

### Basic Setup

The simplest configuration requires just a URL and authentication details for your ArgoCD instance:

```yaml
argocd:
  # Default fallback credentials
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: primary
          url: https://argocd.example.com
```

## Authentication Options

The plugin supports three authentication methods, in order of priority (highest to lowest):

1. Instance-specific access token
2. Instance-specific username/password
3. Default username/password

### Using Access Tokens (Recommended)

```yaml
argocd:
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: instanceA
          url: https://instance-a.com
          token: ${ARGOCD_AUTH_TOKEN}
```

### Using Instance-Specific Credentials

```yaml
argocd:
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: instanceA
          url: https://instance-a.com
          username: ${ARGOCD_USERNAME}
          password: ${ARGOCD_PASSWORD}
```

### Default username and password

```yaml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: instanceA
          url: https://instance-a.com
        - name: instanceB
          url: https://instance-b.com
```

## Multiple ArgoCD instances

You can connect to multiple ArgoCD instances by configuring multiple entries:

```yaml
argocd:
  # Default fallback credentials
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: production
          url: https://argocd-prod.example.com
          token: ${ARGOCD_PROD_TOKEN}
        - name: staging
          url: https://argocd-staging.example.com
          username: ${ARGOCD_STAGING_USERNAME}
          password: ${ARGOCD_STAGING_PASSWORD}
```

**Note**: When using multiple instances, specify the target instance in your entity using the `argocd/instance-name` annotation. If not specified, the first configured instance will be used.

## Development

### Local Development

For local development without HTTPS, add `localDevelopment: true` to your configuration:

```yaml
argocd:
  # Default username and password
  localDevelopment: true
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: instanceA
          url: https://instance-a.com
          token: ${ARGOCD_AUTH_TOKEN}
```

## Running the plugin

Run the plugin in standalone mode:

```bash
yarn start
```

Run the entire Backstage application including this plugin:

```bash
# From the root workspace directory
yarn start:backstage
```
