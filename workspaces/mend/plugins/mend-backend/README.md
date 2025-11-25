# Mend.io - backend

> [!IMPORTANT]
> New Backend System

In your `packages/backend/src/index.ts` file:

```ts
backend.add(import('@backstage-community/plugin-mend-backend'));
```

### Permission Control (optional)

The plugin supports configuration-based permission control to filter which projects are visible to users.

- Provide a list of project IDs in the configuration to filter projects.
- Use the `exclude` property to control the filtering behavior:
  - `true` (blocklist mode): Show all projects EXCEPT those in the list
  - `false` (allowlist mode): Show ONLY projects in the list

Add the following configuration to your `app-config.yaml`:

```yaml
mend:
  activationKey: ${MEND_ACTIVATION_KEY}
  permissionControl:
    ids:
      - 5b77c6ca-f6ba-46dc-8edb-e049908728a4 # Project UUID to filter
      - a1b2c3d4-e5f6-7892-abcd-ef1234567890 # Another project UUID
    exclude: true # Set to true for blocklist mode, false for allowlist mode
```

**Configuration Options:**

- `ids`: Array of project UUIDs to include or exclude
- `exclude`: Boolean flag (default: `true`)
  - `true`: Exclude the listed projects (blocklist)
  - `false`: Only show the listed projects (allowlist)

**Add the Mend.io frontend plugin**

See the [mend frontend plugin instructions](../mend/README.md).
