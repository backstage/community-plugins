# Quay Plugin (Backend)

A simple plugin that queries the quay.io api, but provides additional features like:

- setting permissions
- using OAuth2 access tokens for authentication

## Setup

### Installation

This plugin is available via `@backstage-community/plugin-quay-backend`. To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @backstage-community/plugin-quay-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@backstage-community/plugin-quay-backend'));
```

### App Config

Define the following in `app-config.yaml` for a single Quay instance:

```yaml
quay:
  uiUrl: 'https://quay.io'
  apiUrl: 'https://quay.io'
  apiKey: 'abc123'
```

If you require access to a private repository in a Quay organization, set the `apiKey` value to your Application's OAuth 2 access token.

For more information on OAuth access tokens in Quay, please see [the official documentation](https://docs.redhat.com/en/documentation/red_hat_quay/3/html-single/red_hat_quay_api_guide/index#creating-oauth-access-token).

**Note**: Robot tokens will not work for the `apiKey` value.

#### Multiple Quay Instances Configuration

You can connect to multiple Quay instances by following configuration:

```yaml
quay:
  instances:
    - name: production
      apiUrl: 'https://quay.io'
      apiKey: 'prod-abc123'
    - name: staging
      apiUrl: 'https://quay-staging.example.com'
      apiKey: 'staging-xyz456'
```

When using multiple instances, specify the target instance in your entity using the `quay.io/instance-name` annotation:

```yaml title="catalog-info.yaml"
metadata:
  annotations:
    'quay.io/repository-slug': '<ORGANIZATION>/<REPOSITORY>'
    'quay.io/instance-name': 'production'
```

**Note:** If the `quay.io/instance-name` annotation is not specified, the plugin will automatically use the first configured instance as the default.

### Catalog

Add the annotation `quay.io/repository-slug` to your entity

```yaml
metadata:
  annotations:
    quay.io/repository-slug: '<organization>/<repository>'
```

To connect Catalog components to different Quay instances, specify the target instance in your entity using the `quay.io/instance-name` annotation. The instance name must match a name defined in your instances configuration. If omitted, the first configured instance is used by default.

```yaml
metadata:
  annotations:
    quay.io/repository-slug: '<organization>/<repository>'
    quay.io/instance-name: 'production'
```

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn start` from the root directory.
