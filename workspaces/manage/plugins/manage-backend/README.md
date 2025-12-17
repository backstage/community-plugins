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

## MCP

The backend provides an MCP action called `my-entities` which has an input field `user` being the username, entity ref or email of the person for whom entities will be fetched.

The logic is the same as for what's shown in the UI.

The result is an object

```json
{
  "ownedEntities": [
    /* entity blobs */
  ],
  "ownerEntities": [
    /* entity blobs */
  ]
}
```

Where `ownedEntities` is the entities owned by the user or any of their groups, and `ownerEntities` are the entities for the user itself and the groups the user belongs to (incl parent and child groups). This is documented in the built-in tool schema, so the LLM will likely understand how to work with it.

To use this MCP tool, it must be enabled in the [mcp-actions-backend](https://github.com/backstage/backstage/tree/master/plugins/mcp-actions-backend#configuring-actions-registry) and that backend must be installed too.

## Extensions

The plugin allows two extensions, `ownershipExtensionRef` and `ownedEntitesExtensionRef`. These can be used to implement:

- Custom functionality to get the list of owner entities (the user entity, the membership groups and all parent groups).
- Custom functionality to get the owned entities.

Customizing the plugin this way is not be necessary for most implementors, but could be useful if an implementor has quicker lookups through custom relations, or if specific logic should be used to deduce group hierarchies or ownership of entities.
