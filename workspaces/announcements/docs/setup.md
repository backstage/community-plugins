# Installation

## Backend

### Old Backend System Setup

Add the plugin to your backend app:

```bash
yarn add --cwd packages/backend @backstage-community/plugin-announcements-backend
```

Create `packages/backend/src/plugins/announcements.ts`:

```ts
import {
  buildAnnouncementsContext,
  createRouter,
} from '@backstage-community/plugin-announcements-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { createLegacyAuthAdapters } from '@backstage/backend-common';
import { HttpAuthService } from '@backstage/backend-plugin-api';

export default async function createPlugin({
  logger,
  database,
  permissions,
  discovery,
  tokenManager,
}: PluginEnvironment): Promise<Router> {
  const { httpAuth } = createLegacyAuthAdapters<
    any,
    { httpAuth: HttpAuthService }
  >({
    tokenManager,
    discovery,
  });

  const announcementsContext = await buildAnnouncementsContext({
    logger: logger,
    database: database,
    permissions: permissions,
    httpAuth: httpAuth,
  });

  return await createRouter(announcementsContext);
}
```

In `packages/backend/src/index.ts` add the following:

```ts
import announcements from './plugins/announcements';

// ...
async function main() {
  // ...
  const announcementsEnv = useHotMemoize(module, () =>
    createEnv('announcements'),
  );

  const apiRouter = Router();
  apiRouter.use('/announcements', await announcements(announcementsEnv));
  // ...
}
```

### New Backend System Setup

> If you are migrating from the old backend system, you can delete `packages/backend/src/plugins/announcements.ts` and follow the instructions below

Add the plugin to your backend app:

```bash
yarn add --cwd packages/backend @backstage-community/plugin-announcements-backend
```

Update `packages/backend/src/index.ts` to import announcements plugin package and register it in your backend using:

```ts
// ...
const backend = createBackend();

backend.add(import('@backstage-community/plugin-announcements-backend'));
// ...
```

## Frontend

Add the plugin to your frontend app:

```bash
yarn add --cwd packages/app @backstage-community/plugin-announcements
```

Expose the announcements page:

```ts
// packages/app/src/App.tsx
import { AnnouncementsPage } from '@backstage-community/plugin-announcements';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/announcements" element={<AnnouncementsPage />} />
    // ...
  </FlatRoutes>
);
```

An interface to create/update/edit/delete announcements is now available at `/announcements`.

## New Frontend System Setup (Alpha)

Add the plugin to your frontend app:

```bash
yarn add --cwd packages/app @backstage-community/plugin-announcements
```

Add the plugin to `packages/app/src/App.tsx`:

```ts
import announcementsPlugin from '@backstage-community/plugin-announcements/alpha';

// ...

const app = createApp({
  // ...
  features: [
    // ...
    announcementsPlugin,
    // ...
  ],
  // ...
});
```

Add the extensions in `app-config.yaml`:

```yaml
app:
  extensions:
    - entity-card:announcements/announcements
    - nav-item:announcements
```

The entity card will only appear on components & systems by default, but you can override that
behavior by passing a filter into the card extension like so:

```yaml
app:
  extensions:
    - entity-card:announcements/announcements:
        config:
          filter: kind:component,system,group,api
```
