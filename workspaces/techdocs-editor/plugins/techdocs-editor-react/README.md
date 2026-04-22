# @backstage-community/plugin-techdocs-editor-react

Shared React components, hooks, and the API client for the TechDocs Editor plugin suite. Consumed by the frontend plugin and by adopters who want to embed the editor in custom pages.

## Installation

This package is installed automatically as a dependency of `@backstage-community/plugin-techdocs-editor`. To use it directly:

```bash
yarn --cwd packages/app add @backstage-community/plugin-techdocs-editor-react
```

## Usage

Embed the full editor page in a custom route or entity tab:

```tsx
import { TechDocsEditorPage } from '@backstage-community/plugin-techdocs-editor-react';

<TechDocsEditorPage
  entityRef={{ namespace: 'default', kind: 'component', name: 'my-service' }}
/>;
```

Use the API client directly:

```tsx
import {
  TechDocsEditorApiRef,
  TechDocsEditorClient,
} from '@backstage-community/plugin-techdocs-editor-react';
import {
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

const techDocsEditorApiFactory = createApiFactory({
  api: TechDocsEditorApiRef,
  deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
  factory: ({ discoveryApi, fetchApi }) =>
    new TechDocsEditorClient(discoveryApi, fetchApi),
});
```

## Exports

| Symbol                   | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| `TechDocsEditorPage`     | Full-page editor — file tree, WYSIWYG editor, toolbar, and submit dialog |
| `TechDocsFileTree`       | Sidebar file tree; accepts `onCreateFile` for new-page creation          |
| `TechDocsMarkdownEditor` | Toast UI-based WYSIWYG Markdown editor                                   |
| `SubmitEditsDialog`      | Dialog for entering a PR title and submitting edits                      |
| `TechDocsEditorApiRef`   | API ref for dependency injection                                         |
| `TechDocsEditorClient`   | Default REST API client implementation                                   |
| `useTechDocsEditorApi`   | Hook that returns the bound `TechDocsEditorApi`                          |

## Links

- [Frontend plugin](../techdocs-editor/README.md)
- [Backend plugin](../techdocs-editor-backend/README.md)
