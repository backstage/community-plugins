# Bitbucket PullRequest Plugin for Backstage

![list of pull requests in the Bitbucket repo](./docs/bitbucketprimg.png)

## Features

- List of PR's from particular bitbucket repo
- Filtering like OPEN/CLOSED/MERGED/ALL PR and Search
- Able to view Creator name, Created date and last update etc.
- We can go to Particular PR by clicking ID.

## How to add Bitbucket PR plugin to Backstage app

1. Install the plugin into Backstage.

```bash
cd packages/app
yarn add @backstage-community/plugin-bitbucket-pull-requests
```

2. Add plugin API to your Backstage instance.

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityBitbucketPullRequestsContent } from '@backstage-community/plugin-bitbucket-pull-requests';

...

const serviceEntityPage = (
  <EntityLayout>
    ...
        <EntityLayout.Route path="/bitbucket-pullrequests" title="Bitbucket">
            <EntityBitbucketPullRequestsContent />
        </EntityLayout.Route>
    ...
  </EntityLayout>
```

3. Add proxy config

```yaml
// app-config.yaml
proxy:
  '/bitbucket/api':
    target: https://bitbucket.org
    changeOrigin: true
    headers:
      Authorization: Bearer ${BITBUCKET_TOKEN}
      Accept: 'application/json'
      Content-Type: 'application/json'
bitbucket:
  # Defaults to /bitbucket/api and can be omitted if proxy is configured for that url
  proxyPath: /bitbucket/api
```

4. Run backstage app with `yarn start` and navigate to services tabs.

## How to use Bitbucket PR plugin in Backstage

- Add annotation to the yaml config file of a component

```yaml
metadata:
  annotations:
    bitbucket.com/project-slug: <example-bitbucket-project-name>/<example-bitbucket-repo-name>
```

## Links

- [Backstage](https://backstage.io)
