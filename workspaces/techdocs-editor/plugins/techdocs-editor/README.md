# @backstage-community/plugin-techdocs-editor

[![npm](https://img.shields.io/npm/v/%40backstage-community%2Fplugin-techdocs-editor)](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor)
[![CI](https://github.com/backstage/community-plugins/tree/main/workspaces/techdocs-editor/actions/workflows/ci.yaml/badge.svg)](https://github.com/backstage/community-plugins/tree/main/workspaces/techdocs-editor/actions/workflows/ci.yaml)

> **In-app TechDocs editor for Backstage** — edit documentation directly from the developer portal and open pull/merge requests without leaving the browser.

## Features

- **WYSIWYG & Markdown source mode** — Toggle between a rich Toast UI editor and raw Markdown source
- **Sidebar file tree** — Browse all docs files for an entity with dirty-state indicators
- **New page creation** — Create new Markdown docs files from the editor
- **GitHub & GitLab support** — Opens pull requests (GitHub) or merge requests (GitLab) on submit
- **ETag-based conflict detection** — Prevents overwriting changes made by others since you opened the file
- **Permission integration** — Enforces `techdocs.editor.read` and `techdocs.editor.write` policies
- **New Frontend System (NFS) + Classic frontend** — Works with both Backstage frontend architectures

## Screenshots

**Editor page** — file tree on the left, WYSIWYG editor on the right, Visual/Markdown toggle, and Submit Changes button:

![TechDocs Editor page](https://raw.githubusercontent.com/Estehsan/community-plugins/add-techdocs-editor-workspace/workspaces/techdocs-editor/plugins/techdocs-editor/docs/editor-page.png)

**Submit Documentation Edits dialog** — shows changed files, PR title, description, commit message, and draft option:

![Submit Documentation Edits dialog](https://raw.githubusercontent.com/Estehsan/community-plugins/add-techdocs-editor-workspace/workspaces/techdocs-editor/plugins/techdocs-editor/docs/submit-dialog.png)

## Installation

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-techdocs-editor
```

### Backend (required)

The frontend requires the backend plugin to serve file trees, file content, and to submit edits. Install and wire it first:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-techdocs-editor-backend
```

```ts
// packages/backend/src/index.ts
backend.add(import('@backstage-community/plugin-techdocs-editor-backend'));
backend.add(
  import('@backstage-community/plugin-techdocs-editor-backend/alpha'),
);
```

### New Frontend System (Backstage ≥ 1.30)

Import the plugin from the `/alpha` subpath and add it to your app's `features` array in `packages/app/src/App.tsx`:

```tsx
import techdocsEditorPlugin from '@backstage-community/plugin-techdocs-editor/alpha';

export const app = createApp({
  features: [
    // ...other plugins
    techdocsEditorPlugin,
  ],
});
```

The plugin automatically registers:

- An **entity content tab** at `/edit-docs` on any entity that has TechDocs
- A **standalone editor page** at `/docs/:namespace/:kind/:name/edit`

### Classic Frontend System (Backstage < 1.30)

The classic plugin auto-registers the editor API, so no manual `createApiFactory`
is required. Add the standalone editor page to your `FlatRoutes` and, optionally,
the editor tab to your catalog entity page.

```tsx
// packages/app/src/App.tsx
import { TechdocsEditorPage } from '@backstage-community/plugin-techdocs-editor';

<FlatRoutes>
  {/* ...other routes */}
  <Route
    path="/docs/:namespace/:kind/:name/edit"
    element={<TechdocsEditorPage />}
  />
</FlatRoutes>;
```

```tsx
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityTechdocsEditorContent } from '@backstage-community/plugin-techdocs-editor';

<EntityLayout.Route path="/edit-docs" title="Edit Docs">
  <EntityTechdocsEditorContent />
</EntityLayout.Route>;
```

Optionally add the "Edit this page" button to the TechDocs reader by mounting the
addon inside your `TechDocsReaderPage`:

```tsx
import { TechDocsEditPageAddon } from '@backstage-community/plugin-techdocs-editor';

<TechDocsReaderPage>
  <TechDocsEditPageAddon />
</TechDocsReaderPage>;
```

## Exported API

| Export                        | Type              | Description                                                      |
| ----------------------------- | ----------------- | ---------------------------------------------------------------- |
| `techdocsEditorPlugin`        | `BackstagePlugin` | Classic frontend system plugin (registers the editor API)        |
| `TechdocsEditorPage`          | React component   | Routable standalone editor page for `FlatRoutes`                 |
| `EntityTechdocsEditorContent` | React component   | Entity content for the catalog entity page                       |
| `TechDocsEditPageAddon`       | React component   | TechDocs addon that injects the edit button into the reader page |
| `TechDocsEditorApiRef`        | `ApiRef`          | Backstage API ref for the editor REST client                     |
| `TechDocsEditorClient`        | Class             | Default implementation of `TechDocsEditorApi`                    |
| `TechDocsEditorApi`           | TypeScript type   | Interface for the editor API client                              |

> **Note:** `EntityEditorContent` and `EditorPageContent` are also exported from
> this package (required to satisfy API report tooling), but they are internal
> implementation details shared with the `/alpha` entry point — use
> `EntityTechdocsEditorContent` and `TechdocsEditorPage` instead when wiring up
> the classic frontend system.

### `/alpha` exports (New Frontend System only)

The `/alpha` subpath exports the NFS plugin object as the **default export**:

```ts
import techdocsEditorPlugin from '@backstage-community/plugin-techdocs-editor/alpha';
```

## Configuration

No `app-config.yaml` entries are required on the frontend. All configuration lives in the backend plugin. See [@backstage-community/plugin-techdocs-editor-backend](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-backend) for backend config.

## Permissions

The plugin enforces the following permissions from `@backstage-community/plugin-techdocs-editor-common`:

| Permission                      | Action  | When required                     |
| ------------------------------- | ------- | --------------------------------- |
| `techdocsEditorReadPermission`  | `read`  | Loading the file tree and content |
| `techdocsEditorWritePermission` | `write` | Submitting edits / opening a PR   |

## Related packages

| Package                                                                                                                                    | Description                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| [`@backstage-community/plugin-techdocs-editor-backend`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-backend) | Backend REST API + VCS providers              |
| [`@backstage-community/plugin-techdocs-editor-react`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-react)     | Shared React components and hooks             |
| [`@backstage-community/plugin-techdocs-editor-node`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-node)       | Node extension point for custom VCS providers |
| [`@backstage-community/plugin-techdocs-editor-common`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-common)   | Shared types and permissions                  |

## License

Apache-2.0
