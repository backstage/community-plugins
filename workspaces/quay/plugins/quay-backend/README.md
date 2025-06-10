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

Define the following in `app-config.yaml`:

```yaml
quay:
  uiUrl: 'https://quay.io'
  apiUrl: 'https://quay.io'
  apiKey: 'abc123'
```

If you require access to a private repository in a Quay organization, set the `apiKey` value to your Application's OAuth 2 access token.

For more information on OAuth access tokens in Quay, please see [the official documentation](https://docs.redhat.com/en/documentation/red_hat_quay/3/html-single/red_hat_quay_api_guide/index#creating-oauth-access-token).

**Note**: Robot tokens will not work for the `apiKey` value.

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

If you want to run the entire project, including the frontend, run `yarn start` from the root directory.
