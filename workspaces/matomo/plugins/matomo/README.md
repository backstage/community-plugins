# Matomo Plugin

The matomo plugin shows the basic analytics from [Matomo](https://matomo.org/)

![Matomo tab](./docs/matomo-tab.png)

## Getting started

1. Install the plugin

```bash
yarn workspace app add @backstage-community/plugin-matomo
```

2. Make sure the [Matomo backend plugin](../matomo-backend/README.md) is installed and configured

### Entity Pages

1. Add the plugin as a tab to website entity pages

```ts
// In packages/app/src/components/catalog/EntityPage.tsx
import { MatomoPage } from '@backstage-community/plugin-matomo';

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/matomo" title="Matomo">
      <MatomoPage />
    </EntityLayout.Route>
  </EntityLayout>
);
```

2. Add `matomo.io/site-id`annotation to `catalog-info-yaml`

```yaml
metadata:
  name: matomo-website
  annotations:
    matomo.io/site-id: '<YOUR_MATOMO_SITE_ID'
```

3. Add `contact us` and `matomo instance url` for user guidance

```yaml
matomo:
  frontendBaseUrl: ${MATOMO_INSTANCE_URL}
  contactUsLink: mailto:${MATOMO_CONTACT_EMAIL}
```
