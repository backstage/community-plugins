# shortcuts

The shortcuts plugin allows a user to have easy access to pages within a Backstage app by storing them as "shortcuts" in the Sidebar.

## Usage

The plugin supports both the new frontend system and the old one.

### New frontend system

Install the package:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-shortcuts
```

With [feature discovery](https://backstage.io/docs/frontend-system/architecture/app/#feature-discovery) turned on, the plugin is installed automatically. Otherwise add it to `createApp`:

```ts
import shortcutsPlugin from '@backstage-community/plugin-shortcuts/alpha';

const app = createApp({
  features: [shortcutsPlugin],
});
```

The plugin provides a `nav-element:shortcuts` extension. To show it, list it in the `app/nav` config, under `end` (after the page links) or `start` (before them):

```yaml
app:
  extensions:
    - app/nav:
        config:
          elements:
            end:
              - nav-element:shortcuts
    # Optional: allow external links as shortcuts
    - nav-element:shortcuts:
        config:
          allowExternalLinks: true
```

You don't need to change your sidebar code. If your app has its own `NavContentBlueprint`, it needs to render `navSlots.end.rest()` once, which covers every listed nav element.

If you're moving from the old frontend system, remove `<Shortcuts />` from your sidebar when you add this config.

To replace the default `localStorage` implementation, override the `shortcutsApiRef` API from a module with `pluginId: 'shortcuts'`.

### Old frontend system

#### Install the package:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-shortcuts
```

#### Register plugin:

This plugin requires explicit registration, so you will need to add it to your App's `plugins.ts` file:

```ts
// ...
export { shortcutsPlugin } from '@backstage-community/plugin-shortcuts';
```

If you don't have a `plugins.ts` file see: [troubleshooting](#troubleshooting)

#### Add the `<Shortcuts />` component within your `<Sidebar>`:

Edit file `packages/app/src/components/Root/Root.tsx`

```tsx
import {
  Sidebar,
  SidebarDivider,
  SidebarSpace,
} from '@backstage/core-components';
import { Shortcuts } from '@backstage-community/plugin-shortcuts';

export const SidebarComponent = () => (
  <Sidebar>
    {/* ... */}
    <SidebarDivider />
    <Shortcuts />
    <SidebarSpace />
  </Sidebar>
);
```

To allow external links to be added as shortcut, you can add `allowExternalLinks` property to the `<Shortcuts />` component.

The plugin exports a `shortcutApiRef` but the plugin includes a default implementation of the `ShortcutApi` that uses `localStorage` to store each user's shortcuts.

To overwrite the default implementation add it to the App's `apis.ts`:

```ts
import { shortcutsApiRef } from '@backstage-community/plugin-shortcuts';
import { CustomShortcutsImpl } from '...';

export const apis = [
  // ...
  createApiFactory({
    api: shortcutsApiRef,
    deps: {},
    factory: () => new CustomShortcutsImpl(),
  }),
];
```

# Troubleshooting

If you don't have a `plugins.ts` file, you can create it with the path `packages/app/src/plugins.ts` and then import it into your `App.tsx`:

```diff
+ import * as plugins from './plugins';

const app = createApp({
  apis,
+   plugins: Object.values(plugins),
  bindRoutes({ bind }) {
    /* ... */
  },
});
```

Or simply edit `App.tsx` with:

```diff
+ import { shortcutsPlugin } from '@backstage-community/plugin-shortcuts';

const app = createApp({
  apis,
+   plugins: [shortcutsPlugin],
  bindRoutes({ bind }) {
    /* ... */
  },
});
```
