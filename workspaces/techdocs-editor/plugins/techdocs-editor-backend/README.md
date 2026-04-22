# @backstage-community/plugin-techdocs-editor-backend

Backend plugin that provides the REST API for the TechDocs in-app editor. It reads documentation source files from GitHub or GitLab, parses `mkdocs.yml` configuration, and opens pull/merge requests with the user's edits.

## Setup

### Installation

```bash
yarn --cwd packages/backend add @backstage-community/plugin-techdocs-editor-backend
```

### Registering the plugin

In `packages/backend/src/index.ts`:

```ts
// Core plugin (endpoints + extension point)
backend.add(import('@backstage-community/plugin-techdocs-editor-backend'));

// Built-in GitHub + GitLab VCS providers (recommended for most setups)
backend.add(
  import(
    '@backstage-community/plugin-techdocs-editor-backend/module-default-providers'
  ),
);
```

### SCM integrations

GitHub and GitLab access uses your existing `integrations` config:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
  gitlab:
    - host: gitlab.com
      token: ${GITLAB_TOKEN}
```

## Configuration

```yaml
techdocsEditor:
  defaultAuthorName: Backstage TechDocs Bot # optional
  defaultAuthorEmail: techdocs-bot@corp.com # optional
  defaultBranchPrefix: techdocs-editor # optional, default: 'techdocs-editor'
  defaultDraft: false # optional, default: false
```

### `defaultAuthorName`

Display name used as the Git commit author when the Backstage user's profile does not include a name. Defaults to `'Backstage'`.

### `defaultAuthorEmail`

Email used as the Git commit author when the user's profile does not include an email. Defaults to `'backstage@backstage.io'`.

### `defaultBranchPrefix`

Prefix for the branch names created by the editor (e.g. `techdocs-editor/patch-1a2b3c`). Keep it short and URL-safe. Defaults to `'techdocs-editor'`.

### `defaultDraft`

When `true`, all pull/merge requests are opened as drafts unless overridden per-request. Defaults to `false`.

## REST API

| Method | Path                                                         | Description                    |
| ------ | ------------------------------------------------------------ | ------------------------------ |
| `GET`  | `/api/techdocs-editor/sources/:ns/:kind/:name/tree`          | File tree for a catalog entity |
| `GET`  | `/api/techdocs-editor/sources/:ns/:kind/:name/file?path=<p>` | Read a single source file      |
| `GET`  | `/api/techdocs-editor/sources/:ns/:kind/:name/mkdocs`        | Parsed `mkdocs.yml` config     |
| `POST` | `/api/techdocs-editor/submissions/:ns/:kind/:name`           | Open a pull/merge request      |

## VCS Provider Extension Point

To add support for a custom SCM host (e.g. self-hosted Bitbucket), implement the `VcsProvider` interface from `@backstage-community/plugin-techdocs-editor-node` and register it via a backend module:

```ts
import { techdocsEditorVcsProviderExtensionPoint } from '@backstage-community/plugin-techdocs-editor-node';
import { createBackendModule } from '@backstage/backend-plugin-api';

export const myVcsModule = createBackendModule({
  pluginId: 'techdocs-editor',
  moduleId: 'my-vcs-provider',
  register(env) {
    env.registerInit({
      deps: { vcs: techdocsEditorVcsProviderExtensionPoint },
      async init({ vcs }) {
        vcs.addProvider(new MyVcsProvider());
      },
    });
  },
});
```

See [`@backstage-community/plugin-techdocs-editor-node`](../techdocs-editor-node/README.md) for the full `VcsProvider` interface.

## Permissions

| Action                  | Endpoints          |
| ----------------------- | ------------------ |
| `techdocs.editor.read`  | tree, file, mkdocs |
| `techdocs.editor.write` | submissions        |

## Development

```bash
yarn --cwd plugins/techdocs-editor-backend start
```

## Links

- [Frontend plugin](../techdocs-editor/README.md)
- [React component library](../techdocs-editor-react/README.md)
- [Node extension point](../techdocs-editor-node/README.md)
- [Shared types & permissions](../techdocs-editor-common/README.md)
