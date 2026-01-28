# MTA Backstage Plugins

Backstage plugins for integrating with [Migration Toolkit for Applications (MTA)](https://developers.redhat.com/products/mta/overview).

## Plugins

This workspace contains four plugins:

- [MTA Backend Plugin](./plugins/mta-backend) - Backend proxy for MTA Hub API
- [MTA Frontend Plugin](./plugins/mta-frontend) - UI components for MTA integration
- [Catalog MTA Entity Provider Plugin](./plugins/catalog-backend-module-mta-entity-provider) - Syncs MTA applications to the Backstage catalog
- [Scaffolder MTA Plugin](./plugins/scaffolder-backend-module-mta) - Scaffolder actions for creating MTA applications

## Prerequisites

### MTA / Tackle Instance

You need a running MTA instance with Keycloak authentication enabled. For upstream MTA (Tackle), follow the [Konveyor operator installation guide](https://github.com/konveyor/operator?tab=readme-ov-file#konveyor-operator-installation-on-k8s).

Quick setup:

```bash
# Install the operator
kubectl apply -f https://raw.githubusercontent.com/konveyor/tackle2-operator/main/tackle-k8s.yaml

# Create a Tackle instance with auth enabled
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

Get the MTA URL:

```bash
kubectl get routes -n konveyor-tackle
```

## Configuration

### Backend Configuration

Add the MTA configuration to your `app-config.yaml`:

```yaml
mta:
  url: https://your-mta-instance.example.com
  # Optional: Service account for catalog entity provider
  providerAuth:
    realm: mta
    clientID: backstage
    secret: ${MTA_CLIENT_SECRET}
```

### OIDC Authentication

The MTA plugins use OIDC authentication to get user tokens for MTA Hub. Configure the OIDC provider:

```yaml
auth:
  providers:
    oidc:
      development:
        clientId: ${OIDC_CLIENT_ID}
        clientSecret: ${OIDC_CLIENT_SECRET}
        metadataUrl: https://your-keycloak.example.com/realms/mta/.well-known/openid-configuration
```

The frontend plugin expects an OIDC API registered with ID `internal.auth.oidc`, following the [official Backstage custom auth provider pattern](https://backstage.io/docs/auth/).

## Development

Start the development server:

```bash
cd workspaces/mta
yarn dev
```

This starts both the frontend and backend in development mode.

## Building Dynamic Plugins

To build the plugins for dynamic plugin deployment:

```bash
# Build all packages
yarn build:all

# Export as dynamic plugins
cd plugins/mta-frontend
npx @red-hat-developer-hub/cli@latest plugin export --clean

cd ../mta-backend
npx @red-hat-developer-hub/cli@latest plugin export --clean
```

For detailed dynamic plugin deployment instructions, see the [RHDH dynamic plugins documentation](https://github.com/redhat-developer/rhdh/blob/main/showcase-docs/dynamic-plugins.md).
