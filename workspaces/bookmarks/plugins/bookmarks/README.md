# Bookmarks plugin

The Bookmarks plugin is a simple tool for saving and viewing links to your favorite websites, Google Docs, and other online resources directly within Backstage.

Bookmarks are stored in the `spec` of a Backstage entity, making it easy to manage and access them within your Backstage environment. See [an example entity](../../examples/entities.yaml#L22-L31) that includes bookmarks.

## Installation (old frontend system)

To install the Bookmarks plugin, follow these steps:

1. Install `@backstage-community/plugin-bookmarks` to your frontend packages

```bash
yarn --cwd packages/app add @backstage-community/plugin-bookmarks
```

2. Add `BookmarksTab` to the `EntityPage` routes:

```diff
// In your packages/app/src/components/EntityPage.tsx
import { BookmarksTab } from '@backstage-community/plugin-bookmarks';

const serviceEntityPage = (
  <EntityLayout>
    {/* other routes */}
+    <EntityLayout.Route path="/bookmarks" title="Bookmarks">
+      <BookmarksTab />
+    </EntityLayout.Route>
  </EntityLayout>
);
```

3. Add bookmarks to your entities by including them in the `spec` section of the entity YAML file.
4. Done!

## Usage

Once installed, you can view bookmarks by navigating to the "Bookmarks" tab in the entity page of your Backstage application. Note that only certain pages can be bookmarked. Due to cross-origin policy, you can only bookmark pages that allow embedding in an iframe. This means that some websites may not be viewable directly within Backstage.

## License

Apache-2.0
