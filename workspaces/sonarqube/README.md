# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

For testing sonarqube, set the relevant env variables:

1. [Create an OAuth App](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/) in the GitHub organization with the callback URL set to `http://localhost:7007/api/auth/github/handler/frame`.
2. Take the Client ID and Client Secret from the newly created app's settings page and put them into `AUTH_GITHUB_CLIENT_ID` and `AUTH_GITHUB_CLIENT_SECRET` environment variables.
3. Generate a personal access token and put it into the `GITHUB_TOKEN` enviornment variable. You can generate a personal access token from your GitHub settings. It will need the repo and workflow scopes.

The [backstage example entity](./examples/entities.yaml) has a populated `sonarqube.org/project-key` annotation, but you can modify this to point anywhere your credentials have access to for testing purposes.

To start the app, run:

```sh
yarn install
yarn start
```
