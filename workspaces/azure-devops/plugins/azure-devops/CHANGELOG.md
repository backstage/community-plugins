# @backstage-community/plugin-azure-devops

## 0.28.1

### Patch Changes

- 8d3c162: **DEPRECATED** This change marks the `AzurePullRequestsIcon` as deprecated, use `RiGitPullRequestLine` from `@remixicon/react` instead.

  Migrated Material UI Icons to Remix Icons, also fixed a bug in `AzureDevOpsWikiArticleSearchResultListItem` to filter on the correct `result.type`

## 0.28.0

### Minor Changes

- 00555dc: Backstage version bump to v1.48.2

### Patch Changes

- Updated dependencies [00555dc]
  - @backstage-community/plugin-azure-devops-common@0.20.0

## 0.27.0

### Minor Changes

- 516a7f1: **BREAKING** Backstage UI (BUI) is now required for the Azure DevOps plugin to function

  Initial Migration to Backstage UI (BUI) including Azure Pipelines, Azure Repos, Azure Repos Git Tags, and Azure Readme

## 0.26.0

### Minor Changes

- 5bb714f: Updated readme to add a clarification for readme-path annotation.

## 0.25.0

### Minor Changes

- 5f512a6: Backstage version bump to v1.47.2

### Patch Changes

- Updated dependencies [5f512a6]
  - @backstage-community/plugin-azure-devops-common@0.19.0

## 0.24.1

### Patch Changes

- 2d46e09: Added an icon to the `azureDevOpsWikiArticleSearchResultListItem` used by the New Frontend System so that the results look better and easier to identify where they come from.

## 0.24.0

### Minor Changes

- f9618c9: Backstage version bump to v1.46.2

### Patch Changes

- Updated dependencies [f9618c9]
  - @backstage-community/plugin-azure-devops-common@0.18.0

## 0.23.0

### Minor Changes

- 293b051: Added forked Azure DevOps Wiki collator

## 0.22.0

### Minor Changes

- 840c7dc: Backstage version bump to v1.45.1

### Patch Changes

- Updated dependencies [840c7dc]
  - @backstage-community/plugin-azure-devops-common@0.17.0

## 0.21.0

### Minor Changes

- 12fd25a: **BREAKING** Removed deprecated `getRepoBuilds` on the frontend and backend along with related code. The are no usages of this method as it was replaced by `getBuildRuns` well over a year ago. The previously deprecated `getBuildDefinitions` has been marked as `private` as it only has a single internal usage that was missed when it was marked as deprecated.
- ff113c2: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [ff113c2]
  - @backstage-community/plugin-azure-devops-common@0.16.0

## 0.20.0

### Minor Changes

- 40839b2: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [40839b2]
  - @backstage-community/plugin-azure-devops-common@0.15.0

## 0.19.0

### Minor Changes

- 8367480: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [8367480]
  - @backstage-community/plugin-azure-devops-common@0.14.0

## 0.18.0

### Minor Changes

- 1634963: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [1634963]
  - @backstage-community/plugin-azure-devops-common@0.13.0

## 0.17.0

### Minor Changes

- 1e109cd: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [1e109cd]
  - @backstage-community/plugin-azure-devops-common@0.12.0

## 0.16.1

### Patch Changes

- ae70011: Moved `getAnnotationValuesFromEntity` to the common package and deprecated the current location. This will be removed in a future version.
- 837d67f: Updated `README` with details regarding spaces in project and repo names
- 9cf745c: Updated permissions section in `README` to remove legacy backend references and to make the instructions more clear
- 3622b13: Deprecated `getRepoBuilds` on the frontend and backend along with related code. The are no usages of this method as it was replaced by `getBuildRuns` well over a year ago. This will be removed in a future release.
- d813cec: Updated the `createFrontendPlugin` call to use `pluginId` instead of the deprecated `id`
- 764e1ef: Added a check to validate that the `dev.azure.com/readme-path` annotation value does not have a relative path and throw an error with details if it does as this is not supported by the Azure DevOps API used for this feature.
- 071eb9b: Added a note to the `README` regarding what value to use for the `dev.azure.com/build-definition` annotation and how you can find it in Azure DevOps if you are unsure.
- Updated dependencies [ae70011]
  - @backstage-community/plugin-azure-devops-common@0.11.1

## 0.16.0

### Minor Changes

- dd67a17: Backstage version bump to v1.39.0

### Patch Changes

- Updated dependencies [dd67a17]
  - @backstage-community/plugin-azure-devops-common@0.11.0

## 0.15.0

### Minor Changes

- 8e54e8e: **BREAKING** If the specified build definition is not found, return no results and display a message explaining why.

## 0.14.0

### Minor Changes

- 79f360a: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [79f360a]
  - @backstage-community/plugin-azure-devops-common@0.10.0

## 0.13.2

### Patch Changes

- 4aad9f3: remove unused devDependency `canvas`

## 0.13.1

### Patch Changes

- 7f32b36: Added New Frontend System filter for cards and tabs so they use `isAzureDevOpsAvailable` and `isAzurePipelinesAvailable` to control their visibility

## 0.13.0

### Minor Changes

- 75f72bb: Backstage version bump to v1.37.0

### Patch Changes

- Updated dependencies [75f72bb]
  - @backstage-community/plugin-azure-devops-common@0.9.0

## 0.12.0

### Minor Changes

- 1e8ea62: Export function `getAnnotationValuesFromEntity`

## 0.11.0

### Minor Changes

- 32ab469: Add the ability to fetch and see a build's log

## 0.10.0

### Minor Changes

- ff23f2f: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [ff23f2f]
  - @backstage-community/plugin-azure-devops-common@0.8.0

## 0.9.0

### Minor Changes

- 2ca3917: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [2ca3917]
  - @backstage-community/plugin-azure-devops-common@0.7.0

## 0.8.0

### Minor Changes

- 52190f0: Backstage version bump to v1.34.1

### Patch Changes

- Updated dependencies [52190f0]
  - @backstage-community/plugin-azure-devops-common@0.6.0

## 0.7.0

### Minor Changes

- 7ce46dc: Backstage version bump to v1.33.5

### Patch Changes

- Updated dependencies [7ce46dc]
  - @backstage-community/plugin-azure-devops-common@0.5.0

## 0.6.3

### Patch Changes

- d71fade: Reverted the MUI v5 migration

## 0.6.2

### Patch Changes

- c5283ca: Migrated to using MUI v5

## 0.6.1

### Patch Changes

- dab2f81: Backstage version bump to v1.32.2
- Updated dependencies [dab2f81]
  - @backstage-community/plugin-azure-devops-common@0.4.9

## 0.6.0

### Minor Changes

- 904a6a2: Fixed a link to azure-devops-backend plugin in Readme.

## 0.5.1

### Patch Changes

- 2dd98b6: Backstage version bump to v1.31.1
- Updated dependencies [2dd98b6]
  - @backstage-community/plugin-azure-devops-common@0.4.8

## 0.5.0

### Minor Changes

- c6f00d3: **BREAKING** This change removes the deprecated `AzureDevOpsAnnotatorProcessor` from `@backstage-community/plugin-azure-devops-backend`. It also removes the export of `AzureDevOpsAnnotatorProcessor` from `@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor`. Please install this processor using [the New Backend System setup](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/catalog-backend-module-azure-devops-annotator-processor#setup), which is now the default.

## 0.4.10

### Patch Changes

- 45fd620: use new FE system syntax (replacing deprecated methods)

## 0.4.9

### Patch Changes

- b6515fa: Backstage version bump to v1.30.2
- Updated dependencies [b6515fa]
  - @backstage-community/plugin-azure-devops-common@0.4.7

## 0.4.8

### Patch Changes

- d33c708: version:bump to v1.29.1
- Updated dependencies [d33c708]
  - @backstage-community/plugin-azure-devops-common@0.4.6

## 0.4.7

### Patch Changes

- 31aba58: Added package metadata
- Updated dependencies [31aba58]
  - @backstage-community/plugin-azure-devops-common@0.4.5

## 0.4.6

### Patch Changes

- 8276458: Fixed bug in AzureDevOpsClient where multiple entityRef query parameters were appended in case of multiple build definitions, which caused 400 Bad Request error.
- 2deaaa0: Backstage v1.28.4 version bump
- Updated dependencies [2deaaa0]
  - @backstage-community/plugin-azure-devops-common@0.4.4

## 0.4.5

### Patch Changes

- 0a6bae4: Backstage `1.27.6` version bump
- 0032b05: Updated dependencies
- Updated dependencies [0a6bae4]
- Updated dependencies [0032b05]
  - @backstage-community/plugin-azure-devops-common@0.4.3

## 0.4.4

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-azure-devops-common@0.4.2

## 0.4.3

### Patch Changes

- 95b0573: `getAllTeams` now accepts an optional `limit` parameter which can be used to return more than the default limit of 100 teams from the Azure DevOps API

  `pullRequestOptions` have been equipped with `teamsLimit` so that the property can be used with `getAllTeams`

- 4d895b3: Fixed bug in EntityPageAzurePipeline component where build definition annotation used for viewing pipelines
- abfbcfc: Updated dependency `@testing-library/react` to `^15.0.0`.
- cb1e3b0: Updated dependency `@testing-library/dom` to `^10.0.0`.
- Updated dependencies
  - @backstage-community/plugin-azure-devops-common@0.4.1
  - @backstage/plugin-catalog-react@1.11.3
  - @backstage/core-compat-api@0.2.4
  - @backstage/core-components@0.14.4
  - @backstage/core-plugin-api@1.9.2
  - @backstage/frontend-plugin-api@0.6.4
  - @backstage/plugin-permission-react@0.4.22
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4

## 0.4.3-next.1

### Patch Changes

- 95b0573: `getAllTeams` now accepts an optional `limit` parameter which can be used to return more than the default limit of 100 teams from the Azure DevOps API

  `pullRequestOptions` have been equipped with `teamsLimit` so that the property can be used with `getAllTeams`

- 4d895b3: Fixed bug in EntityPageAzurePipeline component where build definition annotation used for viewing pipelines
- Updated dependencies
  - @backstage-community/plugin-azure-devops-common@0.4.1-next.0
  - @backstage/frontend-plugin-api@0.6.4-next.1
  - @backstage/core-compat-api@0.2.4-next.1
  - @backstage/catalog-model@1.4.5
  - @backstage/core-components@0.14.4-next.0
  - @backstage/core-plugin-api@1.9.1
  - @backstage/errors@1.2.4
  - @backstage/plugin-catalog-react@1.11.3-next.1
  - @backstage/plugin-permission-react@0.4.21

## 0.4.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.4-next.0
  - @backstage/catalog-model@1.4.5
  - @backstage/core-compat-api@0.2.4-next.0
  - @backstage/core-plugin-api@1.9.1
  - @backstage/errors@1.2.4
  - @backstage/frontend-plugin-api@0.6.4-next.0
  - @backstage-community/plugin-azure-devops-common@0.4.0
  - @backstage/plugin-catalog-react@1.11.3-next.0
  - @backstage/plugin-permission-react@0.4.21

## 0.4.2

### Patch Changes

- e8f026a: Use ESM exports of react-use library
- Updated dependencies
  - @backstage/core-components@0.14.3
  - @backstage/plugin-catalog-react@1.11.2
  - @backstage/frontend-plugin-api@0.6.3
  - @backstage/core-compat-api@0.2.3
  - @backstage/core-plugin-api@1.9.1
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-azure-devops-common@0.4.0
  - @backstage/plugin-permission-react@0.4.21

## 0.4.1

### Patch Changes

- e8f026a: Use ESM exports of react-use library
- Updated dependencies
  - @backstage/core-components@0.14.2
  - @backstage/plugin-catalog-react@1.11.1
  - @backstage/frontend-plugin-api@0.6.2
  - @backstage/core-compat-api@0.2.2
  - @backstage/core-plugin-api@1.9.1
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-azure-devops-common@0.4.0
  - @backstage/plugin-permission-react@0.4.21

## 0.4.0

### Minor Changes

- 9fdb86a: Ability to fetch the README file from a different Azure DevOps path.

  Defaults to the current, Azure DevOps default behaviour (`README.md` in the root of the git repo); to use a different path, add the annotation `dev.azure.com/readme-path`

  Example:

  ```yaml
  dev.azure.com/readme-path: /my-path/README.md
  ```

- a9e7bd6: **BREAKING** The `AzureDevOpsClient` no longer requires `identityAPi` but now requires `fetchApi`.

  Updated to use `fetchApi` as per [ADR013](https://backstage.io/docs/architecture-decisions/adrs-adr013)

- 3270b1b: Azure DevOps plugin is now integrated with permission framework for its core features, see the https://github.com/backstage/backstage/blob/master/plugins/azure-devops/README.md#permission-framework for more details.

### Patch Changes

- b7b0466: Remove the use of the deprecated `customStyles` for `Avatar`
- 9f19476: Updated README
- Updated dependencies
  - @backstage/core-components@0.14.1
  - @backstage/errors@1.2.4
  - @backstage/plugin-catalog-react@1.11.0
  - @backstage-community/plugin-azure-devops-common@0.4.0
  - @backstage/catalog-model@1.4.5
  - @backstage/core-compat-api@0.2.1
  - @backstage/core-plugin-api@1.9.1
  - @backstage/frontend-plugin-api@0.6.1
  - @backstage/plugin-permission-react@0.4.21

## 0.4.0-next.2

### Patch Changes

- 9f19476: Updated README
- Updated dependencies
  - @backstage/core-components@0.14.1-next.2
  - @backstage/plugin-catalog-react@1.11.0-next.2
  - @backstage/frontend-plugin-api@0.6.1-next.2
  - @backstage/core-compat-api@0.2.1-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/core-plugin-api@1.9.1-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-azure-devops-common@0.4.0-next.1
  - @backstage/plugin-permission-react@0.4.21-next.1

## 0.4.0-next.1

### Minor Changes

- 3270b1b: Azure DevOps plugin is now integrated with permission framework for its core features, see the https://github.com/backstage/backstage/blob/master/plugins/azure-devops/README.md#permission-framework for more details.

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.1-next.1
  - @backstage/plugin-catalog-react@1.10.1-next.1
  - @backstage-community/plugin-azure-devops-common@0.4.0-next.1
  - @backstage/core-plugin-api@1.9.1-next.1
  - @backstage/plugin-permission-react@0.4.21-next.1
  - @backstage/frontend-plugin-api@0.6.1-next.1
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/core-compat-api@0.2.1-next.1
  - @backstage/errors@1.2.4-next.0

## 0.4.0-next.0

### Minor Changes

- 9fdb86a: Ability to fetch the README file from a different Azure DevOps path.

  Defaults to the current, Azure DevOps default behaviour (`README.md` in the root of the git repo); to use a different path, add the annotation `dev.azure.com/readme-path`

  Example:

  ```yaml
  dev.azure.com/readme-path: /my-path/README.md
  ```

- a9e7bd6: **BREAKING** The `AzureDevOpsClient` no longer requires `identityAPi` but now requires `fetchApi`.

  Updated to use `fetchApi` as per [ADR013](https://backstage.io/docs/architecture-decisions/adrs-adr013)

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.4-next.0
  - @backstage/core-components@0.14.1-next.0
  - @backstage/plugin-catalog-react@1.10.1-next.0
  - @backstage-community/plugin-azure-devops-common@0.4.0-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/core-plugin-api@1.9.1-next.0
  - @backstage/frontend-plugin-api@0.6.1-next.0
  - @backstage/core-compat-api@0.2.1-next.0

## 0.3.12

### Patch Changes

- e2083df: Added alpha support for the New Frontend System (Declarative Integration)
- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 8fe56a8: Widen `@types/react` dependency range to include version 18.
- 995d280: Updated imports from named to default imports to help with the Material UI v4 to v5 migration
- cb0afaa: Prefer `dev.azure.com/build-definition` annotation when it is provided, as it is more specific than `dev.azure.com/project-repo`. This can also be used as a filter for mono-repos.
- Updated dependencies
  - @backstage/frontend-plugin-api@0.6.0
  - @backstage/core-compat-api@0.2.0
  - @backstage/plugin-catalog-react@1.10.0
  - @backstage/core-components@0.14.0
  - @backstage/catalog-model@1.4.4
  - @backstage/core-plugin-api@1.9.0
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.2

## 0.3.12-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.0-next.2
  - @backstage/plugin-catalog-react@1.10.0-next.3
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/core-compat-api@0.2.0-next.3
  - @backstage/core-plugin-api@1.9.0-next.1
  - @backstage/errors@1.2.3
  - @backstage/frontend-plugin-api@0.6.0-next.3
  - @backstage-community/plugin-azure-devops-common@0.3.2

## 0.3.12-next.2

### Patch Changes

- e2083df: Added alpha support for the New Frontend System (Declarative Integration)
- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 8fe56a8: Widen `@types/react` dependency range to include version 18.
- Updated dependencies
  - @backstage/core-components@0.14.0-next.1
  - @backstage/core-plugin-api@1.9.0-next.1
  - @backstage/frontend-plugin-api@0.6.0-next.2
  - @backstage/plugin-catalog-react@1.10.0-next.2
  - @backstage/core-compat-api@0.2.0-next.2
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.2

## 0.3.12-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.0-next.0
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/core-plugin-api@1.8.3-next.0
  - @backstage/plugin-catalog-react@1.9.4-next.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.2

## 0.3.12-next.0

### Patch Changes

- 995d280: Updated imports from named to default imports to help with the Material UI v4 to v5 migration
- cb0afaa: Prefer `dev.azure.com/build-definition` annotation when it is provided, as it is more specific than `dev.azure.com/project-repo`. This can also be used as a filter for mono-repos.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.4-next.0
  - @backstage/core-components@0.13.10
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.2
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.2

## 0.3.11

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/core-components@0.13.10
  - @backstage/core-plugin-api@1.8.2
  - @backstage/plugin-catalog-react@1.9.3
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.2

## 0.3.11-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.3-next.2

## 0.3.11-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.2-next.0
  - @backstage/core-components@0.13.10-next.1
  - @backstage/plugin-catalog-react@1.9.3-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.2

## 0.3.11-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/core-components@0.13.10-next.0
  - @backstage/plugin-catalog-react@1.9.3-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.2

## 0.3.10

### Patch Changes

- c70e4f5: Added multi-org support
- 7c9af0b: Added support for annotations that use a subpath for the host. Also validated that the annotations have the correct number of slashes.
- 043b724: Introduced new `AzureDevOpsAnnotatorProcessor` that adds the needed annotations automatically. Also, moved constants to common package so they can be shared more easily
- Updated dependencies
  - @backstage/core-plugin-api@1.8.1
  - @backstage/plugin-catalog-react@1.9.2
  - @backstage/core-components@0.13.9
  - @backstage/theme@0.5.0
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3

## 0.3.10-next.3

### Patch Changes

- c70e4f5: Added multi-org support
- 7c9af0b: Added support for annotations that use a subpath for the host. Also validated that the annotations have the correct number of slashes.
- Updated dependencies
  - @backstage-community/plugin-azure-devops-common@0.3.2-next.1
  - @backstage/core-components@0.13.9-next.3
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/errors@1.2.3
  - @backstage/theme@0.5.0-next.1
  - @backstage/plugin-catalog-react@1.9.2-next.3

## 0.3.10-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.5.0-next.1
  - @backstage/plugin-catalog-react@1.9.2-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/core-components@0.13.9-next.2
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.2-next.0

## 0.3.10-next.1

### Patch Changes

- 043b724c56: Introduced new `AzureDevOpsAnnotatorProcessor` that adds the needed annotations automatically. Also, moved constants to common package so they can be shared more easily
- Updated dependencies
  - @backstage/core-components@0.13.9-next.1
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/plugin-catalog-react@1.9.2-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.2-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/theme@0.5.0-next.0

## 0.3.10-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.1-next.0
  - @backstage/plugin-catalog-react@1.9.2-next.0
  - @backstage/core-components@0.13.9-next.0
  - @backstage/theme@0.5.0-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.3.8

### Patch Changes

- 6c2b872153: Add official support for React 18.
- ce9e59cbb3: Refactored the error handling for some of the hooks
- 361bb34d8e: Consolidated getting the annotation values into a single function to help with future changes
- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.0
  - @backstage/core-components@0.13.8
  - @backstage/core-plugin-api@1.8.0
  - @backstage/theme@0.4.4
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.3.8-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.8-next.2
  - @backstage/plugin-catalog-react@1.9.0-next.2

## 0.3.8-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.0-next.1
  - @backstage/core-components@0.13.8-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.0-next.0
  - @backstage/errors@1.2.3
  - @backstage/theme@0.4.4-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.3.8-next.0

### Patch Changes

- 6c2b872153: Add official support for React 18.
- 361bb34d8e: Consolidated getting the annotation values into a single function to help with future changes
- Updated dependencies
  - @backstage/core-components@0.13.7-next.0
  - @backstage/plugin-catalog-react@1.9.0-next.0
  - @backstage/core-plugin-api@1.8.0-next.0
  - @backstage/theme@0.4.4-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.3.7

### Patch Changes

- 9a1fce352e: Updated dependency `@testing-library/jest-dom` to `^6.0.0`.
- f95af4e540: Updated dependency `@testing-library/dom` to `^9.0.0`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.5
  - @backstage/core-plugin-api@1.7.0
  - @backstage/core-components@0.13.6
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/theme@0.4.3
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.3.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.6-next.2
  - @backstage/core-plugin-api@1.7.0-next.1
  - @backstage/catalog-model@1.4.3-next.0
  - @backstage/plugin-catalog-react@1.8.5-next.2
  - @backstage/errors@1.2.3-next.0
  - @backstage/theme@0.4.3-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.3.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.6-next.1
  - @backstage/plugin-catalog-react@1.8.5-next.1
  - @backstage/core-plugin-api@1.7.0-next.0
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/theme@0.4.2
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.3.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.5-next.0
  - @backstage/core-plugin-api@1.7.0-next.0
  - @backstage/core-components@0.13.6-next.0
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/theme@0.4.2
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.3.6

### Patch Changes

- 482bb5c0bbf8: Moved `@types/react` to be a regular dependency
- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- 8cec7664e146: Removed `@types/node` dependency
- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.4
  - @backstage/core-components@0.13.5
  - @backstage/catalog-model@1.4.2
  - @backstage/core-plugin-api@1.6.0
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-azure-devops-common@0.3.1
  - @backstage/theme@0.4.2

## 0.3.6-next.3

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- Updated dependencies
  - @backstage/catalog-model@1.4.2-next.2
  - @backstage/core-components@0.13.5-next.3
  - @backstage/core-plugin-api@1.6.0-next.3
  - @backstage/errors@1.2.2-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.1-next.0
  - @backstage/plugin-catalog-react@1.8.4-next.3
  - @backstage/theme@0.4.2-next.0

## 0.3.6-next.2

### Patch Changes

- 8cec7664e146: Removed `@types/node` dependency
- Updated dependencies
  - @backstage/core-components@0.13.5-next.2
  - @backstage/core-plugin-api@1.6.0-next.2
  - @backstage/plugin-catalog-react@1.8.4-next.2
  - @backstage/catalog-model@1.4.2-next.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.4-next.1
  - @backstage/core-components@0.13.5-next.1
  - @backstage/catalog-model@1.4.2-next.0
  - @backstage/core-plugin-api@1.6.0-next.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.5-next.0

### Patch Changes

- 482bb5c0bbf8: Moved `@types/react` to be a regular dependency
- Updated dependencies
  - @backstage/core-plugin-api@1.6.0-next.0
  - @backstage/core-components@0.13.5-next.0
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/plugin-catalog-react@1.8.3-next.0

## 0.3.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.4
  - @backstage/plugin-catalog-react@1.8.1
  - @backstage/core-plugin-api@1.5.3
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.1-next.1

## 0.3.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.4-next.0
  - @backstage/core-plugin-api@1.5.3
  - @backstage/plugin-catalog-react@1.8.1-next.0
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1
  - @backstage/errors@1.2.1
  - @backstage/plugin-catalog-react@1.8.0
  - @backstage/core-components@0.13.3
  - @backstage/core-plugin-api@1.5.3
  - @backstage/catalog-model@1.4.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.0-next.2
  - @backstage/theme@0.4.1-next.1
  - @backstage/core-plugin-api@1.5.3-next.1
  - @backstage/core-components@0.13.3-next.2
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/errors@1.2.1-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1-next.0
  - @backstage/core-components@0.13.3-next.1
  - @backstage/core-plugin-api@1.5.3-next.0
  - @backstage/plugin-catalog-react@1.7.1-next.1

## 0.3.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/core-components@0.13.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/core-plugin-api@1.5.2
  - @backstage/theme@0.4.0
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/plugin-catalog-react@1.7.1-next.0

## 0.3.1

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.5.2
  - @backstage/core-components@0.13.2
  - @backstage/theme@0.4.0
  - @backstage/plugin-catalog-react@1.7.0
  - @backstage/catalog-model@1.4.0
  - @backstage/errors@1.2.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.1-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.2-next.3
  - @backstage/catalog-model@1.4.0-next.1
  - @backstage/core-plugin-api@1.5.2-next.0
  - @backstage/errors@1.2.0-next.0
  - @backstage/theme@0.4.0-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/plugin-catalog-react@1.7.0-next.3

## 0.3.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.0-next.1
  - @backstage/plugin-catalog-react@1.7.0-next.2
  - @backstage/core-components@0.13.2-next.2
  - @backstage/core-plugin-api@1.5.2-next.0

## 0.3.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.0-next.0
  - @backstage/core-components@0.13.2-next.1
  - @backstage/plugin-catalog-react@1.7.0-next.1
  - @backstage/catalog-model@1.4.0-next.0
  - @backstage/core-plugin-api@1.5.2-next.0
  - @backstage/theme@0.4.0-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.7.0-next.0
  - @backstage/theme@0.4.0-next.0
  - @backstage/core-components@0.13.2-next.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.0

### Minor Changes

- 877df261085: The getBuildRuns function now checks contains multiple comma-separated builds and splits them to send multiple requests for each and concatenates the results.

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.3.0
  - @backstage/plugin-catalog-react@1.6.0
  - @backstage/core-components@0.13.1
  - @backstage/catalog-model@1.3.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.0-next.2

### Minor Changes

- 877df261085: The getBuildRuns function now checks contains multiple comma-separated builds and splits them to send multiple requests for each and concatenates the results.

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.3.0-next.0
  - @backstage/core-components@0.13.1-next.1
  - @backstage/plugin-catalog-react@1.6.0-next.2
  - @backstage/core-plugin-api@1.5.1

## 0.2.9-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.1-next.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/plugin-catalog-react@1.6.0-next.1

## 0.2.9-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.6.0-next.0
  - @backstage/core-components@0.13.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.19
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.8

### Patch Changes

- 8e00acb28db: Small tweaks to remove warnings in the console during development (mainly focusing on techdocs)
- e0c6e8b9c3c: Update peer dependencies
- Updated dependencies
  - @backstage/core-components@0.13.0
  - @backstage/plugin-catalog-react@1.5.0
  - @backstage/theme@0.2.19
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.8-next.3

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.5.0-next.3
  - @backstage/catalog-model@1.3.0-next.0
  - @backstage/core-components@0.13.0-next.3
  - @backstage/core-plugin-api@1.5.1-next.1
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.19-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.8-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.6-next.2
  - @backstage/plugin-catalog-react@1.4.1-next.2
  - @backstage/core-plugin-api@1.5.1-next.1
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.19-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.8-next.1

### Patch Changes

- e0c6e8b9c3c: Update peer dependencies
- Updated dependencies
  - @backstage/core-components@0.12.6-next.1
  - @backstage/core-plugin-api@1.5.1-next.0
  - @backstage/plugin-catalog-react@1.4.1-next.1
  - @backstage/theme@0.2.19-next.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.8-next.0

### Patch Changes

- 8e00acb28db: Small tweaks to remove warnings in the console during development (mainly focusing on techdocs)
- Updated dependencies
  - @backstage/core-components@0.12.6-next.0
  - @backstage/plugin-catalog-react@1.4.1-next.0
  - @backstage/core-plugin-api@1.5.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.18
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.7

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/core-components@0.12.5
  - @backstage/plugin-catalog-react@1.4.0
  - @backstage/errors@1.1.5
  - @backstage/core-plugin-api@1.5.0
  - @backstage/catalog-model@1.2.1
  - @backstage/theme@0.2.18
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.5-next.2
  - @backstage/plugin-catalog-react@1.4.0-next.2
  - @backstage/core-plugin-api@1.5.0-next.2

## 0.2.7-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/core-components@0.12.5-next.1
  - @backstage/errors@1.1.5-next.0
  - @backstage/core-plugin-api@1.4.1-next.1
  - @backstage/theme@0.2.18-next.0
  - @backstage/plugin-catalog-react@1.4.0-next.1
  - @backstage/catalog-model@1.2.1-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.4.0-next.0
  - @backstage/core-plugin-api@1.4.1-next.0
  - @backstage/catalog-model@1.2.1-next.0
  - @backstage/core-components@0.12.5-next.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.17
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.6

### Patch Changes

- 347b16ecea: Fixed `AssignedToCurrentUsersTeams` & `CreatedByCurrentUsersTeams` filter in `AzurePullRequestsPage` component.
- Updated dependencies
  - @backstage/core-components@0.12.4
  - @backstage/catalog-model@1.2.0
  - @backstage/theme@0.2.17
  - @backstage/core-plugin-api@1.4.0
  - @backstage/plugin-catalog-react@1.3.0
  - @backstage/errors@1.1.4
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.2.0-next.1
  - @backstage/core-components@0.12.4-next.1
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/plugin-catalog-react@1.3.0-next.2

## 0.2.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.4-next.0
  - @backstage/plugin-catalog-react@1.3.0-next.1
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.6-next.0

### Patch Changes

- 347b16ecea: Fixed `AssignedToCurrentUsersTeams` & `CreatedByCurrentUsersTeams` filter in `AzurePullRequestsPage` component.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.3.0-next.0
  - @backstage/catalog-model@1.1.6-next.0

## 0.2.5

### Patch Changes

- 80ce4e8c29: Small updates to some components to ensure theme typography properties are inherited correctly.
- Updated dependencies
  - @backstage/catalog-model@1.1.5
  - @backstage/plugin-catalog-react@1.2.4
  - @backstage/core-components@0.12.3
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.5-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.3.0-next.1
  - @backstage/plugin-catalog-react@1.2.4-next.2
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/core-components@0.12.3-next.2
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.5-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/core-components@0.12.3-next.1
  - @backstage/core-plugin-api@1.2.1-next.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/plugin-catalog-react@1.2.4-next.1

## 0.2.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.0
  - @backstage/plugin-catalog-react@1.2.4-next.0
  - @backstage/core-components@0.12.3-next.0
  - @backstage/core-plugin-api@1.2.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.4

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.2
  - @backstage/plugin-catalog-react@1.2.3

## 0.2.3

### Patch Changes

- 2e701b3796: Internal refactor to use `react-router-dom` rather than `react-router`.
- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/core-plugin-api@1.2.0
  - @backstage/core-components@0.12.1
  - @backstage/errors@1.1.4
  - @backstage/plugin-catalog-react@1.2.2
  - @backstage/catalog-model@1.1.4
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.3-next.4

### Patch Changes

- 2e701b3796: Internal refactor to use `react-router-dom` rather than `react-router`.
- Updated dependencies
  - @backstage/core-components@0.12.1-next.4
  - @backstage/plugin-catalog-react@1.2.2-next.4
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.3-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.1-next.3
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/plugin-catalog-react@1.2.2-next.3

## 0.2.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/core-components@0.12.1-next.2
  - @backstage/plugin-catalog-react@1.2.2-next.2
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.1-next.1
  - @backstage/core-plugin-api@1.1.1-next.1
  - @backstage/plugin-catalog-react@1.2.2-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.3-next.0

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/core-components@0.12.1-next.0
  - @backstage/core-plugin-api@1.1.1-next.0
  - @backstage/plugin-catalog-react@1.2.2-next.0
  - @backstage/catalog-model@1.1.4-next.0
  - @backstage/errors@1.1.4-next.0
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.1
  - @backstage/core-components@0.12.0
  - @backstage/core-plugin-api@1.1.0
  - @backstage/catalog-model@1.1.3
  - @backstage/errors@1.1.3
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.0-next.1
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/core-plugin-api@1.1.0-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/plugin-catalog-react@1.2.1-next.1

## 0.2.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.1-next.0
  - @backstage/core-components@0.12.0-next.0
  - @backstage/core-plugin-api@1.1.0-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.2
  - @backstage/plugin-catalog-react@1.2.0
  - @backstage/core-components@0.11.2
  - @backstage/core-plugin-api@1.0.7
  - @backstage/errors@1.1.2
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.0-next.2
  - @backstage/catalog-model@1.1.2-next.2
  - @backstage/core-components@0.11.2-next.2
  - @backstage/core-plugin-api@1.0.7-next.2
  - @backstage/errors@1.1.2-next.2
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.0-next.1
  - @backstage/core-components@0.11.2-next.1
  - @backstage/core-plugin-api@1.0.7-next.1
  - @backstage/catalog-model@1.1.2-next.1
  - @backstage/errors@1.1.2-next.1
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.2-next.0
  - @backstage/core-components@0.11.2-next.0
  - @backstage/plugin-catalog-react@1.1.5-next.0
  - @backstage/core-plugin-api@1.0.7-next.0
  - @backstage/errors@1.1.2-next.0
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.2.0

### Minor Changes

- 6c1c59b96e: Added README card `EntityAzureReadmeCard` for Azure Devops.

  To get the README component working you'll need to do the following two steps:

  1. First we need to add the @backstage-community/plugin-azure-devops package to your frontend app:

     ```bash
     # From your Backstage root directory
     yarn add --cwd packages/app @backstage-community/plugin-azure-devops
     ```

  2. Second we need to add the `EntityAzureReadmeCard` extension to the entity page in your app:

     ```tsx
     // In packages/app/src/components/catalog/EntityPage.tsx
     import {
       EntityAzureReadmeCard,
       isAzureDevOpsAvailable,
     } from '@backstage-community/plugin-azure-devops';

     // As it is a card, you can customize it the way you prefer
     // For example in the Service section

     const overviewContent = (
       <Grid container spacing={3} alignItems="stretch">
         <EntitySwitch>
           <EntitySwitch.Case if={isAzureDevOpsAvailable}>
             <Grid item md={6}>
               ...
             </Grid>
             <Grid item md={6}>
               <EntityAzureReadmeCard maxHeight={350} />
             </Grid>
           </EntitySwitch.Case>
         </EntitySwitch>
       </Grid>
     );
     ```

  **Notes:**

  - You'll need to add the `EntitySwitch.Case` above from step 2 to all the entity sections you want to see Readme in. For example if you wanted to see Readme when looking at Website entities then you would need to add this to the `websiteEntityPage` section.
  - The `if` prop is optional on the `EntitySwitch.Case`, you can remove it if you always want to see the tab even if the entity being viewed does not have the needed annotation
  - The `maxHeight` property on the `EntityAzureReadmeCard` will set the maximum screen size you would like to see, if not set it will default to 100%

### Patch Changes

- 817f3196f6: Updated React Router dependencies to be peer dependencies.
- 3f739be9d9: Minor API signatures cleanup
- 7d47def9c4: Removed dependency on `@types/jest`.
- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/core-components@0.11.1
  - @backstage/core-plugin-api@1.0.6
  - @backstage/plugin-catalog-react@1.1.4
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/catalog-model@1.1.1
  - @backstage/errors@1.1.1

## 0.2.0-next.3

### Patch Changes

- 7d47def9c4: Removed dependency on `@types/jest`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.4-next.2
  - @backstage/catalog-model@1.1.1-next.0
  - @backstage/core-components@0.11.1-next.3
  - @backstage/core-plugin-api@1.0.6-next.3
  - @backstage/errors@1.1.1-next.0

## 0.2.0-next.2

### Patch Changes

- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- Updated dependencies
  - @backstage/core-components@0.11.1-next.2
  - @backstage/core-plugin-api@1.0.6-next.2

## 0.2.0-next.1

### Patch Changes

- 817f3196f6: Updated React Router dependencies to be peer dependencies.
- Updated dependencies
  - @backstage/core-components@0.11.1-next.1
  - @backstage/core-plugin-api@1.0.6-next.1
  - @backstage/plugin-catalog-react@1.1.4-next.1

## 0.2.0-next.0

### Minor Changes

- 6c1c59b96e: Added README card `EntityAzureReadmeCard` for Azure Devops.

  To get the README component working you'll need to do the following two steps:

  1. First we need to add the @backstage-community/plugin-azure-devops package to your frontend app:

     ```bash
     # From your Backstage root directory
     yarn add --cwd packages/app @backstage-community/plugin-azure-devops
     ```

  2. Second we need to add the `EntityAzureReadmeCard` extension to the entity page in your app:

     ```tsx
     // In packages/app/src/components/catalog/EntityPage.tsx
     import {
       EntityAzureReadmeCard,
       isAzureDevOpsAvailable,
     } from '@backstage-community/plugin-azure-devops';

     // As it is a card, you can customize it the way you prefer
     // For example in the Service section

     const overviewContent = (
       <Grid container spacing={3} alignItems="stretch">
         <EntitySwitch>
           <EntitySwitch.Case if={isAzureDevOpsAvailable}>
             <Grid item md={6}>
               ...
             </Grid>
             <Grid item md={6}>
               <EntityAzureReadmeCard maxHeight={350} />
             </Grid>
           </EntitySwitch.Case>
         </EntitySwitch>
       </Grid>
     );
     ```

  **Notes:**

  - You'll need to add the `EntitySwitch.Case` above from step 2 to all the entity sections you want to see Readme in. For example if you wanted to see Readme when looking at Website entities then you would need to add this to the `websiteEntityPage` section.
  - The `if` prop is optional on the `EntitySwitch.Case`, you can remove it if you always want to see the tab even if the entity being viewed does not have the needed annotation
  - The `maxHeight` property on the `EntityAzureReadmeCard` will set the maximum screen size you would like to see, if not set it will default to 100%

### Patch Changes

- 3f739be9d9: Minor API signatures cleanup
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage-community/plugin-azure-devops-common@0.3.0-next.0
  - @backstage/core-plugin-api@1.0.6-next.0
  - @backstage/core-components@0.11.1-next.0
  - @backstage/plugin-catalog-react@1.1.4-next.0

## 0.1.24

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.11.0
  - @backstage/core-plugin-api@1.0.5
  - @backstage/plugin-catalog-react@1.1.3

## 0.1.24-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.3-next.2
  - @backstage/core-components@0.11.0-next.2

## 0.1.24-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.0.5-next.0
  - @backstage/plugin-catalog-react@1.1.3-next.0
  - @backstage/core-components@0.10.1-next.0

## 0.1.23

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.
- 8006d0f9bf: Updated dependency `msw` to `^0.44.0`.
- e049e41048: Exporting azureDevOpsApiRef, AzureGitTagsIcon, and all hooks for the benefit of other plugins.
- Updated dependencies
  - @backstage/core-components@0.10.0
  - @backstage/catalog-model@1.1.0
  - @backstage/core-plugin-api@1.0.4
  - @backstage/plugin-catalog-react@1.1.2
  - @backstage/theme@0.2.16
  - @backstage/errors@1.1.0
  - @backstage-community/plugin-azure-devops-common@0.2.4

## 0.1.23-next.3

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.
- Updated dependencies
  - @backstage/core-plugin-api@1.0.4-next.0
  - @backstage/core-components@0.10.0-next.3
  - @backstage/catalog-model@1.1.0-next.3
  - @backstage/plugin-catalog-react@1.1.2-next.3
  - @backstage-community/plugin-azure-devops-common@0.2.4-next.0

## 0.1.23-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.10.0-next.2
  - @backstage/catalog-model@1.1.0-next.2
  - @backstage/theme@0.2.16-next.1
  - @backstage/plugin-catalog-react@1.1.2-next.2

## 0.1.23-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.9.6-next.1
  - @backstage/catalog-model@1.1.0-next.1
  - @backstage/errors@1.1.0-next.0
  - @backstage/theme@0.2.16-next.0
  - @backstage/plugin-catalog-react@1.1.2-next.1

## 0.1.23-next.0

### Patch Changes

- e049e41048: Exporting azureDevOpsApiRef, AzureGitTagsIcon, and all hooks for the benefit of other plugins.
- Updated dependencies
  - @backstage/catalog-model@1.1.0-next.0
  - @backstage/core-components@0.9.6-next.0
  - @backstage/plugin-catalog-react@1.1.2-next.0

## 0.1.22

### Patch Changes

- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.1
  - @backstage/core-components@0.9.5
  - @backstage/core-plugin-api@1.0.3
  - @backstage/catalog-model@1.0.3

## 0.1.22-next.1

### Patch Changes

- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/core-components@0.9.5-next.1
  - @backstage/core-plugin-api@1.0.3-next.0
  - @backstage/catalog-model@1.0.3-next.0
  - @backstage/plugin-catalog-react@1.1.1-next.1

## 0.1.22-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.1-next.0
  - @backstage/core-components@0.9.5-next.0

## 0.1.21

### Patch Changes

- ac14fcaf38: Added entity view for Azure Git Tags, based on existing Pull Requests view
- Updated dependencies
  - @backstage/core-components@0.9.4
  - @backstage/core-plugin-api@1.0.2
  - @backstage/plugin-catalog-react@1.1.0
  - @backstage-community/plugin-azure-devops-common@0.2.3
  - @backstage/catalog-model@1.0.2

## 0.1.21-next.2

### Patch Changes

- ac14fcaf38: Added entity view for Azure Git Tags, based on existing Pull Requests view
- Updated dependencies
  - @backstage/core-components@0.9.4-next.1
  - @backstage-community/plugin-azure-devops-common@0.2.3-next.0
  - @backstage/plugin-catalog-react@1.1.0-next.2
  - @backstage/catalog-model@1.0.2-next.0
  - @backstage/core-plugin-api@1.0.2-next.1

## 0.1.21-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.9.4-next.0
  - @backstage/core-plugin-api@1.0.2-next.0
  - @backstage/plugin-catalog-react@1.1.0-next.1

## 0.1.21-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.0-next.0

## 0.1.20

### Patch Changes

- 24254fd433: build(deps): bump `@testing-library/user-event` from 13.5.0 to 14.0.0
- 230ad0826f: Bump to using `@types/node` v16
- Updated dependencies
  - @backstage/plugin-catalog-react@1.0.1
  - @backstage/catalog-model@1.0.1
  - @backstage/core-components@0.9.3
  - @backstage/core-plugin-api@1.0.1

## 0.1.20-next.1

### Patch Changes

- 24254fd433: build(deps): bump `@testing-library/user-event` from 13.5.0 to 14.0.0
- 230ad0826f: Bump to using `@types/node` v16
- Updated dependencies
  - @backstage/core-components@0.9.3-next.2
  - @backstage/core-plugin-api@1.0.1-next.0
  - @backstage/plugin-catalog-react@1.0.1-next.3

## 0.1.20-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.0.1-next.0
  - @backstage/plugin-catalog-react@1.0.1-next.0
  - @backstage/core-components@0.9.3-next.0

## 0.1.19

### Patch Changes

- a422d7ce5e: chore(deps): bump `@testing-library/react` from 11.2.6 to 12.1.3
- 4e6327ef7a: Updated readme
- Updated dependencies
  - @backstage/core-components@0.9.2
  - @backstage/core-plugin-api@1.0.0
  - @backstage/plugin-catalog-react@1.0.0
  - @backstage/catalog-model@1.0.0
  - @backstage/errors@1.0.0

## 0.1.18

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@0.9.0
  - @backstage/core-components@0.9.1
  - @backstage/catalog-model@0.13.0

## 0.1.18-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@0.9.0-next.0
  - @backstage/core-components@0.9.1-next.0
  - @backstage/catalog-model@0.13.0-next.0

## 0.1.17

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@0.12.0
  - @backstage/core-components@0.9.0
  - @backstage/plugin-catalog-react@0.8.0
  - @backstage/core-plugin-api@0.8.0

## 0.1.16

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.10
  - @backstage/plugin-catalog-react@0.7.0
  - @backstage/catalog-model@0.11.0
  - @backstage/core-plugin-api@0.7.0

## 0.1.15

### Patch Changes

- 1ed305728b: Bump `node-fetch` to version 2.6.7 and `cross-fetch` to version 3.1.5
- c77c5c7eb6: Added `backstage.role` to `package.json`
- Updated dependencies
  - @backstage/core-components@0.8.9
  - @backstage/core-plugin-api@0.6.1
  - @backstage/errors@0.2.1
  - @backstage/plugin-catalog-react@0.6.15
  - @backstage/catalog-model@0.10.0
  - @backstage/theme@0.2.15
  - @backstage-community/plugin-azure-devops-common@0.2.1

## 0.1.14

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.8
  - @backstage/plugin-catalog-react@0.6.14

## 0.1.14-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.8-next.0
  - @backstage/plugin-catalog-react@0.6.14-next.0

## 0.1.13

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.7
  - @backstage/plugin-catalog-react@0.6.13

## 0.1.13-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.7-next.0
  - @backstage/plugin-catalog-react@0.6.13-next.0

## 0.1.12

### Patch Changes

- 0f104ecc4d: Updated to support cases where only Azure Pipelines to see Builds. You can use this new feature by adding the `dev.azure.com/project` and `dev.azure.com/build-definition` annotations to your `catalog-info.yaml` files. The Azure DevOps plugin [README has more detailed instructions](https://github.com/backstage/backstage/tree/master/plugins/azure-devops#setup).
- Updated dependencies
  - @backstage/core-components@0.8.6

## 0.1.11

### Patch Changes

- 51fbedc445: Migrated usage of deprecated `IdentityApi` methods.
- Updated dependencies
  - @backstage/core-components@0.8.5
  - @backstage/core-plugin-api@0.6.0
  - @backstage/plugin-catalog-react@0.6.12
  - @backstage/catalog-model@0.9.10

## 0.1.11-next.0

### Patch Changes

- 51fbedc445: Migrated usage of deprecated `IdentityApi` methods.
- Updated dependencies
  - @backstage/core-components@0.8.5-next.0
  - @backstage/core-plugin-api@0.6.0-next.0
  - @backstage/plugin-catalog-react@0.6.12-next.0
  - @backstage/catalog-model@0.9.10-next.0

## 0.1.10

### Patch Changes

- a2ed2c2d69: - feat: Created PullRequestsDashboardProvider for resolving team and team member relations
  - feat: Created useUserTeamIds hook.
  - feat: Updated useFilterProcessor to provide teamIds for `AssignedToCurrentUsersTeams` and `CreatedByCurrentUsersTeams` filters.
- 5333451def: Cleaned up API exports
- Updated dependencies
  - @backstage/core-components@0.8.4
  - @backstage/core-plugin-api@0.5.0
  - @backstage-community/plugin-azure-devops-common@0.2.0
  - @backstage/plugin-catalog-react@0.6.11
  - @backstage/errors@0.2.0
  - @backstage/catalog-model@0.9.9

## 0.1.9

### Patch Changes

- 4ce51ab0f1: Internal refactor of the `react-use` imports to use `react-use/lib/*` instead.
- Updated dependencies
  - @backstage/core-plugin-api@0.4.1
  - @backstage/plugin-catalog-react@0.6.10
  - @backstage/core-components@0.8.3

## 0.1.8

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@0.4.0
  - @backstage/plugin-catalog-react@0.6.8
  - @backstage/core-components@0.8.2

## 0.1.7

### Patch Changes

- daf32e2c9b: Created some initial filters that can be used to create pull request columns:

  - All
  - AssignedToUser
  - AssignedToCurrentUser
  - AssignedToTeam
  - AssignedToTeams
  - AssignedToCurrentUsersTeams
  - CreatedByUser
  - CreatedByCurrentUser
  - CreatedByTeam
  - CreatedByTeams
  - CreatedByCurrentUsersTeams

  Example custom column creation:

  ```tsx
  const COLUMN_CONFIGS: PullRequestColumnConfig[] = [
    {
      title: 'Created by me',
      filters: [{ type: FilterType.CreatedByCurrentUser }],
    },
    {
      title: 'Created by Backstage Core',
      filters: [
        {
          type: FilterType.CreatedByTeam,
          teamName: 'Backstage Core',
        },
      ],
    },
    {
      title: 'Assigned to my teams',
      filters: [{ type: FilterType.AssignedToCurrentUsersTeams }],
    },
    {
      title: 'Other PRs',
      filters: [{ type: FilterType.All }],
      simplified: true,
    },
  ];

  <Route
    path="/azure-pull-requests"
    element={
      <AzurePullRequestsPage
        projectName="{PROJECT_NAME}"
        defaultColumnConfigs={COLUMN_CONFIGS}
      />
    }
  />;
  ```

- Updated dependencies
  - @backstage/core-plugin-api@0.3.1
  - @backstage/core-components@0.8.1
  - @backstage-community/plugin-azure-devops-common@0.1.3
  - @backstage/catalog-model@0.9.8
  - @backstage/plugin-catalog-react@0.6.7

## 0.1.6

### Patch Changes

- cd450844f6: Moved React dependencies to `peerDependencies` and allow both React v16 and v17 to be used.
- Updated dependencies
  - @backstage/core-components@0.8.0
  - @backstage/core-plugin-api@0.3.0
  - @backstage/plugin-catalog-react@0.6.5
  - @backstage-community/plugin-azure-devops-common@0.1.2

## 0.1.5

### Patch Changes

- 0749dd0307: feat: Created pull request card component and initial pull request dashboard page.
- 82cd709fdb: **Backend**

  - Created new `/dashboard-pull-requests/:projectName` endpoint
  - Created new `/all-teams` endpoint
  - Implemented pull request policy evaluation conversion

  **Frontend**

  - Refactored `PullRequestsPage` and added new properties for `projectName` and `pollingInterval`
  - Fixed spacing issue between repo link and creation date in `PullRequestCard`
  - Added missing condition to `PullRequestCardPolicy` for `RequiredReviewers`
  - Updated `useDashboardPullRequests` hook to implement long polling for pull requests

- Updated dependencies
  - @backstage-community/plugin-azure-devops-common@0.1.1
  - @backstage/core-components@0.7.6
  - @backstage/theme@0.2.14
  - @backstage/core-plugin-api@0.2.2

## 0.1.4

### Patch Changes

- a125278b81: Refactor out the deprecated path and icon from RouteRefs
- b5eac957f2: Added entity view for Azure Repo Pull Requests
- 2b5ccd2964: Improved Date handling for the Azure DevOps set of plugins by using strings and letting the frontend handle the conversion to DateTime
- Updated dependencies
  - @backstage/catalog-model@0.9.7
  - @backstage/plugin-catalog-react@0.6.4
  - @backstage/core-components@0.7.4
  - @backstage/core-plugin-api@0.2.0
  - @backstage-community/plugin-azure-devops-common@0.1.0

## 0.1.3

### Patch Changes

- b85acc8c35: refactor(`@backstage-community/plugin-azure-devops`): Consume types from `@backstage-community/plugin-azure-devops-common`.
  Stop re-exporting types from `@backstage-community/plugin-azure-devops-backend`.
  Added new types to `@backstage-community/plugin-azure-devops-common`.
- 84ace9a29c: Simplified queue time calculation in `BuildTable`.
- Updated dependencies
  - @backstage/core-components@0.7.3
  - @backstage/theme@0.2.13
  - @backstage-community/plugin-azure-devops-common@0.0.2
  - @backstage/core-plugin-api@0.1.13
  - @backstage/plugin-catalog-react@0.6.3

## 0.1.2

### Patch Changes

- 7359623e87: Azure DevOps frontend refactoring items from issue #7641

  - Remove backend setup documentation and linked to the Azure DevOps backend plugin for these instructions
  - Improved documentation to be easier to expand with new features in the future
  - Removed Router based on feedback from maintainers
  - Added tests for `getBuildResultComponent` and `getBuildStateComponent` from the BuildTable

- Updated dependencies
  - @backstage/theme@0.2.12
  - @backstage/errors@0.1.4
  - @backstage/core-components@0.7.2
  - @backstage/plugin-catalog-react@0.6.2
  - @backstage/catalog-model@0.9.6
  - @backstage/core-plugin-api@0.1.12

## 0.1.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@0.6.0
  - @backstage/core-components@0.7.0
  - @backstage/theme@0.2.11
