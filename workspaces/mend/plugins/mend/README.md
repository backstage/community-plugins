# mend.io

This plugin integrates mend.io functionality seamlessly into your Backstage application.


### Installation

From your Backstage root directory, run the following commands:

```bash
yarn --cwd packages/app add @backstage-community/plugin-mend
yarn --cwd packages/backend add @backstage-community/plugin-mend-backend
```

### Dependencies

> [!IMPORTANT]
> Please note that the frontend plugin will not function without the backend plugin.

### Getting Started

**Get mend.io Activation Key:**

1. Navigate to the "Settings" menu.

2. Select "Integrations" from the available options.

3. Click on the "Backstage" card.

4. Click "Get Activation Key" to generate key.

**Configure your mend.io Activation Key** in your local app-config.yaml or production app-config.production.yaml file:

```yaml
mend:
  baseUrl: ${API_URL_HERE}
  activationKey: ${YOUR_ACTIVATION_KEY_HERE}
```

**Add the mend.io tab to your entity page:**

In your `packages/app/src/components/Catalog/EntityPage.tsx` file:

```tsx
// ... other imports here
import { MendTab } from '@backstage-community/plugin-mend';
// ... other components
const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
    // ... other elements
    <EntityLayout.Route path="/mend" title="mend.io">
      <MendTab />
    </EntityLayout.Route>
    // ... other elements
    </EntityLayout.Route>
  </EntityLayout>
// ...
);
// ...
```

**Add the mend.io page to your routes:**

In your `packages/app/src/App.tsx` file:

```tsx
// ... other imports here
import { MendPage } from '@backstage-community/plugin-mend';
// ... other components
const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    // ... other elements
    <Route path="/mend" element={<MendPage />} />
   // ... other elements
  </FlatRoutes>
// ...
);
// ...
```

**Add the mend.io sidebar button:**

In your `packages/app/src/components/Root/Root.tsx` file:

```tsx
// ... other imports here
import { MendSidebar } from '@backstage-community/plugin-mend';
// ... other components
export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      // ... other elements
      <MendSidebar />
      // ... other elements
    </Sidebar>
    {children}
  </SidebarPage>
// ...
);
// ...
```

**Add the mend.io backend plugin**

> [!IMPORTANT]
> New Backend System

In your `packages/backend/src/index.ts` file:

```ts
backend.add(import('@backstage-community/plugin-mend-backend'));
```
