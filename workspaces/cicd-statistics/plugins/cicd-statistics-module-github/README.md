# cicd-statistics-module-github

This is an extension module to the `cicd-statistics` plugin, providing a `CicdStatisticsApiGithub` that you can use to extract the CI/CD statistics from your Github repository.

## Getting started

1. Install the `cicd-statistics` and `cicd-statistics-module-github` plugins in the `app` package.

2. Configure your ApiFactory:
   - You can optionally pass in a third argument to `CicdStatisticsApiGithub` of type [CicdDefaults](https://github.com/backstage/backstage/blob/2881c53cb383bf127c150f837f37fe535d8cf97b/plugins/cicd-statistics/src/apis/types.ts#L179) to alter the default CICD UI configuration

```tsx
// packages/app/src/apis.ts
import { githubAuthApiRef } from '@backstage/core-plugin-api';

import { cicdStatisticsApiRef } from '@backstage-community/plugin-cicd-statistics';
import { CicdStatisticsApiGithub } from '@backstage-community/plugin-cicd-statistics-module-github';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: cicdStatisticsApiRef,
    deps: {
      githubAuthApi: githubAuthApiRef,
      configApi: configApiRef,
    },
    factory: ({ githubAuthApi, configApi }) => {
      return new CicdStatisticsApiGithub(githubAuthApi, configApi);
    },
  }),
];
```

3. Add the component to your EntityPage:

```tsx
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityCicdStatisticsContent } from '@backstage-community/plugin-cicd-statistics';

<EntityLayout.Route path="/ci-cd-statistics" title="CI/CD Statistics">
  <EntityCicdStatisticsContent />
</EntityLayout.Route>;
```
