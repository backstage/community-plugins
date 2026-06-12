# @backstage-community/plugin-techdocs-editor-common

Shared types and Backstage permission definitions for the TechDocs Editor plugin suite. Used by both the frontend and backend packages.

## Installation

This package is installed automatically as a transitive dependency. To add it explicitly:

```bash
yarn --cwd packages/app add @backstage-community/plugin-techdocs-editor-common
```

## Types

| Symbol                | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `DocTree`             | Tree of documentation file nodes for a catalog entity                       |
| `DocTreeNode`         | A single node in the file tree (`title`, `path`, optional `children`)       |
| `MkDocsConfig`        | Parsed `mkdocs.yml` config shape (`site_name`, `docs_dir`, `nav`, etc.)     |
| `EditedFile`          | A modified file (`path`, `content`, `etag` for conflict detection)          |
| `SubmitEditsRequest`  | Request body for `POST /submissions/...` (`prTitle`, `baseBranch`, `files`) |
| `SubmitEditsResponse` | Response from a successful submission (`url`, `number`)                     |
| `FileConflict`        | Conflict detail returned in a `409` response (`path`, `serverEtag`)         |

## Permissions

```ts
import {
  techdocsEditorReadPermission,
  techdocsEditorWritePermission,
} from '@backstage-community/plugin-techdocs-editor-common';
```

Both permissions are of `'basic'` type and belong to the `techdocs.editor` resource type:

| Permission                      | Resource type     | Action  |
| ------------------------------- | ----------------- | ------- |
| `techdocsEditorReadPermission`  | `techdocs.editor` | `read`  |
| `techdocsEditorWritePermission` | `techdocs.editor` | `write` |

## Links

- [Frontend plugin](../techdocs-editor/README.md)
- [Backend plugin](../techdocs-editor-backend/README.md)
- [Node extension point](../techdocs-editor-node/README.md)
