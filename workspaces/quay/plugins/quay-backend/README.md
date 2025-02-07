# Quay Plugin (Backend)

Simple plugin that queries the quay.io api.

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

Define the following in `app-config.yaml`:

```yaml
quay:
  uiUrl: 'https://quay.io'
  apiKey: 'abc123'
```

For the `apiKey` value please create a Quay Application OAuth 2 access token using [these instructions](https://docs.redhat.com/en/documentation/red_hat_quay/3/html-single/red_hat_quay_api_guide/index#creating-oauth-access-token).

### Catalog

Add the annotation `quay.io/repository-slug` to your entity

```yaml
metadata:
  annotations:
    quay.io/repository-slug: '<organization>/<repository>`
```

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn dev` from the root directory.
