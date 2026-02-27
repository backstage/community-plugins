# @backstage-community/plugin-azure-devops-backend

## 0.26.0

### Minor Changes

- 00555dc: Backstage version bump to v1.48.2

### Patch Changes

- Updated dependencies [00555dc]
  - @backstage-community/plugin-azure-devops-common@0.20.0

## 0.25.0

### Minor Changes

- 5f512a6: Backstage version bump to v1.47.2

### Patch Changes

- Updated dependencies [5f512a6]
  - @backstage-community/plugin-azure-devops-common@0.19.0

## 0.24.1

### Patch Changes

- 7c297d4: Updated dependency `azure-devops-node-api` to `^15.0.0`.

## 0.24.0

### Minor Changes

- f9618c9: Backstage version bump to v1.46.2

### Patch Changes

- Updated dependencies [f9618c9]
  - @backstage-community/plugin-azure-devops-common@0.18.0

## 0.23.0

### Minor Changes

- 840c7dc: Backstage version bump to v1.45.1

### Patch Changes

- Updated dependencies [840c7dc]
  - @backstage-community/plugin-azure-devops-common@0.17.0

## 0.22.0

### Minor Changes

- 12fd25a: **BREAKING** Removed deprecated `getRepoBuilds` on the frontend and backend along with related code. The are no usages of this method as it was replaced by `getBuildRuns` well over a year ago. The previously deprecated `getBuildDefinitions` has been marked as `private` as it only has a single internal usage that was missed when it was marked as deprecated.
- ff113c2: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [ff113c2]
  - @backstage-community/plugin-azure-devops-common@0.16.0

## 0.21.0

### Minor Changes

- 40839b2: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [40839b2]
  - @backstage-community/plugin-azure-devops-common@0.15.0

## 0.20.0

### Minor Changes

- 8367480: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [8367480]
  - @backstage-community/plugin-azure-devops-common@0.14.0

## 0.19.0

### Minor Changes

- 1634963: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [1634963]
  - @backstage-community/plugin-azure-devops-common@0.13.0

## 0.18.0

### Minor Changes

- 1e109cd: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [1e109cd]
  - @backstage-community/plugin-azure-devops-common@0.12.0

## 0.17.1

### Patch Changes

- 3622b13: Deprecated `getRepoBuilds` on the frontend and backend along with related code. The are no usages of this method as it was replaced by `getBuildRuns` well over a year ago. This will be removed in a future release.
- aa1889f: Deprecated `getBuildDefinitions` on the backend and related code. The are no usages of this method as it was replaced by `getBuildRuns` well over a year ago. This will be removed in a future release.
- d813cec: Removed the usage of `permissionIntegrationRouter` in favor of using the new `coreServices.permissionsRegistry`
- Updated dependencies [ae70011]
  - @backstage-community/plugin-azure-devops-common@0.11.1

## 0.17.0

### Minor Changes

- dd67a17: Backstage version bump to v1.39.0

### Patch Changes

- Updated dependencies [dd67a17]
  - @backstage-community/plugin-azure-devops-common@0.11.0

## 0.16.0

### Minor Changes

- 8e54e8e: **BREAKING** If the specified build definition is not found, return no results and display a message explaining why.

### Patch Changes

- 6c0f6ee: Update README links to point to community-plugins repository.

## 0.15.0

### Minor Changes

- 79f360a: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [79f360a]
  - @backstage-community/plugin-azure-devops-common@0.10.0

## 0.14.0

### Minor Changes

- 75f72bb: Backstage version bump to v1.37.0

### Patch Changes

- Updated dependencies [75f72bb]
  - @backstage-community/plugin-azure-devops-common@0.9.0

## 0.13.0

### Minor Changes

- 32ab469: Add the ability to fetch and see a build's log

## 0.12.0

### Minor Changes

- ff23f2f: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [ff23f2f]
  - @backstage-community/plugin-azure-devops-common@0.8.0

## 0.11.0

### Minor Changes

- 2ca3917: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [2ca3917]
  - @backstage-community/plugin-azure-devops-common@0.7.0

## 0.10.1

### Patch Changes

- c9e8956: remove unused dependencies: lodash and yn

## 0.10.0

### Minor Changes

- 52190f0: Backstage version bump to v1.34.1

### Patch Changes

- Updated dependencies [52190f0]
  - @backstage-community/plugin-azure-devops-common@0.6.0

## 0.9.0

### Minor Changes

- 7ce46dc: Backstage version bump to v1.33.5

### Patch Changes

- Updated dependencies [7ce46dc]
  - @backstage-community/plugin-azure-devops-common@0.5.0

## 0.8.0

### Minor Changes

- 0880746: **BREAKING** Removed support for what is known as the legacy backend, please use the New Backend System. Also removed the long deprecated `azureDevOps.token` configuration option, use `integrations.azure` instead.

## 0.7.3

### Patch Changes

- dab2f81: Backstage version bump to v1.32.2
- Updated dependencies [dab2f81]
  - @backstage-community/plugin-azure-devops-common@0.4.9

## 0.7.2

### Patch Changes

- 2dd98b6: Backstage version bump to v1.31.1
- Updated dependencies [2dd98b6]
  - @backstage-community/plugin-azure-devops-common@0.4.8

## 0.7.1

### Patch Changes

- 1b55b99: Marked `createRouter` and `RouterOptions` as deprecated, to be removed soon after the Backstage `1.32.0` release in October

## 0.7.0

### Minor Changes

- c6f00d3: **BREAKING** This change removes the deprecated `AzureDevOpsAnnotatorProcessor` from `@backstage-community/plugin-azure-devops-backend`. It also removes the export of `AzureDevOpsAnnotatorProcessor` from `@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor`. Please install this processor using [the New Backend System setup](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/catalog-backend-module-azure-devops-annotator-processor#setup), which is now the default.

## 0.6.12

### Patch Changes

- b6515fa: Backstage version bump to v1.30.2
- Updated dependencies [b6515fa]
  - @backstage-community/plugin-azure-devops-common@0.4.7

## 0.6.11

### Patch Changes

- ae2ee8a: Updated dependency `@types/supertest` to `^6.0.0`.
  Updated dependency `supertest` to `^7.0.0`.

## 0.6.10

### Patch Changes

- 968258f: Removed code marked as deprecated in the upstream Backstage project

## 0.6.9

### Patch Changes

- d33c708: version:bump to v1.29.1
- Updated dependencies [d33c708]
  - @backstage-community/plugin-azure-devops-common@0.4.6

## 0.6.8

### Patch Changes

- 31aba58: Added package metadata
- Updated dependencies [31aba58]
  - @backstage-community/plugin-azure-devops-common@0.4.5

## 0.6.7

### Patch Changes

- 2deaaa0: Backstage v1.28.4 version bump
- f31e04a: Added new dedicated module for the Azure DevOps Annotator Processor and deprecated the version in the Azure DevOps Backend
- Updated dependencies [2deaaa0]
  - @backstage-community/plugin-azure-devops-common@0.4.4

## 0.6.6

### Patch Changes

- 82b799b: Fixed a bug where proper error was not thrown when the repository was not found.
- fef765e: Updated dependency `azure-devops-node-api` to `^13.0.0`.
- 0a6bae4: Backstage `1.27.6` version bump
- 0032b05: Updated dependencies
- Updated dependencies [0a6bae4]
- Updated dependencies [0032b05]
  - @backstage-community/plugin-azure-devops-common@0.4.3

## 0.6.5

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-azure-devops-common@0.4.2

## 0.6.4

### Patch Changes

- 95b0573: `getAllTeams` now accepts an optional `limit` parameter which can be used to return more than the default limit of 100 teams from the Azure DevOps API

  `pullRequestOptions` have been equipped with `teamsLimit` so that the property can be used with `getAllTeams`

- d5a1fe1: Replaced winston logger with `LoggerService`
- c7c4053: Fixed a bug where the `azureDevOps.token` was not truly optional
- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage-community/plugin-azure-devops-common@0.4.1
  - @backstage/plugin-permission-node@0.7.28
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/plugin-auth-node@0.4.12
  - @backstage/integration@1.10.0
  - @backstage/plugin-catalog-node@1.11.1
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/plugin-catalog-common@1.0.22
  - @backstage/plugin-permission-common@0.7.13

## 0.6.4-next.1

### Patch Changes

- 95b0573: `getAllTeams` now accepts an optional `limit` parameter which can be used to return more than the default limit of 100 teams from the Azure DevOps API

  `pullRequestOptions` have been equipped with `teamsLimit` so that the property can be used with `getAllTeams`

- c7c4053: Fixed a bug where the `azureDevOps.token` was not truly optional
- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage-community/plugin-azure-devops-common@0.4.1-next.0
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage/plugin-auth-node@0.4.12-next.1
  - @backstage/plugin-permission-node@0.7.28-next.1
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/integration@1.10.0-next.0
  - @backstage/plugin-catalog-common@1.0.22
  - @backstage/plugin-catalog-node@1.11.1-next.1
  - @backstage/plugin-permission-common@0.7.13

## 0.6.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.0
  - @backstage/integration@1.10.0-next.0
  - @backstage/backend-plugin-api@0.6.17-next.0
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/plugin-auth-node@0.4.12-next.0
  - @backstage-community/plugin-azure-devops-common@0.4.0
  - @backstage/plugin-catalog-common@1.0.22
  - @backstage/plugin-catalog-node@1.11.1-next.0
  - @backstage/plugin-permission-common@0.7.13
  - @backstage/plugin-permission-node@0.7.28-next.0

## 0.6.3

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.11.0
  - @backstage/plugin-auth-node@0.4.11
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage/plugin-permission-node@0.7.27
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/integration@1.9.1
  - @backstage-community/plugin-azure-devops-common@0.4.0
  - @backstage/plugin-catalog-common@1.0.22
  - @backstage/plugin-permission-common@0.7.13

## 0.6.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.10.0
  - @backstage/backend-common@0.21.5
  - @backstage/plugin-auth-node@0.4.10
  - @backstage/plugin-permission-node@0.7.26
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/integration@1.9.1
  - @backstage-community/plugin-azure-devops-common@0.4.0
  - @backstage/plugin-catalog-common@1.0.22
  - @backstage/plugin-permission-common@0.7.13

## 0.6.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.9.0

## 0.6.0

### Minor Changes

- 9fdb86a: Ability to fetch the README file from a different Azure DevOps path.

  Defaults to the current, Azure DevOps default behaviour (`README.md` in the root of the git repo); to use a different path, add the annotation `dev.azure.com/readme-path`

  Example:

  ```yaml
  dev.azure.com/readme-path: /my-path/README.md
  ```

- 3270b1b: Azure DevOps plugin is now integrated with permission framework for its core features, see the https://github.com/backstage/backstage/blob/master/plugins/azure-devops/README.md#permission-framework for more details.

### Patch Changes

- 4467036: Allow unauthenticated access to health check endpoint.
- 2f77e24: The `azureDevOps` configuration section is now optional and the `azureDevOps.token` has been deprecated. Use `integrations.azure` instead, see the [Azure DevOps Locations](https://backstage.io/docs/integrations/azure/locations) documentation for more details.
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/integration@1.9.1
  - @backstage/plugin-auth-node@0.4.9
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage-community/plugin-azure-devops-common@0.4.0
  - @backstage/plugin-permission-common@0.7.13
  - @backstage/plugin-catalog-node@1.8.0
  - @backstage/plugin-permission-node@0.7.25
  - @backstage/catalog-model@1.4.5
  - @backstage/plugin-catalog-common@1.0.22

## 0.6.0-next.2

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.9.1-next.2
  - @backstage/backend-common@0.21.4-next.2
  - @backstage/plugin-auth-node@0.4.9-next.2
  - @backstage/plugin-catalog-node@1.8.0-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-azure-devops-common@0.4.0-next.1
  - @backstage/plugin-catalog-common@1.0.22-next.1
  - @backstage/plugin-permission-common@0.7.13-next.1
  - @backstage/plugin-permission-node@0.7.25-next.2

## 0.6.0-next.1

### Minor Changes

- 3270b1b: Azure DevOps plugin is now integrated with permission framework for its core features, see the https://github.com/backstage/backstage/blob/master/plugins/azure-devops/README.md#permission-framework for more details.

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage-community/plugin-azure-devops-common@0.4.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage/integration@1.9.1-next.1
  - @backstage/plugin-auth-node@0.4.9-next.1
  - @backstage/plugin-permission-common@0.7.13-next.1
  - @backstage/plugin-permission-node@0.7.25-next.1
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/plugin-catalog-common@1.0.22-next.1
  - @backstage/plugin-catalog-node@1.8.0-next.1

## 0.6.0-next.0

### Minor Changes

- 9fdb86a: Ability to fetch the README file from a different Azure DevOps path.

  Defaults to the current, Azure DevOps default behaviour (`README.md` in the root of the git repo); to use a different path, add the annotation `dev.azure.com/readme-path`

  Example:

  ```yaml
  dev.azure.com/readme-path: /my-path/README.md
  ```

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage-community/plugin-azure-devops-common@0.4.0-next.0
  - @backstage/plugin-catalog-node@1.8.0-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage/integration@1.9.1-next.0
  - @backstage/plugin-catalog-common@1.0.22-next.0

## 0.5.2

### Patch Changes

- 353244d: Added a note about Service Principles
- b64ce5a: Updated New Backend System instructions to use default import
- 25bda45: Fixed bug with `extractPartsFromAsset` that resulted in a leading `.` being removed from the path in an otherwise valid path (ex. `.assets/image.png`). The leading `.` will now only be moved for paths beginning with `./`.
- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0
  - @backstage/backend-plugin-api@0.6.10
  - @backstage/catalog-model@1.4.4
  - @backstage/integration@1.9.0
  - @backstage/plugin-catalog-node@1.7.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/plugin-catalog-common@1.0.21

## 0.5.2-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage/integration@1.9.0-next.1
  - @backstage/plugin-catalog-node@1.6.2-next.3
  - @backstage/backend-plugin-api@0.6.10-next.3
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/plugin-catalog-common@1.0.21-next.0

## 0.5.2-next.2

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage/backend-plugin-api@0.6.10-next.2
  - @backstage/plugin-catalog-node@1.6.2-next.2
  - @backstage/config@1.1.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/integration@1.9.0-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/plugin-catalog-common@1.0.21-next.0

## 0.5.2-next.1

### Patch Changes

- 25bda45: Fixed bug with `extractPartsFromAsset` that resulted in a leading `.` being removed from the path in an otherwise valid path (ex. `.assets/image.png`). The leading `.` will now only be moved for paths beginning with `./`.
- Updated dependencies
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/backend-plugin-api@0.6.10-next.1
  - @backstage/backend-common@0.21.0-next.1
  - @backstage/integration@1.9.0-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/plugin-catalog-common@1.0.21-next.0
  - @backstage/plugin-catalog-node@1.6.2-next.1

## 0.5.2-next.0

### Patch Changes

- 353244d: Added a note about Service Principles
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage/plugin-catalog-node@1.6.2-next.0
  - @backstage/backend-plugin-api@0.6.10-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/integration@1.8.0
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/plugin-catalog-common@1.0.20

## 0.5.1

### Patch Changes

- d076ee4: Updated dependency `azure-devops-node-api` to `^12.0.0`.
- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage/backend-plugin-api@0.6.9
  - @backstage/plugin-catalog-node@1.6.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/integration@1.8.0
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/plugin-catalog-common@1.0.20

## 0.5.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.9-next.2
  - @backstage/backend-common@0.20.1-next.2
  - @backstage/plugin-catalog-node@1.6.1-next.2

## 0.5.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage/integration@1.8.0
  - @backstage/config@1.1.1
  - @backstage/backend-plugin-api@0.6.9-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/plugin-catalog-common@1.0.19
  - @backstage/plugin-catalog-node@1.6.1-next.1

## 0.5.1-next.0

### Patch Changes

- d076ee4: Updated dependency `azure-devops-node-api` to `^12.0.0`.
- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage/plugin-catalog-node@1.6.1-next.0
  - @backstage/backend-plugin-api@0.6.9-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/integration@1.8.0
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/plugin-catalog-common@1.0.19

## 0.5.0

### Minor Changes

- 844969c: **BREAKING** New `fromConfig` static method must be used now when creating an instance of the `AzureDevOpsApi`

  Added support for using the `AzureDevOpsCredentialsProvider`

### Patch Changes

- c70e4f5: Added multi-org support
- 646db72: Updated encoding of Org to use `encodeURIComponent` when building URL used to get credentials from credential provider
- 043b724: Introduced new `AzureDevOpsAnnotatorProcessor` that adds the needed annotations automatically. Also, moved constants to common package so they can be shared more easily
- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage/plugin-catalog-node@1.6.0
  - @backstage-community/plugin-azure-devops-common@0.3.2
  - @backstage/integration@1.8.0
  - @backstage/backend-plugin-api@0.6.8
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/plugin-catalog-common@1.0.19

## 0.5.0-next.3

### Patch Changes

- c70e4f5: Added multi-org support
- 646db72: Updated encoding of Org to use `encodeURIComponent` when building URL used to get credentials from credential provider
- Updated dependencies
  - @backstage-community/plugin-azure-devops-common@0.3.2-next.1
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/backend-plugin-api@0.6.8-next.3
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/integration@1.8.0-next.1
  - @backstage/plugin-catalog-common@1.0.18
  - @backstage/plugin-catalog-node@1.6.0-next.3

## 0.5.0-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.6.0-next.2
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/backend-plugin-api@0.6.8-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/integration@1.8.0-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.2-next.0
  - @backstage/plugin-catalog-common@1.0.18

## 0.5.0-next.1

### Minor Changes

- 844969cd97: **BREAKING** New `fromConfig` static method must be used now when creating an instance of the `AzureDevOpsApi`

  Added support for using the `AzureDevOpsCredentialsProvider`

### Patch Changes

- 043b724c56: Introduced new `AzureDevOpsAnnotatorProcessor` that adds the needed annotations automatically. Also, moved constants to common package so they can be shared more easily
- Updated dependencies
  - @backstage-community/plugin-azure-devops-common@0.3.2-next.0
  - @backstage/integration@1.8.0-next.1
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/plugin-catalog-common@1.0.18
  - @backstage/plugin-catalog-node@1.5.1-next.1

## 0.4.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage/backend-plugin-api@0.6.8-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.4.4

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9
  - @backstage/backend-plugin-api@0.6.7
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.4.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.7-next.2
  - @backstage/backend-common@0.19.9-next.2

## 0.4.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.1
  - @backstage/backend-plugin-api@0.6.7-next.1
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.4.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/backend-plugin-api@0.6.7-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.4.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8
  - @backstage/backend-plugin-api@0.6.6
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.4.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/backend-plugin-api@0.6.6-next.2
  - @backstage/config@1.1.1-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.4.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.1
  - @backstage/backend-plugin-api@0.6.5-next.1
  - @backstage/config@1.1.0
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.4.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.0
  - @backstage/config@1.1.0
  - @backstage/backend-plugin-api@0.6.5-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.1

## 0.4.0

### Minor Changes

- 71114ac50e02: **BREAKING**: The export for the new backend system has been moved to be the `default` export.

  For example, if you are currently importing the plugin using the following pattern:

  ```ts
  import { examplePlugin } from '@backstage/plugin-example-backend';

  backend.add(examplePlugin);
  ```

  It should be migrated to this:

  ```ts
  backend.add(import('@backstage/plugin-example-backend'));
  ```

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.5
  - @backstage/config@1.1.0
  - @backstage-community/plugin-azure-devops-common@0.3.1
  - @backstage/backend-plugin-api@0.6.3

## 0.4.0-next.3

### Minor Changes

- 71114ac50e02: **BREAKING**: The export for the new backend system has been moved to be the `default` export.

  For example, if you are currently importing the plugin using the following pattern:

  ```ts
  import { examplePlugin } from '@backstage/plugin-example-backend';

  backend.add(examplePlugin);
  ```

  It should be migrated to this:

  ```ts
  backend.add(import('@backstage/plugin-example-backend'));
  ```

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.2
  - @backstage-community/plugin-azure-devops-common@0.3.1-next.0
  - @backstage/backend-plugin-api@0.6.3-next.3
  - @backstage/backend-common@0.19.5-next.3

## 0.3.30-next.2

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-common@0.19.5-next.2
  - @backstage/backend-plugin-api@0.6.3-next.2
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.30-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/backend-common@0.19.5-next.1
  - @backstage/backend-plugin-api@0.6.3-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.29-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/backend-plugin-api@0.6.2-next.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.27

### Patch Changes

- 629cbd194a87: Use `coreServices.rootConfig` instead of `coreService.config`
- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage/backend-plugin-api@0.6.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.27-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.0-next.2
  - @backstage/backend-common@0.19.2-next.2

## 0.3.27-next.1

### Patch Changes

- 629cbd194a87: Use `coreServices.rootConfig` instead of `coreService.config`
- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage/backend-plugin-api@0.6.0-next.1
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.27-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/backend-plugin-api@0.5.5-next.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.26

### Patch Changes

- ae261e79d256: Added alpha support for the [new backend system](https://backstage.io/docs/backend-system/)
- Updated dependencies
  - @backstage/backend-common@0.19.1
  - @backstage/backend-plugin-api@0.5.4
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.26-next.1

### Patch Changes

- ae261e79d256: Added alpha support for the [new backend system](https://backstage.io/docs/backend-system/)
- Updated dependencies
  - @backstage/config@1.0.8

## 0.3.26-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.25

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.25-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.25-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.25-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.24

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.24-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage/config@1.0.7

## 0.3.24-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.23

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.23-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.23-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.23-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.22

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.18.3
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.22-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.3-next.2
  - @backstage/config@1.0.7-next.0

## 0.3.22-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/config@1.0.7-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.22-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.21

### Patch Changes

- c51efce2a0: Update docs to always use `yarn add --cwd` for app & backend
- cc926a59bd: Fixed a bug where the azure devops host in URLs on the readme card was being URL encoded, breaking hosts with ports.
- 85b04f659a: Internal refactor to not use deprecated `substr`
- Updated dependencies
  - @backstage/backend-common@0.18.2
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.21-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.2
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.21-next.1

### Patch Changes

- cc926a59bd: Fixed a bug where the azure devops host in URLs on the readme card was being URL encoded, breaking hosts with ports.
- 85b04f659a: Internal refactor to not use deprecated `substr`
- Updated dependencies
  - @backstage/backend-common@0.18.2-next.1
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.21-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.0

## 0.3.19

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.19-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.1
  - @backstage/config@1.0.6-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.19-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.0
  - @backstage/config@1.0.6-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.18

### Patch Changes

- eaccf6d628: Updated installation documentation
- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/backend-common@0.17.0
  - @backstage/config@1.0.5
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.18-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.3
  - @backstage/config@1.0.5-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.18-next.2

### Patch Changes

- eaccf6d628: Updated installation documentation
- Updated dependencies
  - @backstage/backend-common@0.17.0-next.2
  - @backstage/config@1.0.5-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.18-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.18-next.0

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/backend-common@0.16.1-next.0
  - @backstage/config@1.0.5-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.17

### Patch Changes

- 62f284e394: - Adjusted the asset parser to accept case sensitive
  - Fixed fetching data that was using the deprecated function
- Updated dependencies
  - @backstage/backend-common@0.16.0
  - @backstage/config@1.0.4
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.17-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.1
  - @backstage/config@1.0.4-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.17-next.1

### Patch Changes

- 62f284e394: - Adjusted the asset parser to accept case sensitive
  - Fixed fetching data that was using the deprecated function

## 0.3.17-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.16

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2
  - @backstage/config@1.0.3
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.16-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2-next.2
  - @backstage/config@1.0.3-next.2
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.16-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2-next.1
  - @backstage/config@1.0.3-next.1
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.16-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2-next.0
  - @backstage/config@1.0.3-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0

## 0.3.15

### Patch Changes

- 3f739be9d9: Minor API signatures cleanup
- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- cb1cfc018b: `createRouter` now requires an additional reader: `UrlReader` argument

  ```diff
  export default async function createPlugin(
    env: PluginEnvironment,
  ): Promise<Router> {
    return createRouter({
      logger: env.logger,
      config: env.config,
  +   reader: env.reader,
    });
  }
  ```

  Remember to check if you have already provided these settings previously.

  #### [Azure DevOps]

  ```yaml
  # app-config.yaml
  azureDevOps:
    host: dev.azure.com
    token: my-token
    organization: my-company
  ```

  #### [Azure Integrations]

  ```yaml
  # app-config.yaml
  integrations:
    azure:
      - host: dev.azure.com
        token: ${AZURE_TOKEN}
  ```

- ef9ab322de: Minor API signatures cleanup
- Updated dependencies
  - @backstage/backend-common@0.15.1
  - @backstage-community/plugin-azure-devops-common@0.3.0
  - @backstage/config@1.0.2

## 0.3.15-next.2

### Patch Changes

- Updated dependencies
  - @backstage/config@1.0.2-next.0
  - @backstage/backend-common@0.15.1-next.3

## 0.3.15-next.1

### Patch Changes

- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.2

## 0.3.15-next.0

### Patch Changes

- 3f739be9d9: Minor API signatures cleanup
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- cb1cfc018b: `createRouter` now requires an additional reader: `UrlReader` argument

  ```diff
  export default async function createPlugin(
    env: PluginEnvironment,
  ): Promise<Router> {
    return createRouter({
      logger: env.logger,
      config: env.config,
  +   reader: env.reader,
    });
  }
  ```

  Remember to check if you have already provided these settings previously.

  #### [Azure DevOps]

  ```yaml
  # app-config.yaml
  azureDevOps:
    host: dev.azure.com
    token: my-token
    organization: my-company
  ```

  #### [Azure Integrations]

  ```yaml
  # app-config.yaml
  integrations:
    azure:
      - host: dev.azure.com
        token: ${AZURE_TOKEN}
  ```

- ef9ab322de: Minor API signatures cleanup
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.0
  - @backstage-community/plugin-azure-devops-common@0.3.0-next.0

## 0.3.14

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0

## 0.3.14-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0-next.0

## 0.3.13

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- 8006d0f9bf: Updated dependency `msw` to `^0.44.0`.
- 13a232ec22: Added comments to example to help avoid confusion as to where lines need to be added
- e67c4b7d5a: Adding getProjects endpoint to list out all projects associated with the Azure DevOps organization.

  It can be accessed by using this endpoint `{backendUrl}/api/azure-devops/projects`

- Updated dependencies
  - @backstage/backend-common@0.14.1
  - @backstage-community/plugin-azure-devops-common@0.2.4

## 0.3.13-next.1

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- e67c4b7d5a: Adding getProjects endpoint to list out all projects associated with the Azure DevOps organization.

  It can be accessed by using this endpoint `{backendUrl}/api/azure-devops/projects`

- Updated dependencies
  - @backstage/backend-common@0.14.1-next.3
  - @backstage-community/plugin-azure-devops-common@0.2.4-next.0

## 0.3.13-next.0

### Patch Changes

- 13a232ec22: Added comments to example to help avoid confusion as to where lines need to be added
- Updated dependencies
  - @backstage/backend-common@0.14.1-next.0

## 0.3.12

### Patch Changes

- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.0

## 0.3.12-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.0-next.2

## 0.3.12-next.1

### Patch Changes

- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/backend-common@0.13.6-next.1

## 0.3.12-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.6-next.0

## 0.3.11

### Patch Changes

- ac14fcaf38: Added entity view for Azure Git Tags, based on existing Pull Requests view
- Updated dependencies
  - @backstage/backend-common@0.13.3
  - @backstage/config@1.0.1
  - @backstage-community/plugin-azure-devops-common@0.2.3

## 0.3.11-next.1

### Patch Changes

- ac14fcaf38: Added entity view for Azure Git Tags, based on existing Pull Requests view
- Updated dependencies
  - @backstage/backend-common@0.13.3-next.2
  - @backstage/config@1.0.1-next.0
  - @backstage-community/plugin-azure-devops-common@0.2.3-next.0

## 0.3.11-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3-next.0

## 0.3.10

### Patch Changes

- 236245d9f8: Stop loading all teams when plugin is initialized
- Updated dependencies
  - @backstage/backend-common@0.13.2

## 0.3.10-next.1

### Patch Changes

- 236245d9f8: Stop loading all teams when plugin is initialized

## 0.3.10-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.2-next.0

## 0.3.9

### Patch Changes

- 89c7e47967: Minor README update
- Updated dependencies
  - @backstage/backend-common@0.13.1
  - @backstage/config@1.0.0

## 0.3.8

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.0

## 0.3.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.0-next.0

## 0.3.7

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.12.0

## 0.3.6

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.11.0

## 0.3.5

### Patch Changes

- Fix for the previous release with missing type declarations.
- Updated dependencies
  - @backstage/backend-common@0.10.9
  - @backstage/config@0.1.15
  - @backstage-community/plugin-azure-devops-common@0.2.2

## 0.3.4

### Patch Changes

- c77c5c7eb6: Added `backstage.role` to `package.json`
- Updated dependencies
  - @backstage/backend-common@0.10.8
  - @backstage/config@0.1.14
  - @backstage-community/plugin-azure-devops-common@0.2.1

## 0.3.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.7

## 0.3.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.7-next.0

## 0.3.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.6

## 0.3.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.6-next.0

## 0.3.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.4
  - @backstage/config@0.1.13

## 0.3.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.4-next.0
  - @backstage/config@0.1.13-next.0

## 0.3.0

### Minor Changes

- a2ed2c2d69: - feat: Created PullRequestsDashboardProvider for resolving team and team member relations
  - feat: Created useUserTeamIds hook.
  - feat: Updated useFilterProcessor to provide teamIds for `AssignedToCurrentUsersTeams` and `CreatedByCurrentUsersTeams` filters.

### Patch Changes

- 9f9596f9ef: Only warn if teams fail to load at startup.
- Updated dependencies
  - @backstage/config@0.1.12
  - @backstage/backend-common@0.10.3
  - @backstage-community/plugin-azure-devops-common@0.2.0

## 0.2.6

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.0

## 0.2.5

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
  - @backstage/backend-common@0.9.14
  - @backstage-community/plugin-azure-devops-common@0.1.3

## 0.2.4

### Patch Changes

- a77526afcd: Added getting builds by definition name
- Updated dependencies
  - @backstage/backend-common@0.9.13
  - @backstage-community/plugin-azure-devops-common@0.1.2

## 0.2.3

### Patch Changes

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
  - @backstage/backend-common@0.9.12

## 0.2.2

### Patch Changes

- bab752e2b3: Change default port of backend from 7000 to 7007.

  This is due to the AirPlay Receiver process occupying port 7000 and preventing local Backstage instances on MacOS to start.

  You can change the port back to 7000 or any other value by providing an `app-config.yaml` with the following values:

  ```
  backend:
    listen: 0.0.0.0:7123
    baseUrl: http://localhost:7123
  ```

  More information can be found here: https://backstage.io/docs/conf/writing

- Updated dependencies
  - @backstage/backend-common@0.9.11

## 0.2.1

### Patch Changes

- 2b5ccd2964: Improved Date handling for the Azure DevOps set of plugins by using strings and letting the frontend handle the conversion to DateTime
- Updated dependencies
  - @backstage/backend-common@0.9.10
  - @backstage-community/plugin-azure-devops-common@0.1.0

## 0.2.0

### Minor Changes

- b85acc8c35: refactor(`@backstage-community/plugin-azure-devops`): Consume types from `@backstage-community/plugin-azure-devops-common`.
  Stop re-exporting types from `@backstage-community/plugin-azure-devops-backend`.
  Added new types to `@backstage-community/plugin-azure-devops-common`.

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.9.9
  - @backstage-community/plugin-azure-devops-common@0.0.2

## 0.1.4

### Patch Changes

- 2eebc9bac3: Added duration (startTime and finishTime) and identity (uniqueName) to the RepoBuild results. Also did a bit of refactoring to help finish up the backend items in issue #7641
- Updated dependencies
  - @backstage/config@0.1.11
  - @backstage/backend-common@0.9.8

## 0.1.3

### Patch Changes

- f67dff0d20: Re-exported types from azure-devops-node-api in @backstage-community/plugin-azure-devops-backend.
- Updated dependencies
  - @backstage/backend-common@0.9.7

## 0.1.2

### Patch Changes

- a23206049f: Updates function for mapping RepoBuilds to handle undefined properties
- b7c0585471: Expands the Azure DevOps backend plugin to provide pull request data to be used by the front end plugin

## 0.1.1

### Patch Changes

- 299b43f052: Marked all configuration values as required in the schema.
- Updated dependencies
  - @backstage/backend-common@0.9.5
