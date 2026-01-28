# MTA Frontend Plugin

This plugin provides an entity-driven interface for analyzing applications with [Migration Toolkit for Applications (MTA)](https://developers.redhat.com/products/mta/overview).

## Features

- View MTA analysis tasks for catalog entities
- Trigger new MTA analyses from Backstage
- Configure analysis targets and options
- Link catalog entities to MTA applications

## Prerequisites

### 1. MTA Instance

You need a running MTA instance with Keycloak authentication enabled. The Backstage user must authenticate with the same Keycloak instance that MTA uses.

### 2. OIDC Authentication

Configure the OIDC provider in your `app-config.yaml`:

```yaml
auth:
  providers:
    oidc:
      development:
        clientId: ${OIDC_CLIENT_ID}
        clientSecret: ${OIDC_CLIENT_SECRET}
        metadataUrl: https://your-keycloak.example.com/realms/mta/.well-known/openid-configuration
        prompt: auto
```

The plugin expects an OIDC API to be registered with the ID `internal.auth.oidc`, following the [official Backstage custom auth provider pattern](https://backstage.io/docs/auth/).

### 3. MTA Configuration

Configure the MTA URL in `app-config.yaml`:

```yaml
mta:
  url: https://your-mta-instance.example.com
```

## Development

To run the plugin in development mode:

```bash
cd workspaces/mta
yarn dev
```

This starts both the frontend and backend in development mode.
