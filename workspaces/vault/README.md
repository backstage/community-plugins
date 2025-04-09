# Vault plugin for Backstage

The [Vault](https://www.vaultproject.io/) Backstage plugin allows you to display a list of secrets in a certain path inside your Vault instance. There are also some useful links to edit and/or view them using the official UI.

## Plugins

This plugin is composed of several packages:

- [vault](./plugins/vault/README.md) - The frontend plugin that provides the UI components and pages.
- [vault-backend](./plugins/vault-backend/README.md) - The backend plugin that provides the REST API.
- [vault-node](./plugins/vault-node/README.md) - A node library containing reusable service logic.

## Quick start

You will find detailed installation instructions in each plugin's readme file.

## Developing

To test the plugin locally, you can start the development environment:

```sh
yarn install
yarn dev
```

The sample dev app uses a Vault instance on `localhost:8200`, which you can setup in a separate terminal with:

```sh
# Start a Vault server, using "root" as the root token
vault server -dev -dev-root-token-id=root

# Configures sample data in Vault (secrets engine and secrets inside)
./scripts/configure-dev-vault.sh
```
