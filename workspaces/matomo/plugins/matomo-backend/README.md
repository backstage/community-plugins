# Matomo Backend

This is the matomo backend plugin that act as a proxy with matomo instance.

Plugin will inject the auth token and ensure that the request are only read only operations.

Matomo API cannot be used as proxy layer due to the token auth it follows. Thus this plugin will act as proxy layer

## Getting Started

### Installing the NPM package

```bash
yarn add --cwd packages/backend  @backstage-community/plugin-matomo-backend
```

### Installing the plugin

#### Adding the plugin to the new backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(import('@backstage-community/plugin-matomo-backend'));

backend.start();
```

### Plugin Configurations

Add the following configurations into your `app-config.yaml` file:

```yaml
matomo:
  apiToken: ${MATOMO_API_TOKEN}

  apiUrl: ${MATOMO_API_URL}

  # (OPTIONAL) Set to false if you get SSL certificate error
  secure: ${MATOMO_SECURE_FLAG}
```
