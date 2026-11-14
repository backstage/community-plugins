# @backstage-community/plugin-github-common

Common functionalities shared by the GitHub plugins.

## Catalog Model Layer (Alpha)

The GitHub annotations (`github.com/project-slug`, `github.com/team-slug`, and `github.com/user-login`) are available as a layer for the opt-in [catalog model layer system](https://backstage.io/docs/releases/v1.50.0#catalog-model-layer-system-alpha-opt-in). To register it, add the following to your `packages/backend/src/index.ts`:

```ts
import { provideStaticCatalogModel } from '@backstage/plugin-catalog-node/alpha';
import { githubCatalogModelLayer } from '@backstage-community/plugin-github-common/alpha';

backend.add(
  provideStaticCatalogModel({
    layers: [githubCatalogModelLayer],
  }),
);
```
