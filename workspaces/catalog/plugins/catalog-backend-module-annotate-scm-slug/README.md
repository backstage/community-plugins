# @backstage-community/plugin-catalog-backend-module-annotate-scm-slug

This module will add a processor that will add SCM slug annotation for the GitHub, GitLab, and Azure DevOps SCM tools. This processor was move from the main Backstage repo.

## Setup

Here's how to get the module up and running:

1. First we need to add the `@backstage-community/plugin-catalog-backend-module-annotate-scm-slug` package to your backend:

   ```sh
   # From the Backstage root directory
   yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-annotate-scm-slug
   ```

2. Then add the plugin to your backend index file:

   ```ts
   // In packages/backend/src/index.ts
   const backend = createBackend();
   // ... other feature additions
   backend.add(import('@backstage/plugin-catalog-backend'));
   backend.add(
     import(
       '@backstage-community/plugin-catalog-backend-module-annotate-scm-slug'
     ),
   );
   ```

3. Now run `yarn start` from the repo root

Once catalog process has ran you should see the SCM slug added as an annotation on your entities.

## Slugs Added

These are the current SCM tools and their related annotation and value that are being added by this processor.

> [!TIP] For Azure DevOps users we recommend using [`@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor`](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/catalog-backend-module-azure-devops-annotator-processor) instead

| SCM          | Annotation                   | Value          |
| ------------ | ---------------------------- | -------------- |
| GitHub       | `github.com/project-slug`    | `org/repo`     |
| GitLab       | `gitlab.com/project-slug`    | `project/repo` |
| Azure DevOps | `dev.azure.com/project-repo` | `project/repo` |
