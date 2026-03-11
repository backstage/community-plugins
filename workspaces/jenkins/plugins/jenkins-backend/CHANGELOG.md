# @backstage-community/plugin-jenkins-backend

## 0.26.0

### Minor Changes

- 5b10e9e: Backstage version bump to v1.48.2

### Patch Changes

- Updated dependencies [5b10e9e]
  - @backstage-community/plugin-jenkins-common@0.17.0

## 0.25.0

### Minor Changes

- 5141efa: Drops support for old backend system which includes removing exports for JenkinsBuilder. Please migrate to the new backend system way of installing the plugin.

### Patch Changes

- fc25522: remove unused dependencies
- Updated dependencies [fc25522]
  - @backstage-community/plugin-jenkins-common@0.16.1

## 0.24.1

### Patch Changes

- 35c20d3: Migration from createPermissionIntegrationRouter to the Permissions Registry Service

## 0.24.0

### Minor Changes

- fea4a0b: Backstage version bump to v1.47.2

### Patch Changes

- Updated dependencies [fea4a0b]
  - @backstage-community/plugin-jenkins-common@0.16.0

## 0.23.1

### Patch Changes

- 4e67490: Migrates the backend to leverage the new CatalogService

## 0.23.0

### Minor Changes

- 95d7628: Backstage version bump to v1.46.2

### Patch Changes

- Updated dependencies [95d7628]
  - @backstage-community/plugin-jenkins-common@0.15.0

## 0.22.0

### Minor Changes

- daa9057: Backstage version bump to v1.45.3

### Patch Changes

- Updated dependencies [daa9057]
  - @backstage-community/plugin-jenkins-common@0.14.0

## 0.21.0

### Minor Changes

- cac3437: Replace the deprecated `jenkins` NPM package with a built-in, light-weight client.

### Patch Changes

- Updated dependencies [cac3437]
  - @backstage-community/plugin-jenkins-common@0.13.0

## 0.20.0

### Minor Changes

- 0291a99: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [0291a99]
  - @backstage-community/plugin-jenkins-common@0.12.0

## 0.19.0

### Minor Changes

- f5374b3: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [f5374b3]
  - @backstage-community/plugin-jenkins-common@0.11.0

## 0.18.0

### Minor Changes

- 8d33116: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [8d33116]
  - @backstage-community/plugin-jenkins-common@0.10.0

## 0.17.0

### Minor Changes

- 08c05ce: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [08c05ce]
  - @backstage-community/plugin-jenkins-common@0.9.0

## 0.16.0

### Minor Changes

- a9d0544: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [a9d0544]
  - @backstage-community/plugin-jenkins-common@0.8.0

## 0.15.0

### Minor Changes

- b5a85c1: Backstage version bump to v1.39.0

### Patch Changes

- Updated dependencies [b5a85c1]
  - @backstage-community/plugin-jenkins-common@0.7.0

## 0.14.0

### Minor Changes

- f0ef395: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [f0ef395]
  - @backstage-community/plugin-jenkins-common@0.6.0

## 0.13.0

### Minor Changes

- 9c592af: Backstage version bump to v1.37.0

### Patch Changes

- 319b23a: Fixed a bug that prevented the backend from starting if no config was provided.
- 319b23a: Updated config schema to indicate that _either_ a `jenkins.instances` array should be provided _or_ `jenkins.baseUrl`, `jenkins.username`, and `jenkins.apiKey`, but never both.
- 5d074b1: Sanitize user input in router before using values in API
- Updated dependencies [9c592af]
  - @backstage-community/plugin-jenkins-common@0.5.0

## 0.12.1

### Patch Changes

- 4dc7013: Fixed a bug when Jenkins permissions were not exposed by Jenkins at `/api/jenkins/.well-known/backstage/permissions/metadata`.

## 0.12.0

### Minor Changes

- 09c00a5: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [09c00a5]
  - @backstage-community/plugin-jenkins-common@0.4.0

## 0.11.0

### Minor Changes

- 29de0c4: **BREAKING** Removed support for the legacy backend system. Please refer to the [README](https://github.com/backstage/community-plugins/blob/main/workspaces/jenkins/plugins/jenkins-backend/README.md) for instructions on how to use the new backend system.

  Removed usages and references of `@backstage/backend-common`

## 0.10.0

### Minor Changes

- 07ef31b: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [07ef31b]
  - @backstage-community/plugin-jenkins-common@0.3.0

## 0.9.0

### Minor Changes

- 92a0ff6: feature: allow support for defining multiple projects/job names

## 0.8.0

### Minor Changes

- 9527e9e: Backstage version bump to v1.34.1

### Patch Changes

- Updated dependencies [9527e9e]
  - @backstage-community/plugin-jenkins-common@0.2.0

## 0.7.0

### Minor Changes

- dfe7569: Add an API to retrieve the consoleText for a build.

## 0.6.3

### Patch Changes

- 3500d71: Deprecated `createRouter` and its router options in favour of the new backend system.

## 0.6.2

### Patch Changes

- f090030: Backstage version bump to v1.32.0
- Updated dependencies [f090030]
  - @backstage-community/plugin-jenkins-common@0.1.30

## 0.6.1

### Patch Changes

- 3306564: Fix [#796](https://github.com/backstage/community-plugins/pull/796) regression

## 0.6.0

### Minor Changes

- dd2ab0b: Created functionality to override the Base URL of a Jenkins instance

## 0.5.0

### Minor Changes

- 8ce69ed: Creating environment and example app for jenkins plugin

## 0.4.12

### Patch Changes

- c3aaa1d: Removed hardcoded count limit from `jobsTreeSpec`

## 0.4.11

### Patch Changes

- aba9f7f: Backstage version bump to v1.30.2
- Updated dependencies [aba9f7f]
  - @backstage-community/plugin-jenkins-common@0.1.29

## 0.4.10

### Patch Changes

- ae2ee8a: Updated dependency `@types/supertest` to `^6.0.0`.

## 0.4.9

### Patch Changes

- c1f63bd: Fixed rebuild api call on frontend and project/job depth on view runs route.

## 0.4.8

### Patch Changes

- adfc3bb: version:bump to v1.29.1
- Updated dependencies [adfc3bb]
  - @backstage-community/plugin-jenkins-common@0.1.28

## 0.4.7

### Patch Changes

- 7d67a9b: Update to backstage version 1.28.3
- Updated dependencies [7d67a9b]
  - @backstage-community/plugin-jenkins-common@0.1.27

## 0.4.6

### Patch Changes

- aa0dc4d: Upgraded to Backstage 1.28

## 0.4.5

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-jenkins-common@0.1.26

## 0.4.4

### Patch Changes

- d5a1fe1: Replaced winston logger with `LoggerService`
- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage/plugin-permission-node@0.7.28
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/catalog-client@1.6.4
  - @backstage/plugin-catalog-node@1.11.1
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-jenkins-common@0.1.25
  - @backstage/plugin-permission-common@0.7.13

## 0.4.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage/catalog-client@1.6.4-next.0
  - @backstage/plugin-permission-node@0.7.28-next.1
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/plugin-catalog-node@1.11.1-next.1
  - @backstage-community/plugin-jenkins-common@0.1.25
  - @backstage/plugin-permission-common@0.7.13

## 0.4.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.0
  - @backstage/backend-plugin-api@0.6.17-next.0
  - @backstage/catalog-client@1.6.3
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/plugin-catalog-node@1.11.1-next.0
  - @backstage-community/plugin-jenkins-common@0.1.25
  - @backstage/plugin-permission-common@0.7.13
  - @backstage/plugin-permission-node@0.7.28-next.0

## 0.4.3

### Patch Changes

- 836247c: Fixed an issue where the `httpAuth` service turned out to be undefined
- Updated dependencies
  - @backstage/plugin-catalog-node@1.11.0
  - @backstage/catalog-client@1.6.3
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage/plugin-permission-node@0.7.27
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-jenkins-common@0.1.25
  - @backstage/plugin-permission-common@0.7.13

## 0.4.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.10.0
  - @backstage/catalog-client@1.6.2
  - @backstage/backend-common@0.21.5
  - @backstage/plugin-permission-node@0.7.26
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-jenkins-common@0.1.25
  - @backstage/plugin-permission-common@0.7.13

## 0.4.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.9.0

## 0.4.0

### Minor Changes

- 55191cc: **BREAKING**: Both `createRouter` and `DefaultJenkinsInfoProvider.fromConfig` now require the `discovery` service to be forwarded from the plugin environment. This is part of the migration to support new auth services.

  The `JenkinsInfoProvider` interface has been updated to receive `credentials` of the type `BackstageCredentials` rather than a token.

### Patch Changes

- 2bd1410: Removed unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage/plugin-permission-common@0.7.13
  - @backstage/plugin-catalog-node@1.8.0
  - @backstage/catalog-client@1.6.1
  - @backstage/plugin-permission-node@0.7.25
  - @backstage/catalog-model@1.4.5
  - @backstage-community/plugin-jenkins-common@0.1.25

## 0.4.0-next.2

### Patch Changes

- 2bd1410: Removed unused dependencies
- Updated dependencies
  - @backstage/catalog-client@1.6.1-next.1
  - @backstage/backend-common@0.21.4-next.2
  - @backstage/plugin-catalog-node@1.8.0-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-jenkins-common@0.1.25-next.1
  - @backstage/plugin-permission-common@0.7.13-next.1
  - @backstage/plugin-permission-node@0.7.25-next.2

## 0.4.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage/plugin-auth-node@0.4.9-next.1
  - @backstage/plugin-permission-common@0.7.13-next.1
  - @backstage/plugin-permission-node@0.7.25-next.1
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/plugin-catalog-node@1.8.0-next.1
  - @backstage-community/plugin-jenkins-common@0.1.25-next.1

## 0.4.0-next.0

### Minor Changes

- 55191cc: **BREAKING**: Both `createRouter` and `DefaultJenkinsInfoProvider.fromConfig` now require the `discovery` service to be forwarded from the plugin environment. This is part of the migration to support new auth services.

  The `JenkinsInfoProvider` interface has been updated to receive `credentials` of the type `BackstageCredentials` rather than a token.

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage/plugin-auth-node@0.4.8-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage/plugin-permission-common@0.7.13-next.0
  - @backstage/plugin-catalog-node@1.8.0-next.0
  - @backstage/plugin-permission-node@0.7.24-next.0
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage-community/plugin-jenkins-common@0.1.25-next.0

## 0.3.4

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0
  - @backstage/plugin-auth-node@0.4.4
  - @backstage/backend-plugin-api@0.6.10
  - @backstage/catalog-model@1.4.4
  - @backstage/catalog-client@1.6.0
  - @backstage/plugin-catalog-node@1.7.0
  - @backstage/plugin-permission-node@0.7.21
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.24
  - @backstage/plugin-permission-common@0.7.12

## 0.3.4-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage/plugin-catalog-node@1.6.2-next.3
  - @backstage/plugin-auth-node@0.4.4-next.3
  - @backstage/plugin-permission-node@0.7.21-next.3
  - @backstage/backend-plugin-api@0.6.10-next.3
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.24-next.0
  - @backstage/plugin-permission-common@0.7.12

## 0.3.4-next.2

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage/backend-plugin-api@0.6.10-next.2
  - @backstage/plugin-auth-node@0.4.4-next.2
  - @backstage/plugin-permission-node@0.7.21-next.2
  - @backstage/plugin-catalog-node@1.6.2-next.2
  - @backstage/config@1.1.1
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.24-next.0
  - @backstage/plugin-permission-common@0.7.12

## 0.3.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/backend-plugin-api@0.6.10-next.1
  - @backstage/backend-common@0.21.0-next.1
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-auth-node@0.4.4-next.1
  - @backstage/plugin-catalog-node@1.6.2-next.1
  - @backstage-community/plugin-jenkins-common@0.1.24-next.0
  - @backstage/plugin-permission-common@0.7.12
  - @backstage/plugin-permission-node@0.7.21-next.1

## 0.3.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage/catalog-client@1.6.0-next.0
  - @backstage/plugin-auth-node@0.4.4-next.0
  - @backstage/plugin-catalog-node@1.6.2-next.0
  - @backstage/plugin-permission-node@0.7.21-next.0
  - @backstage/backend-plugin-api@0.6.10-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.23
  - @backstage/plugin-permission-common@0.7.12

## 0.3.3

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage/catalog-client@1.5.2
  - @backstage/backend-plugin-api@0.6.9
  - @backstage/plugin-catalog-node@1.6.1
  - @backstage/plugin-permission-common@0.7.12
  - @backstage/plugin-permission-node@0.7.20
  - @backstage/plugin-auth-node@0.4.3
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.23

## 0.3.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.9-next.2
  - @backstage/backend-common@0.20.1-next.2
  - @backstage/plugin-auth-node@0.4.3-next.2
  - @backstage/plugin-catalog-node@1.6.1-next.2
  - @backstage/plugin-permission-node@0.7.20-next.2

## 0.3.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage/config@1.1.1
  - @backstage/plugin-auth-node@0.4.3-next.1
  - @backstage/plugin-permission-node@0.7.20-next.1
  - @backstage/backend-plugin-api@0.6.9-next.1
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/plugin-catalog-node@1.6.1-next.1
  - @backstage-community/plugin-jenkins-common@0.1.22
  - @backstage/plugin-permission-common@0.7.11

## 0.3.3-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/plugin-catalog-node@1.6.1-next.0
  - @backstage/backend-plugin-api@0.6.9-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-auth-node@0.4.3-next.0
  - @backstage-community/plugin-jenkins-common@0.1.22
  - @backstage/plugin-permission-common@0.7.11
  - @backstage/plugin-permission-node@0.7.20-next.0

## 0.3.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage/plugin-catalog-node@1.6.0
  - @backstage/catalog-client@1.5.0
  - @backstage/plugin-auth-node@0.4.2
  - @backstage/plugin-permission-common@0.7.11
  - @backstage/plugin-permission-node@0.7.19
  - @backstage/backend-plugin-api@0.6.8
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.22

## 0.3.2-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/backend-plugin-api@0.6.8-next.3
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-auth-node@0.4.2-next.3
  - @backstage/plugin-catalog-node@1.6.0-next.3
  - @backstage-community/plugin-jenkins-common@0.1.21
  - @backstage/plugin-permission-common@0.7.10
  - @backstage/plugin-permission-node@0.7.19-next.3

## 0.3.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.6.0-next.2
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/plugin-auth-node@0.4.2-next.2
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.21
  - @backstage/plugin-permission-common@0.7.10
  - @backstage/plugin-permission-node@0.7.19-next.2

## 0.3.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.5.0-next.0
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-auth-node@0.4.2-next.1
  - @backstage/plugin-catalog-node@1.5.1-next.1
  - @backstage-community/plugin-jenkins-common@0.1.21
  - @backstage/plugin-permission-common@0.7.10
  - @backstage/plugin-permission-node@0.7.19-next.1

## 0.3.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage/plugin-auth-node@0.4.2-next.0
  - @backstage/plugin-catalog-node@1.5.1-next.0
  - @backstage/plugin-permission-node@0.7.19-next.0
  - @backstage/backend-plugin-api@0.6.8-next.0
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.21
  - @backstage/plugin-permission-common@0.7.10

## 0.3.1

### Patch Changes

- 4bfb878807: Updated dependency `@types/jenkins` to `^1.0.0`.
- Updated dependencies
  - @backstage/plugin-catalog-node@1.5.0
  - @backstage/backend-common@0.19.9
  - @backstage/backend-plugin-api@0.6.7
  - @backstage/catalog-client@1.4.6
  - @backstage/plugin-permission-common@0.7.10
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-auth-node@0.4.1
  - @backstage-community/plugin-jenkins-common@0.1.21
  - @backstage/plugin-permission-node@0.7.18

## 0.3.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.7-next.2
  - @backstage/backend-common@0.19.9-next.2
  - @backstage/plugin-auth-node@0.4.1-next.2
  - @backstage/plugin-catalog-node@1.5.0-next.2
  - @backstage/plugin-permission-node@0.7.18-next.2

## 0.3.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.5.0-next.1
  - @backstage/backend-common@0.19.9-next.1
  - @backstage/plugin-auth-node@0.4.1-next.1
  - @backstage/plugin-permission-node@0.7.18-next.1
  - @backstage/backend-plugin-api@0.6.7-next.1
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-jenkins-common@0.1.20
  - @backstage/plugin-permission-common@0.7.9

## 0.3.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/backend-plugin-api@0.6.7-next.0
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-auth-node@0.4.1-next.0
  - @backstage/plugin-catalog-node@1.4.8-next.0
  - @backstage-community/plugin-jenkins-common@0.1.20
  - @backstage/plugin-permission-common@0.7.9
  - @backstage/plugin-permission-node@0.7.18-next.0

## 0.3.0

### Minor Changes

- 411896faf9: Added JobRunTable Component.
  Added new Route and extended Api to get buildJobs.
  Actions column has a new icon button, clicking on which takes us to page where we
  can see all the job runs.

### Patch Changes

- 930ac236d8: Added support for the [new backend system](https://backstage.io/docs/backend-system/)
- Updated dependencies
  - @backstage/backend-common@0.19.8
  - @backstage/plugin-catalog-node@1.4.7
  - @backstage/plugin-auth-node@0.4.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/backend-plugin-api@0.6.6
  - @backstage/plugin-permission-node@0.7.17
  - @backstage/catalog-client@1.4.5
  - @backstage/config@1.1.1
  - @backstage-community/plugin-jenkins-common@0.1.20
  - @backstage/plugin-permission-common@0.7.9

## 0.2.9-next.2

### Patch Changes

- 930ac236d8: Added support for the [new backend system](https://backstage.io/docs/backend-system/)
- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/plugin-auth-node@0.4.0-next.2
  - @backstage/catalog-model@1.4.3-next.0
  - @backstage/errors@1.2.3-next.0
  - @backstage/plugin-catalog-node@1.4.7-next.2
  - @backstage/plugin-permission-node@0.7.17-next.2
  - @backstage/backend-plugin-api@0.6.6-next.2
  - @backstage/catalog-client@1.4.5-next.0
  - @backstage/config@1.1.1-next.0
  - @backstage-community/plugin-jenkins-common@0.1.20-next.0
  - @backstage/plugin-permission-common@0.7.9-next.0

## 0.2.8-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.1
  - @backstage/plugin-auth-node@0.3.2-next.1
  - @backstage/plugin-permission-node@0.7.16-next.1
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-jenkins-common@0.1.19
  - @backstage/plugin-permission-common@0.7.8

## 0.2.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-auth-node@0.3.2-next.0
  - @backstage/backend-common@0.19.7-next.0
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-jenkins-common@0.1.19
  - @backstage/plugin-permission-common@0.7.8
  - @backstage/plugin-permission-node@0.7.16-next.0

## 0.2.6

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.5
  - @backstage/plugin-auth-node@0.3.0
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-jenkins-common@0.1.19
  - @backstage/plugin-permission-common@0.7.8
  - @backstage/plugin-permission-node@0.7.14

## 0.2.6-next.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.4.4-next.2
  - @backstage/catalog-model@1.4.2-next.2
  - @backstage/config@1.1.0-next.2
  - @backstage/errors@1.2.2-next.0
  - @backstage-community/plugin-jenkins-common@0.1.19-next.2
  - @backstage/plugin-permission-common@0.7.8-next.2
  - @backstage/plugin-permission-node@0.7.14-next.3
  - @backstage/backend-common@0.19.5-next.3
  - @backstage/plugin-auth-node@0.3.0-next.3

## 0.2.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-common@0.19.5-next.2
  - @backstage/plugin-auth-node@0.3.0-next.2
  - @backstage/plugin-permission-node@0.7.14-next.2
  - @backstage/catalog-model@1.4.2-next.1
  - @backstage/plugin-permission-common@0.7.8-next.1
  - @backstage/catalog-client@1.4.4-next.1
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-jenkins-common@0.1.19-next.1

## 0.2.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/backend-common@0.19.5-next.1
  - @backstage/catalog-model@1.4.2-next.0
  - @backstage/plugin-auth-node@0.3.0-next.1
  - @backstage/plugin-permission-common@0.7.8-next.0
  - @backstage/plugin-permission-node@0.7.14-next.1
  - @backstage/catalog-client@1.4.4-next.0
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-jenkins-common@0.1.19-next.0

## 0.2.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-auth-node@0.3.0-next.0
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-jenkins-common@0.1.18
  - @backstage/plugin-permission-common@0.7.7
  - @backstage/plugin-permission-node@0.7.13-next.0

## 0.2.3

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- 4b82382ed8c2: Fixed invalid configuration schema. The configuration schema may be more strict as a result.
- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage-community/plugin-jenkins-common@0.1.18
  - @backstage/plugin-auth-node@0.2.17
  - @backstage/plugin-permission-node@0.7.11
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/plugin-permission-common@0.7.7

## 0.2.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.2
  - @backstage/plugin-permission-node@0.7.11-next.2
  - @backstage/plugin-auth-node@0.2.17-next.2

## 0.2.3-next.1

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- 4b82382ed8c2: Fixed invalid configuration schema. The configuration schema may be more strict as a result.
- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage-community/plugin-jenkins-common@0.1.18-next.0
  - @backstage/plugin-auth-node@0.2.17-next.1
  - @backstage/plugin-permission-node@0.7.11-next.1
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/plugin-permission-common@0.7.7

## 0.2.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/plugin-auth-node@0.2.17-next.0
  - @backstage-community/plugin-jenkins-common@0.1.17
  - @backstage/plugin-permission-common@0.7.7
  - @backstage/plugin-permission-node@0.7.11-next.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1
  - @backstage/backend-common@0.19.1
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/plugin-auth-node@0.2.16
  - @backstage-community/plugin-jenkins-common@0.1.17
  - @backstage/plugin-permission-common@0.7.7
  - @backstage/plugin-permission-node@0.7.10

## 0.2.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/catalog-client@1.4.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/config@1.0.8
  - @backstage/plugin-auth-node@0.2.16-next.0
  - @backstage-community/plugin-jenkins-common@0.1.17-next.0
  - @backstage/plugin-permission-common@0.7.7-next.0
  - @backstage/plugin-permission-node@0.7.10-next.0

## 0.2.1

### Patch Changes

- 0f93b6707e04: Don't expose username and authentication header if configured.
- 6c244b42cb06: Expose permissions through the metadata endpoint.
- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/catalog-client@1.4.2
  - @backstage-community/plugin-jenkins-common@0.1.16
  - @backstage/catalog-model@1.4.0
  - @backstage/errors@1.2.0
  - @backstage/plugin-auth-node@0.2.15
  - @backstage/plugin-permission-node@0.7.9
  - @backstage/config@1.0.8
  - @backstage/plugin-permission-common@0.7.6

## 0.2.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/catalog-model@1.4.0-next.1
  - @backstage/catalog-client@1.4.2-next.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.2.0-next.0
  - @backstage/plugin-auth-node@0.2.15-next.2
  - @backstage-community/plugin-jenkins-common@0.1.16-next.2
  - @backstage/plugin-permission-common@0.7.6-next.0
  - @backstage/plugin-permission-node@0.7.9-next.2

## 0.2.1-next.1

### Patch Changes

- 0f93b6707e04: Don't expose username and authentication header if configured.
- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/errors@1.2.0-next.0
  - @backstage/catalog-model@1.4.0-next.0
  - @backstage/plugin-auth-node@0.2.15-next.1
  - @backstage/plugin-permission-node@0.7.9-next.1
  - @backstage/catalog-client@1.4.2-next.1
  - @backstage/plugin-permission-common@0.7.6-next.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-jenkins-common@0.1.16-next.1

## 0.2.1-next.0

### Patch Changes

- 6c244b42cb06: Expose permissions through the metadata endpoint.
- Updated dependencies
  - @backstage/catalog-client@1.4.2-next.0
  - @backstage-community/plugin-jenkins-common@0.1.16-next.0
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/config@1.0.7
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage/plugin-auth-node@0.2.15-next.0
  - @backstage/plugin-permission-common@0.7.5
  - @backstage/plugin-permission-node@0.7.9-next.0

## 0.2.0

### Minor Changes

- cf95c5137c9: Updated rebuild to use Jenkins API replay build, which works for Jenkins jobs that have required parameters. Jenkins SDK could not be used for this request because it does not have support for replay.

  Added link to view build in Jenkins CI/CD table action column.

### Patch Changes

- 670a2dd6f4e: Fix handling of slashes in branch names
- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage/plugin-auth-node@0.2.14
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-jenkins-common@0.1.15
  - @backstage/plugin-permission-common@0.7.5

## 0.1.35-next.1

### Patch Changes

- 670a2dd6f4e: Fix handling of slashes in branch names
- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage/plugin-auth-node@0.2.14-next.1
  - @backstage/config@1.0.7

## 0.1.35-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage/plugin-auth-node@0.2.14-next.0
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-jenkins-common@0.1.15
  - @backstage/plugin-permission-common@0.7.5

## 0.1.34

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage/catalog-client@1.4.1
  - @backstage/plugin-permission-common@0.7.5
  - @backstage/catalog-model@1.3.0
  - @backstage/plugin-auth-node@0.2.13
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-jenkins-common@0.1.15

## 0.1.34-next.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.3.0-next.0
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/catalog-client@1.4.1-next.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/plugin-auth-node@0.2.13-next.2
  - @backstage-community/plugin-jenkins-common@0.1.15-next.1
  - @backstage/plugin-permission-common@0.7.5-next.0

## 0.1.34-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/catalog-client@1.4.1-next.0
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/plugin-auth-node@0.2.13-next.2
  - @backstage-community/plugin-jenkins-common@0.1.15-next.0
  - @backstage/plugin-permission-common@0.7.5-next.0

## 0.1.34-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-permission-common@0.7.5-next.0
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/plugin-auth-node@0.2.13-next.1
  - @backstage-community/plugin-jenkins-common@0.1.15-next.0

## 0.1.34-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/plugin-auth-node@0.2.13-next.0
  - @backstage-community/plugin-jenkins-common@0.1.14
  - @backstage/plugin-permission-common@0.7.4

## 0.1.33

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/catalog-client@1.4.0
  - @backstage/plugin-auth-node@0.2.12
  - @backstage/backend-common@0.18.3
  - @backstage/errors@1.1.5
  - @backstage/catalog-model@1.2.1
  - @backstage-community/plugin-jenkins-common@0.1.14
  - @backstage/plugin-permission-common@0.7.4
  - @backstage/config@1.0.7

## 0.1.33-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-auth-node@0.2.12-next.2
  - @backstage/backend-common@0.18.3-next.2
  - @backstage/config@1.0.7-next.0

## 0.1.33-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/errors@1.1.5-next.0
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/catalog-client@1.4.0-next.1
  - @backstage/plugin-auth-node@0.2.12-next.1
  - @backstage/plugin-permission-common@0.7.4-next.0
  - @backstage/config@1.0.7-next.0
  - @backstage/catalog-model@1.2.1-next.1
  - @backstage-community/plugin-jenkins-common@0.1.14-next.1

## 0.1.33-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.4.0-next.0
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/catalog-model@1.2.1-next.0
  - @backstage-community/plugin-jenkins-common@0.1.14-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/plugin-auth-node@0.2.12-next.0
  - @backstage/plugin-permission-common@0.7.3

## 0.1.32

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2
  - @backstage/catalog-model@1.2.0
  - @backstage/catalog-client@1.3.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/plugin-auth-node@0.2.11
  - @backstage-community/plugin-jenkins-common@0.1.13
  - @backstage/plugin-permission-common@0.7.3

## 0.1.32-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.2
  - @backstage/catalog-model@1.2.0-next.1
  - @backstage/plugin-auth-node@0.2.11-next.2
  - @backstage/catalog-client@1.3.1-next.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage-community/plugin-jenkins-common@0.1.13-next.1
  - @backstage/plugin-permission-common@0.7.3

## 0.1.32-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.1
  - @backstage/catalog-client@1.3.1-next.0
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/plugin-auth-node@0.2.11-next.1
  - @backstage-community/plugin-jenkins-common@0.1.13-next.0
  - @backstage/plugin-permission-common@0.7.3

## 0.1.32-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/backend-common@0.18.2-next.0
  - @backstage/catalog-client@1.3.1-next.0
  - @backstage/plugin-auth-node@0.2.11-next.0
  - @backstage-community/plugin-jenkins-common@0.1.13-next.0

## 0.1.30

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0
  - @backstage/catalog-model@1.1.5
  - @backstage/catalog-client@1.3.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/plugin-auth-node@0.2.9
  - @backstage-community/plugin-jenkins-common@0.1.12
  - @backstage/plugin-permission-common@0.7.3

## 0.1.30-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.1
  - @backstage/catalog-client@1.3.0-next.2
  - @backstage/plugin-auth-node@0.2.9-next.1
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/config@1.0.6-next.0
  - @backstage/errors@1.1.4
  - @backstage-community/plugin-jenkins-common@0.1.12-next.1
  - @backstage/plugin-permission-common@0.7.3-next.0

## 0.1.30-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.0
  - @backstage/config@1.0.6-next.0
  - @backstage/catalog-client@1.3.0-next.1
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/errors@1.1.4
  - @backstage/plugin-auth-node@0.2.9-next.0
  - @backstage-community/plugin-jenkins-common@0.1.12-next.1
  - @backstage/plugin-permission-common@0.7.3-next.0

## 0.1.30-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.0
  - @backstage/catalog-client@1.3.0-next.0
  - @backstage/backend-common@0.17.0
  - @backstage/config@1.0.5
  - @backstage/errors@1.1.4
  - @backstage/plugin-auth-node@0.2.8
  - @backstage-community/plugin-jenkins-common@0.1.12-next.0
  - @backstage/plugin-permission-common@0.7.2

## 0.1.29

### Patch Changes

- cfe2b98fbe: Remove unnecessary dependency `promise-any-polyfill`.
- 3280711113: Updated dependency `msw` to `^0.49.0`.
- 9447b0fb46: added support for standalone jenkins projects
- Updated dependencies
  - @backstage/catalog-client@1.2.0
  - @backstage/backend-common@0.17.0
  - @backstage/plugin-permission-common@0.7.2
  - @backstage/errors@1.1.4
  - @backstage/plugin-auth-node@0.2.8
  - @backstage/catalog-model@1.1.4
  - @backstage/config@1.0.5
  - @backstage-community/plugin-jenkins-common@0.1.11

## 0.1.29-next.3

### Patch Changes

- Updated dependencies
  - @backstage/plugin-permission-common@0.7.2-next.2
  - @backstage/backend-common@0.17.0-next.3
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/plugin-auth-node@0.2.8-next.3
  - @backstage-community/plugin-jenkins-common@0.1.11-next.3

## 0.1.29-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.2
  - @backstage/plugin-auth-node@0.2.8-next.2
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage-community/plugin-jenkins-common@0.1.11-next.2
  - @backstage/plugin-permission-common@0.7.2-next.1

## 0.1.29-next.1

### Patch Changes

- cfe2b98fbe: Remove unnecessary dependency promise-any-polyfill
- Updated dependencies
  - @backstage/backend-common@0.17.0-next.1
  - @backstage/plugin-auth-node@0.2.8-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage-community/plugin-jenkins-common@0.1.11-next.1
  - @backstage/plugin-permission-common@0.7.2-next.1

## 0.1.29-next.0

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/catalog-client@1.2.0-next.0
  - @backstage/backend-common@0.16.1-next.0
  - @backstage/plugin-auth-node@0.2.8-next.0
  - @backstage/plugin-permission-common@0.7.2-next.0
  - @backstage/catalog-model@1.1.4-next.0
  - @backstage/config@1.0.5-next.0
  - @backstage/errors@1.1.4-next.0
  - @backstage-community/plugin-jenkins-common@0.1.11-next.0

## 0.1.28

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0
  - @backstage/catalog-model@1.1.3
  - @backstage/plugin-auth-node@0.2.7
  - @backstage/plugin-permission-common@0.7.1
  - @backstage/catalog-client@1.1.2
  - @backstage/config@1.0.4
  - @backstage/errors@1.1.3
  - @backstage-community/plugin-jenkins-common@0.1.10

## 0.1.28-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.1
  - @backstage/plugin-auth-node@0.2.7-next.1
  - @backstage/catalog-client@1.1.2-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage-community/plugin-jenkins-common@0.1.10-next.0
  - @backstage/plugin-permission-common@0.7.1-next.0

## 0.1.28-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/plugin-auth-node@0.2.7-next.0
  - @backstage/plugin-permission-common@0.7.1-next.0
  - @backstage/catalog-client@1.1.2-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage-community/plugin-jenkins-common@0.1.10-next.0

## 0.1.27

### Patch Changes

- b19ea927af: Fixed a bug where `extraRequestHeaders` configuration was ignored.
- Updated dependencies
  - @backstage/catalog-model@1.1.2
  - @backstage/backend-common@0.15.2
  - @backstage/plugin-auth-node@0.2.6
  - @backstage/plugin-permission-common@0.7.0
  - @backstage/catalog-client@1.1.1
  - @backstage/config@1.0.3
  - @backstage/errors@1.1.2
  - @backstage-community/plugin-jenkins-common@0.1.9

## 0.1.27-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2-next.2
  - @backstage/plugin-permission-common@0.7.0-next.2
  - @backstage-community/plugin-jenkins-common@0.1.9-next.2
  - @backstage/plugin-auth-node@0.2.6-next.2
  - @backstage/catalog-client@1.1.1-next.2
  - @backstage/catalog-model@1.1.2-next.2
  - @backstage/config@1.0.3-next.2
  - @backstage/errors@1.1.2-next.2

## 0.1.27-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.1.1-next.1
  - @backstage/backend-common@0.15.2-next.1
  - @backstage/catalog-model@1.1.2-next.1
  - @backstage/config@1.0.3-next.1
  - @backstage/errors@1.1.2-next.1
  - @backstage/plugin-auth-node@0.2.6-next.1
  - @backstage-community/plugin-jenkins-common@0.1.9-next.1
  - @backstage/plugin-permission-common@0.6.5-next.1

## 0.1.27-next.0

### Patch Changes

- b19ea927af: Fixed a bug where `extraRequestHeaders` configuration was ignored.
- Updated dependencies
  - @backstage/catalog-model@1.1.2-next.0
  - @backstage/catalog-client@1.1.1-next.0
  - @backstage/backend-common@0.15.2-next.0
  - @backstage/plugin-auth-node@0.2.6-next.0
  - @backstage/config@1.0.3-next.0
  - @backstage/errors@1.1.2-next.0
  - @backstage-community/plugin-jenkins-common@0.1.9-next.0
  - @backstage/plugin-permission-common@0.6.5-next.0

## 0.1.26

### Patch Changes

- 618c06f838: Add example on how to pass through permissions
- a966ed8385: Unwrap error message when getting projects
- 47952621dc: Extend configuration so that extra headers can be sent to jenkins instance
- d669d89206: Minor API signatures cleanup
- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- 69ec1cf39f: Updated dependency `jenkins` to `^1.0.0`.
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- e55d855a6b: Jenkins plugin works again
- Updated dependencies
  - @backstage/backend-common@0.15.1
  - @backstage/plugin-auth-node@0.2.5
  - @backstage/catalog-client@1.1.0
  - @backstage/catalog-model@1.1.1
  - @backstage/config@1.0.2
  - @backstage/errors@1.1.1
  - @backstage/plugin-permission-common@0.6.4
  - @backstage-community/plugin-jenkins-common@0.1.8

## 0.1.26-next.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.1.0-next.2
  - @backstage/catalog-model@1.1.1-next.0
  - @backstage/config@1.0.2-next.0
  - @backstage/errors@1.1.1-next.0
  - @backstage/plugin-permission-common@0.6.4-next.2
  - @backstage/backend-common@0.15.1-next.3
  - @backstage/plugin-auth-node@0.2.5-next.3

## 0.1.26-next.2

### Patch Changes

- 47952621dc: Extend configuration so that extra headers can be sent to jenkins instance
- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.2
  - @backstage/plugin-auth-node@0.2.5-next.2
  - @backstage/catalog-client@1.0.5-next.1
  - @backstage/plugin-permission-common@0.6.4-next.1

## 0.1.26-next.1

### Patch Changes

- d669d89206: Minor API signatures cleanup
- 69ec1cf39f: Updated dependency `jenkins` to `^1.0.0`.
- Updated dependencies
  - @backstage/plugin-auth-node@0.2.5-next.1
  - @backstage/backend-common@0.15.1-next.1

## 0.1.26-next.0

### Patch Changes

- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.0
  - @backstage/catalog-client@1.0.5-next.0
  - @backstage/plugin-auth-node@0.2.5-next.0
  - @backstage/plugin-permission-common@0.6.4-next.0
  - @backstage-community/plugin-jenkins-common@0.1.8-next.0

## 0.1.25

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0
  - @backstage/plugin-auth-node@0.2.4
  - @backstage-community/plugin-jenkins-common@0.1.7

## 0.1.25-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0-next.1
  - @backstage-community/plugin-jenkins-common@0.1.7-next.0

## 0.1.25-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0-next.0
  - @backstage/plugin-auth-node@0.2.4-next.0

## 0.1.24

### Patch Changes

- 8747824221: feature: added support for multiple branches to the `JenkinsApi`
- a70869e775: Updated dependency `msw` to `^0.43.0`.
- 8006d0f9bf: Updated dependency `msw` to `^0.44.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.1
  - @backstage/catalog-model@1.1.0
  - @backstage/catalog-client@1.0.4
  - @backstage/plugin-auth-node@0.2.3
  - @backstage/plugin-permission-common@0.6.3
  - @backstage/errors@1.1.0
  - @backstage-community/plugin-jenkins-common@0.1.6

## 0.1.24-next.3

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.1-next.3
  - @backstage/catalog-client@1.0.4-next.2
  - @backstage/plugin-auth-node@0.2.3-next.2
  - @backstage/plugin-permission-common@0.6.3-next.1
  - @backstage/catalog-model@1.1.0-next.3

## 0.1.24-next.2

### Patch Changes

- 8747824221: feature: added support for multiple branches to the `JenkinsApi`
- Updated dependencies
  - @backstage/catalog-model@1.1.0-next.2
  - @backstage/backend-common@0.14.1-next.2

## 0.1.24-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.0-next.1
  - @backstage/backend-common@0.14.1-next.1
  - @backstage/errors@1.1.0-next.0
  - @backstage/catalog-client@1.0.4-next.1
  - @backstage/plugin-auth-node@0.2.3-next.1
  - @backstage-community/plugin-jenkins-common@0.1.6-next.0
  - @backstage/plugin-permission-common@0.6.3-next.0

## 0.1.24-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.1-next.0
  - @backstage/catalog-model@1.1.0-next.0
  - @backstage/plugin-auth-node@0.2.3-next.0
  - @backstage/catalog-client@1.0.4-next.0

## 0.1.23

### Patch Changes

- 83f6a64d2c: bug fix: provide backstage token for rebuild api call
- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.0
  - @backstage/plugin-auth-node@0.2.2
  - @backstage/catalog-client@1.0.3
  - @backstage/plugin-permission-common@0.6.2
  - @backstage/catalog-model@1.0.3
  - @backstage-community/plugin-jenkins-common@0.1.5

## 0.1.23-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.0-next.2
  - @backstage/plugin-auth-node@0.2.2-next.2

## 0.1.23-next.1

### Patch Changes

- 83f6a64d2c: bug fix: provide backstage token for rebuild api call
- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/backend-common@0.13.6-next.1
  - @backstage/catalog-client@1.0.3-next.0
  - @backstage/plugin-auth-node@0.2.2-next.1
  - @backstage/plugin-permission-common@0.6.2-next.0
  - @backstage/catalog-model@1.0.3-next.0
  - @backstage-community/plugin-jenkins-common@0.1.5-next.0

## 0.1.23-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.6-next.0
  - @backstage/plugin-auth-node@0.2.2-next.0

## 0.1.22

### Patch Changes

- 8cc75993a6: Fixed issue in `PermissionEvaluator` instance check that would cause unexpected "invalid union" errors.
- Updated dependencies
  - @backstage/backend-common@0.13.3
  - @backstage/config@1.0.1
  - @backstage/plugin-auth-node@0.2.1
  - @backstage/catalog-client@1.0.2
  - @backstage/catalog-model@1.0.2
  - @backstage-community/plugin-jenkins-common@0.1.4
  - @backstage/plugin-permission-common@0.6.1

## 0.1.22-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3-next.2
  - @backstage/config@1.0.1-next.0
  - @backstage/catalog-model@1.0.2-next.0
  - @backstage/plugin-auth-node@0.2.1-next.1
  - @backstage/plugin-permission-common@0.6.1-next.0
  - @backstage/catalog-client@1.0.2-next.0
  - @backstage-community/plugin-jenkins-common@0.1.4-next.0

## 0.1.22-next.0

### Patch Changes

- 8cc75993a6: Fixed issue in `PermissionEvaluator` instance check that would cause unexpected "invalid union" errors.
- Updated dependencies
  - @backstage/backend-common@0.13.3-next.0
  - @backstage/plugin-auth-node@0.2.1-next.0

## 0.1.20

### Patch Changes

- 1917923ab8: Use `PermissionEvaluator` instead of `PermissionAuthorizer`, which is now deprecated.
- b013de3f50: feature: provide access token to JenkinsInstanceConfig. It can be passed to other backend calls if authentication enabled. DefaultJenkinsInfoProvider sends always this token to catalog api if access token exists.
- ca91107110: Fixed possible type error if jenkins response contains null values
- 71f8708f00: Make `resourceRef` required in `JenkinsApi` to match usage.
- Updated dependencies
  - @backstage/plugin-permission-common@0.6.0
  - @backstage/catalog-model@1.0.1
  - @backstage/plugin-auth-node@0.2.0
  - @backstage/backend-common@0.13.2
  - @backstage-community/plugin-jenkins-common@0.1.3
  - @backstage/catalog-client@1.0.1

## 0.1.20-next.2

### Patch Changes

- 1917923ab8: Use `PermissionEvaluator` instead of `PermissionAuthorizer`, which is now deprecated.
- b013de3f50: feature: provide access token to JenkinsInstanceConfig. It can be passed to other backend calls if authentication enabled. DefaultJenkinsInfoProvider sends always this token to catalog api if access token exists.
- Updated dependencies
  - @backstage/plugin-permission-common@0.6.0-next.1
  - @backstage/backend-common@0.13.2-next.2

## 0.1.20-next.1

### Patch Changes

- ca91107110: Fixed possible type error if jenkins response contains null values
- Updated dependencies
  - @backstage/plugin-permission-common@0.6.0-next.0
  - @backstage-community/plugin-jenkins-common@0.1.3-next.1
  - @backstage/backend-common@0.13.2-next.1

## 0.1.20-next.0

### Patch Changes

- 71f8708f00: Make `resourceRef` required in `JenkinsApi` to match usage.
- Updated dependencies
  - @backstage/catalog-model@1.0.1-next.0
  - @backstage/plugin-auth-node@0.2.0-next.0
  - @backstage/backend-common@0.13.2-next.0
  - @backstage/catalog-client@1.0.1-next.0
  - @backstage-community/plugin-jenkins-common@0.1.3-next.0

## 0.1.19

### Patch Changes

- 89c7e47967: Minor README update
- f24ef7864e: Minor typo fixes
- Updated dependencies
  - @backstage/backend-common@0.13.1
  - @backstage/catalog-model@1.0.0
  - @backstage/catalog-client@1.0.0
  - @backstage/config@1.0.0
  - @backstage/errors@1.0.0
  - @backstage/plugin-permission-common@0.5.3
  - @backstage/plugin-auth-node@0.1.6
  - @backstage-community/plugin-jenkins-common@0.1.2

## 0.1.18

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.0
  - @backstage/catalog-model@0.13.0
  - @backstage/catalog-client@0.9.0
  - @backstage/plugin-auth-node@0.1.5
  - @backstage-community/plugin-jenkins-common@0.1.1

## 0.1.18-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.0-next.0
  - @backstage/catalog-model@0.13.0-next.0
  - @backstage/catalog-client@0.9.0-next.0
  - @backstage/plugin-auth-node@0.1.5-next.0
  - @backstage-community/plugin-jenkins-common@0.1.1-next.0

## 0.1.17

### Patch Changes

- 899f196af5: Use `getEntityByRef` instead of `getEntityByName` in the catalog client
- 23e1c17bba: Jenkins plugin supports permissions now. We have added a new permission, so you can manage the permission for the users.
  A new permission `jenkinsExecutePermission` is provided in `jenkins-common` package. This permission rule will be applied to check rebuild actions
  if user is allowed to execute this action.

  > We use 'catalog-entity' as a resource type, so you need to integrate a policy to handle catalog-entity resources

  > You need to use this permission in your permission policy to check the user role/rights and return
  > `AuthorizeResult.ALLOW` to allow rebuild action to logged user. (e.g: you can check if user or related group owns the entity)

- 36aa63022b: Use `CompoundEntityRef` instead of `EntityName`, and `getCompoundEntityRef` instead of `getEntityName`, from `@backstage/catalog-model`.
- Updated dependencies
  - @backstage/catalog-model@0.12.0
  - @backstage/catalog-client@0.8.0
  - @backstage/backend-common@0.12.0
  - @backstage-community/plugin-jenkins-common@0.1.0
  - @backstage/plugin-permission-common@0.5.2
  - @backstage/plugin-auth-node@0.1.4

## 0.1.16

### Patch Changes

- 67a7c02d26: Remove usages of `EntityRef` and `parseEntityName` from `@backstage/catalog-model`
- Updated dependencies
  - @backstage/backend-common@0.11.0
  - @backstage/catalog-model@0.11.0
  - @backstage/catalog-client@0.7.2

## 0.1.15

### Patch Changes

- Fix for the previous release with missing type declarations.
- Updated dependencies
  - @backstage/backend-common@0.10.9
  - @backstage/catalog-client@0.7.1
  - @backstage/catalog-model@0.10.1
  - @backstage/config@0.1.15

## 0.1.14

### Patch Changes

- c77c5c7eb6: Added `backstage.role` to `package.json`
- 377fce4677: The `DefaultJenkinsInfoProvider.fromConfig` now requires an implementation of the `CatalogApi` rather than a `CatalogClient` instance.
- Updated dependencies
  - @backstage/backend-common@0.10.8
  - @backstage/catalog-client@0.7.0
  - @backstage/catalog-model@0.10.0
  - @backstage/config@0.1.14

## 0.1.13

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@0.6.0
  - @backstage/backend-common@0.10.7

## 0.1.13-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.7-next.0

## 0.1.12

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.6

## 0.1.12-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.6-next.0

## 0.1.11

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.4
  - @backstage/config@0.1.13
  - @backstage/catalog-model@0.9.10
  - @backstage/catalog-client@0.5.5

## 0.1.11-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.4-next.0
  - @backstage/config@0.1.13-next.0
  - @backstage/catalog-model@0.9.10-next.0
  - @backstage/catalog-client@0.5.5-next.0

## 0.1.10

### Patch Changes

- eb3fd85d3e: feature: add crumbIssuer option to Jenkins (optional) configuration, improve the UI to show a notification after executing the action re-build
- Updated dependencies
  - @backstage/backend-common@0.10.0
  - @backstage/catalog-client@0.5.3

## 0.1.9

### Patch Changes

- b055a6addc: Align on usage of `cross-fetch` vs `node-fetch` in frontend vs backend packages, and remove some unnecessary imports of either one of them
- Updated dependencies
  - @backstage/backend-common@0.9.12

## 0.1.8

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

## 0.1.7

### Patch Changes

- e8a1c1afe2: Don't require a validation pattern for the Jenkins base URL.
- Updated dependencies
  - @backstage/backend-common@0.9.9
  - @backstage/catalog-client@0.5.1

## 0.1.6

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@0.9.4
  - @backstage/backend-common@0.9.6
  - @backstage/catalog-client@0.5.0

## 0.1.5

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@0.4.0
  - @backstage/catalog-model@0.9.3
  - @backstage/backend-common@0.9.4
  - @backstage/config@0.1.10

## 0.1.4

### Patch Changes

- 4c86555a2: Fix the case where lastBuild is null.
- Updated dependencies
  - @backstage/backend-common@0.9.0
  - @backstage/config@0.1.8

## 0.1.3

### Patch Changes

- efbb82dd3: Extract `JenkinsConfig` to make writing a custom `JenkinsInfoProvider` easier.
- Updated dependencies
  - @backstage/backend-common@0.8.10
  - @backstage/config@0.1.7

## 0.1.2

### Patch Changes

- eee05803a: Update `@backstage/backend-common` to `^0.8.6`
- Updated dependencies
  - @backstage/catalog-client@0.3.17
  - @backstage/backend-common@0.8.7
