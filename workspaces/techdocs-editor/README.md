# techdocs-editor

This workspace contains the TechDocs Editor plugin suite for Backstage, enabling users to edit documentation directly in the app using a WYSIWYG or Markdown editor and submit changes as pull/merge requests to GitHub or GitLab.

## Packages

- [techdocs-editor](./plugins/techdocs-editor/README.md): Frontend plugin — editor page, file tree, and Submit Changes dialog.
- [techdocs-editor-backend](./plugins/techdocs-editor-backend/README.md): Backend plugin — REST API, VCS providers (GitHub/GitLab), permission enforcement, and conflict detection.
- [techdocs-editor-react](./plugins/techdocs-editor-react/README.md): Shared React components and `TechDocsEditorClient` API.
- [techdocs-editor-node](./plugins/techdocs-editor-node/README.md): Extension point (`techdocsEditorVcsProviderExtensionPoint`) for adding custom VCS providers via backend modules.
- [techdocs-editor-common](./plugins/techdocs-editor-common/README.md): Shared types, permissions, and request/response interfaces.

## Getting Started

To start the app, run:

```sh
yarn install
yarn start
```

To generate knip reports for this app, run:

```sh
yarn backstage-repo-tools knip-reports
```
