# [Backstage](https://backstage.io)

For testing github-actions, set the relevant env variables:

1. [Create an OAuth App](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/) in the GitHub organization with the callback URL set to `http://localhost:7007/api/auth/github/handler/frame`.
2. Take the Client ID and Client Secret from the newly created app's settings page and put them into `AUTH_GITHUB_CLIENT_ID` and `AUTH_GITHUB_CLIENT_SECRET` environment variables.
3. Generate a personal access token and put it into the `GITHUB_TOKEN` environment variable. You can generate a personal access token from your GitHub settings. It will need the repo and workflow scopes.

The [backstage example entity](./examples/entities.yaml) has a populated `github.com/project-slug` annotation, but you can modify this to point anywhere your credentials have access to for testing purposes.

To start the app, run:

```sh
yarn install
yarn start
```

## Development

To start the app, run:

```sh
yarn install
yarn start
```

## Examples

There are example setup for each plugin where possible. There is overlap between each of these thus they are not exclusively showing only the given plugin's features:

- `github-actions:` <http://localhost:3000/catalog/default/component/github-actions/ci-cd>
- `github-deployments`: <http://localhost:3000/catalog/default/component/github-deployments>
- `github-issues`: <http://localhost:3000/catalog/default/component/github-issues>
- `github-pull-request-board`: <http://localhost:3000/catalog/default/group/github-pull-requests-board/pull-requests>

For `github-discussions` you'll want to add the following config:

```yaml
search:
  collators:
    githubDiscussions:
      url: https://github.com/mermaid-js/mermaid # required
      schedule:
        initialDelay: { seconds: 10 }
        timeout: { minutes: 10 }
        frequency: { minutes: 30 }
```

Once the indexing has rand and completed you can see the results here: <http://localhost:3000/search?query=&types%5B%5D=github-discussions>
