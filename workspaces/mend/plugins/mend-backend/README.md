# Mend.io - backend

In your `packages/backend/src/index.ts` file:

```ts
backend.add(import('@backstage-community/plugin-mend-backend'));
```

## Mend.io Projects Control (Optional)

The plugin supports configuration-based permission control to filter which projects are visible to users.

### How It Works

- **Project Filtering**: Provide a list of project IDs in the configuration to filter projects
- **Control Modes**: Use the `exclude` property to control the filtering behavior:
  - `true` (blocklist mode): Show all projects **EXCEPT** those in the list
  - `false` (allowlist mode): Show **ONLY** projects in the list

### Configuration

Add the following configuration to your `app-config.yaml` or `app-config.production.yaml`:

```yaml
mend:
  activationKey: ${MEND_ACTIVATION_KEY}
  permissionControl:
    ids:
      - <project-uuid-1> # Project UUID to filter
      - <project-uuid-2> # Another project UUID
    exclude: true # Set to true for blocklist mode, false for allowlist mode
```

### Configuration Options

| Option    | Type    | Default | Description                                                 |
| --------- | ------- | ------- | ----------------------------------------------------------- |
| `ids`     | Array   | -       | Array of project UUIDs to include or exclude                |
| `exclude` | Boolean | `true`  | Filtering mode: `true` for blocklist, `false` for allowlist |

### Mode Examples

#### Blocklist Mode (exclude: true)

```yaml
permissionControl:
  ids:
    - project-123
    - project-456
  exclude: true
```

_Result: Show all projects **except** project-123 and project-456_

#### Allowlist Mode (exclude: false)

```yaml
permissionControl:
  ids:
    - project-789
    - project-101
  exclude: false
```

_Result: Show **only** project-789 and project-101_

## Add the Mend.io frontend plugin

See the [mend frontend plugin instructions](../mend/README.md).
