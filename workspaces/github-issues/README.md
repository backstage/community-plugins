# [Backstage](https://backstage.io)

# Testing Github-Issues

## Github Authentication Provider & Integration

Before running the test app for the github-issues plugin, provide values for the following variables in `app-config.yaml`. This can be done as either environment variables or by creating an `app-config.local.yaml` file to overwrite them:

1. Following the [GitHub Authentication Provider Docs](https://backstage.io/docs/auth/github/provider), set the variables `AUTH_GITHUB_CLIENT_ID` and `AUTH_GITHUB_CLIENT_SECRET`.
2. Following the [Github Integration Docs](https://backstage.io/docs/integrations/github/locations), generate a personal access token and put it into the variable `GITHUB_TOKEN`. You can generate a personal access token from your Github settings.

## How to run

To start the app, run:

```sh
yarn install
yarn dev
```

To start the app with the new frontend system, instead run:

```sh
yarn install
yarn dev-next
```
