# @backstage-community/plugin-akeyless

Frontend plugin for the Akeyless Backstage integration.

## Installation

```bash
yarn --cwd packages/app add @backstage-community/plugin-akeyless
```

### New frontend system (Backstage 1.51+)

```tsx
// packages/app/src/App.tsx
import akeylessPlugin from '@backstage-community/plugin-akeyless/alpha';

export default createApp({
  features: [catalogPlugin, akeylessPlugin],
});
```

### Classic frontend system

```tsx
import { akeylessPlugin } from '@backstage-community/plugin-akeyless';

const app = createApp({
  plugins: [akeylessPlugin],
});
```

Add to your entity page:

```tsx
import { EntityAkeylessCard } from '@backstage-community/plugin-akeyless';

<EntityLayout.Route path="/akeyless" title="Akeyless">
  <EntityAkeylessCard />
</EntityLayout.Route>;
```

## Entity annotations

```yaml
metadata:
  annotations:
    akeyless.io/secrets-path: /my-service/prod
    akeyless.io/secret-types: static-secret,dynamic-secret,rotated-secret,certificate
    akeyless.io/allow-crud: 'true' # optional; default enables in-Backstage CRUD for static secrets
```

Static secrets support view/create/update/delete in Backstage when CRUD is enabled. Other item types remain Console-only.
