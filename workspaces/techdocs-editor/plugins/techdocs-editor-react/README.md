# @backstage-community/plugin-techdocs-editor-react

[![npm](https://img.shields.io/npm/v/%40backstage-community%2Fplugin-techdocs-editor-react)](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-react)
[![CI](https://github.com/backstage/community-plugins/tree/main/workspaces/techdocs-editor/actions/workflows/ci.yaml/badge.svg)](https://github.com/backstage/community-plugins/tree/main/workspaces/techdocs-editor/actions/workflows/ci.yaml)

Shared React components, hooks, and the API client for the TechDocs editor plugin. This library is a peer dependency of `@backstage-community/plugin-techdocs-editor`.

> **When to install this directly**: Install this package only if you are building a custom Backstage extension that needs to embed editor components or access the editor API client. For a standard Backstage installation, install `@backstage-community/plugin-techdocs-editor` instead — it re-exports everything from this package.

## Installation

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-techdocs-editor-react
```

## Exported Components

### `TechDocsEditorPage`

Full-page editor layout. Renders the sidebar file tree alongside the Markdown editor.

```tsx
import { TechDocsEditorPage } from '@backstage-community/plugin-techdocs-editor-react';

<TechDocsEditorPage namespace="default" kind="Component" name="my-service" />;
```

| Prop        | Type     | Required | Description                    |
| ----------- | -------- | -------- | ------------------------------ |
| `namespace` | `string` | Yes      | Entity namespace               |
| `kind`      | `string` | Yes      | Entity kind (e.g. `Component`) |
| `name`      | `string` | Yes      | Entity name                    |

### `TechDocsFileTree`

Sidebar file tree listing the docs files for an entity. Highlights files with unsaved changes.

```tsx
import { TechDocsFileTree } from '@backstage-community/plugin-techdocs-editor-react';

<TechDocsFileTree
  files={files}
  selectedFile={selectedFile}
  dirtyFiles={dirtyFiles}
  onSelect={file => setSelectedFile(file)}
/>;
```

| Prop           | Type                     | Required | Description                            |
| -------------- | ------------------------ | -------- | -------------------------------------- |
| `files`        | `DocTreeNode[]`          | Yes      | File tree returned by the backend      |
| `selectedFile` | `string \| undefined`    | No       | Currently selected file path           |
| `dirtyFiles`   | `Set<string>`            | No       | Set of file paths with unsaved changes |
| `onSelect`     | `(path: string) => void` | Yes      | Called when a file is clicked          |

### `TechDocsMarkdownEditor`

The Markdown editor pane. Wraps Toast UI Editor and supports both WYSIWYG and plain Markdown source modes.

```tsx
import { TechDocsMarkdownEditor } from '@backstage-community/plugin-techdocs-editor-react';

<TechDocsMarkdownEditor
  initialContent={content}
  onChange={setContent}
  sourceMode={false}
/>;
```

| Prop             | Type                         | Required | Description                                                                  |
| ---------------- | ---------------------------- | -------- | ---------------------------------------------------------------------------- |
| `initialContent` | `string`                     | Yes      | Initial Markdown content loaded into the editor                              |
| `onChange`       | `(markdown: string) => void` | Yes      | Called on every edit with the current Markdown string                        |
| `sourceMode`     | `boolean`                    | No       | When `true`, shows raw Markdown source; `false` = WYSIWYG (default: `false`) |

Fenced code blocks written as ` ```mermaid ` are rendered live as diagrams in
the preview (via [Mermaid](https://mermaid.js.org)), matching how published
TechDocs sites render them with a `mermaid` addon. Rendering follows the
Backstage light/dark theme automatically, and invalid or in-progress diagram
syntax is left as plain text instead of breaking the preview.

### `SubmitEditsDialog`

Modal dialog for entering a PR title, branch name, and commit message before submitting edits.

```tsx
import { SubmitEditsDialog } from '@backstage-community/plugin-techdocs-editor-react';
import type { EditedFile } from '@backstage-community/plugin-techdocs-editor-common';

<SubmitEditsDialog
  open={dialogOpen}
  changedFiles={editedFiles}
  onClose={() => setDialogOpen(false)}
  onSubmit={handleSubmit}
/>;
```

| Prop             | Type                                                                                                         | Required | Description                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------- |
| `open`           | `boolean`                                                                                                    | Yes      | Controls dialog visibility                                                       |
| `changedFiles`   | `EditedFile[]`                                                                                               | Yes      | Files with pending edits — shown in the dialog as a change list                  |
| `onClose`        | `() => void`                                                                                                 | Yes      | Called when the dialog is dismissed without submitting                           |
| `onSubmit`       | `(opts: { prTitle: string; prDescription: string; commitMessage: string; draft: boolean }) => Promise<void>` | Yes      | Called with the PR form data; should call the API and resolve/reject accordingly |
| `defaultPrTitle` | `string`                                                                                                     | No       | Pre-fills the PR title field (default: `'docs: update documentation'`)           |

## Exported API Client

### `TechDocsEditorApiRef`

Backstage `ApiRef` for the editor REST client. Use it with `useApi` to call the backend.

```ts
import { useApi } from '@backstage/core-plugin-api';
import { TechDocsEditorApiRef } from '@backstage-community/plugin-techdocs-editor-react';

const editorApi = useApi(TechDocsEditorApiRef);
const tree = await editorApi.getFileTree('default', 'Component', 'my-service');
```

### `TechDocsEditorClient`

Default implementation of `TechDocsEditorApi`. Register it as an API factory when using the classic frontend system:

```ts
import {
  TechDocsEditorApiRef,
  TechDocsEditorClient,
} from '@backstage-community/plugin-techdocs-editor-react';

createApiFactory({
  api: TechDocsEditorApiRef,
  deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
  factory: ({ discoveryApi, fetchApi }) =>
    new TechDocsEditorClient(discoveryApi, fetchApi),
});
```

### `useTechDocsEditorApi`

Convenience hook — equivalent to `useApi(TechDocsEditorApiRef)`.

```ts
import { useTechDocsEditorApi } from '@backstage-community/plugin-techdocs-editor-react';

const api = useTechDocsEditorApi();
```

## Related packages

| Package                                                                                                                                    | Description                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| [`@backstage-community/plugin-techdocs-editor`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor)                 | Frontend plugin (NFS & classic) — re-exports this package |
| [`@backstage-community/plugin-techdocs-editor-backend`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-backend) | Backend REST API                                          |
| [`@backstage-community/plugin-techdocs-editor-common`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-common)   | Shared types used by this package                         |

## License

Apache-2.0
