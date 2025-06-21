# manage

This backend plugin fetches the owner entities (groups) and all owned entities of a user.

## Installation

This plugin is installed via the `@backstage-community/plugin-manage-backend` package. To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @backstage-community/plugin-manage-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@backstage-community/plugin-manage-backend'));
```

## Extensions

The plugin allows two extensions, `ownershipExtensionRef` and `ownedEntitesExtensionRef`. These can be used to implement:

- Custom functionality to get the list of owner entities (the user entity, the membership groups and all parent groups).
- Custom functionality to get the owned entities.

Customizing the plugin this way is not be necessary for most implementors, but could be useful if an implementor has quicker lookups through custom relations, or if specific logic should be used to deduce group hierarchies or ownership of entities.
