# Multi Source Security Viewer Backend plugin for Backstage

At this time this plugin enables the ability to set RBAC permissions in the RBAC UI

## Installation

This plugin is installed via the `@backstage-community/plugin-multi-source-security-viewer-backend` package. To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @backstage-community/plugin-multi-source-security-viewer-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(
  import('@backstage-community/plugin-multi-source-security-viewer-backend'),
);
```

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn start` from the root directory.
