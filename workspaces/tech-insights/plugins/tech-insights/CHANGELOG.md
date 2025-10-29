# @backstage-community/plugin-tech-insights

## 0.6.2

### Patch Changes

- 43064bf: Updated default non-dense behavior to include a description instead of reverting to tooltip
- Updated dependencies [ba5bf7b]
  - @backstage-community/plugin-tech-insights-common@0.7.1
  - @backstage-community/plugin-tech-insights-react@1.2.1

## 0.6.1

### Patch Changes

- d97a34e: Added support for alternate visualizations of boolean checks:

  - Content lists can be rendered with smaller text size and reduced padding (option `dense`)
  - Checks in the overview page can be rendered as a badge (option `badge`)
  - Checks in the entity card can be rendered as a gauge (option `gauge`)

## 0.6.0

### Minor Changes

- a01ae4e: Backstage version bump to v1.39.0

### Patch Changes

- 01640b2: Makes minor change to API report.
- Updated dependencies [d6411fe]
- Updated dependencies [a01ae4e]
  - @backstage-community/plugin-tech-insights-common@0.7.0
  - @backstage-community/plugin-tech-insights-react@1.2.0

## 0.5.2

### Patch Changes

- Updated dependencies [ac739ca]
  - @backstage-community/plugin-tech-insights-common@0.6.0
  - @backstage-community/plugin-tech-insights-react@1.1.1

## 0.5.1

### Patch Changes

- 4aad9f3: remove unused devDependency `canvas`

## 0.5.0

### Minor Changes

- e919e53: Backstage version bump to v1.35.1

### Patch Changes

- f015469: Introducing a new tech insights react plugin for reusuable frontend utilities. All migrated components and APIs have been marked as deprecated. Please update your imports to come from `@backstage-community/plugin-tech-insights-react`

  Package json files for each plugin have been updated to reflect the new plugin in the Backstage `pluginPackages` metadata.

- f015469: Several symbols have been migrated and marked deprecated. Please update all deprecated symbols to import from `@backstage-community/plugin-tech-insights-react` instead.
- Updated dependencies [f015469]
- Updated dependencies [e919e53]
- Updated dependencies [c107e0f]
  - @backstage-community/plugin-tech-insights-common@0.5.0
  - @backstage-community/plugin-tech-insights-react@1.1.0

## 0.4.0

### Minor Changes

- 5abfb11: Backstage version bump to v1.34.2

### Patch Changes

- Updated dependencies [5abfb11]
  - @backstage-community/plugin-tech-insights-common@0.4.0

## 0.3.42

### Patch Changes

- Updated dependencies [5289c38]
  - @backstage-community/plugin-tech-insights-common@0.3.0

## 0.3.41

### Patch Changes

- 9a09c39: Remove use of react 18 `useId` hook to maintain compatibility with react 17.

## 0.3.40

### Patch Changes

- 331daba: Added optional `filter` prop to `EntityTechInsightsScorecardContent` and `EntityTechInsightsScorecardCard` for easier and more flexible filtering of what checks to display.
- Updated dependencies [331daba]
  - @backstage-community/plugin-tech-insights-common@0.2.21

## 0.3.39

### Patch Changes

- 7a14237: Backstage version bump to v1.32.2
- Updated dependencies [7a14237]
  - @backstage-community/plugin-tech-insights-common@0.2.20

## 0.3.38

### Patch Changes

- caa9401: `ScorecardInfo` description now supports markdown syntax

## 0.3.37

### Patch Changes

- e516773: Remove usages of deprecated references and usage of @backstage/backend-common
- e516773: Backstage version bump to v1.31.1
- Updated dependencies [e516773]
- Updated dependencies [e516773]
  - @backstage-community/plugin-tech-insights-common@0.2.19

## 0.3.36

### Patch Changes

- 42a2c31: Export component extensions instead of routable extensions when routes aren't required (or used). ResultCheckIcon can now wrap both React components and HTML elements for onClick handling of the popup menu with links.

## 0.3.35

### Patch Changes

- 1d33996: Added support for links for checks. Static links are defined in the backend for each check. Dynamic links (based on the entity, e.g. to go to github repos, sonarqube projects, etc) are defined with functions in the frontend, when registering the tech-insights API. Two new components are added, TechInsightsCheckIcon and TechInsightsLinksMenu. The former to wrap a result icon with a popup menu with links, the second is the component to show the popup with links (which can be arbitrarily componsed in other UI views).
- Updated dependencies [1d33996]
  - @backstage-community/plugin-tech-insights-common@0.2.18

## 0.3.34

### Patch Changes

- a84eb44: Move client to common package and allow to use backend auth system
- Updated dependencies [a84eb44]
  - @backstage-community/plugin-tech-insights-common@0.2.17

## 0.3.33

### Patch Changes

- 00d148d: Backstage version bump to v1.30.2
- Updated dependencies [00d148d]
  - @backstage-community/plugin-tech-insights-common@0.2.16

## 0.3.32

### Patch Changes

- 83a5e80: Refactor `ScorecardInfo` to accordion to display categories and fail counts.

## 0.3.31

### Patch Changes

- 0265767: Update to latest backstage versions.

## 0.3.30

### Patch Changes

- 7ac338c: Update Backstage to 1.29.1
  Remove usage of deprecated API endpoints except tokenManager
- 794cc8b: Fix api reports generated with the wrong name
  Update @backstage/cli to 0.26.11
  Add missing Backstage fields in `package.json`
- a8d8d44: Enable CSV export in scorecard page table.
- Updated dependencies [794cc8b]
  - @backstage-community/plugin-tech-insights-common@0.2.15

## 0.3.29

### Patch Changes

- cbad35a: Updated dependencies.
- cbad35a: Added a filter to `ScorecardsPage` to only shows entities with results.
- Updated dependencies [cbad35a]
  - @backstage-community/plugin-tech-insights-common@0.2.14

## 0.3.28

### Patch Changes

- d4a8be1: Provide an overview page about checks for entities.

## 0.3.27

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-tech-insights-common@0.2.13

## 0.3.26

### Patch Changes

- abfbcfc: Updated dependency `@testing-library/react` to `^15.0.0`.
- cb1e3b0: Updated dependency `@testing-library/dom` to `^10.0.0`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.11.3
  - @backstage/core-components@0.14.4
  - @backstage/core-plugin-api@1.9.2
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.26-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.4.5
  - @backstage/core-components@0.14.4-next.0
  - @backstage/core-plugin-api@1.9.1
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage/plugin-catalog-react@1.11.3-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.26-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.4-next.0
  - @backstage/catalog-model@1.4.5
  - @backstage/core-plugin-api@1.9.1
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage/plugin-catalog-react@1.11.3-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.25

### Patch Changes

- e8f026a: Use ESM exports of react-use library
- Updated dependencies
  - @backstage/core-components@0.14.3
  - @backstage/plugin-catalog-react@1.11.2
  - @backstage/core-plugin-api@1.9.1
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.24

### Patch Changes

- e8f026a: Use ESM exports of react-use library
- Updated dependencies
  - @backstage/core-components@0.14.2
  - @backstage/plugin-catalog-react@1.11.1
  - @backstage/core-plugin-api@1.9.1
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.23

### Patch Changes

- 6aec725: Added ESLint rule `no-top-level-material-ui-4-imports` in the `tech-insights` plugin to migrate the Material UI imports.
- aa66ae0: Added `onlyFailed` prop to `ScorecardsCard`, and `isFailed` to each check type.
- Updated dependencies
  - @backstage/core-components@0.14.1
  - @backstage/errors@1.2.4
  - @backstage/plugin-catalog-react@1.11.0
  - @backstage/catalog-model@1.4.5
  - @backstage/core-plugin-api@1.9.1
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.23-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.1-next.2
  - @backstage/plugin-catalog-react@1.11.0-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/core-plugin-api@1.9.1-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.23-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.1-next.1
  - @backstage/plugin-catalog-react@1.10.1-next.1
  - @backstage/core-plugin-api@1.9.1-next.1
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.23-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.4-next.0
  - @backstage/core-components@0.14.1-next.0
  - @backstage/plugin-catalog-react@1.10.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/core-plugin-api@1.9.1-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.22

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 8fe56a8: Widen `@types/react` dependency range to include version 18.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.10.0
  - @backstage/core-components@0.14.0
  - @backstage/catalog-model@1.4.4
  - @backstage/core-plugin-api@1.9.0
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.22-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.0-next.2
  - @backstage/plugin-catalog-react@1.10.0-next.3
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/core-plugin-api@1.9.0-next.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.22-next.2

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 8fe56a8: Widen `@types/react` dependency range to include version 18.
- Updated dependencies
  - @backstage/core-components@0.14.0-next.1
  - @backstage/core-plugin-api@1.9.0-next.1
  - @backstage/plugin-catalog-react@1.10.0-next.2
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.22-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.0-next.0
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/core-plugin-api@1.8.3-next.0
  - @backstage/plugin-catalog-react@1.9.4-next.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.22-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.4-next.0
  - @backstage/core-components@0.13.10
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.2
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.21

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/core-components@0.13.10
  - @backstage/core-plugin-api@1.8.2
  - @backstage/plugin-catalog-react@1.9.3
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.21-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.3-next.2

## 0.3.21-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.2-next.0
  - @backstage/core-components@0.13.10-next.1
  - @backstage/plugin-catalog-react@1.9.3-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.21-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/core-components@0.13.10-next.0
  - @backstage/plugin-catalog-react@1.9.3-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.20

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.1
  - @backstage/plugin-catalog-react@1.9.2
  - @backstage/core-components@0.13.9
  - @backstage/theme@0.5.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.20-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.9-next.3
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/errors@1.2.3
  - @backstage/theme@0.5.0-next.1
  - @backstage/types@1.1.1
  - @backstage/plugin-catalog-react@1.9.2-next.3
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.20-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.5.0-next.1
  - @backstage/plugin-catalog-react@1.9.2-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/core-components@0.13.9-next.2
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.20-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.9-next.1
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/plugin-catalog-react@1.9.2-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/theme@0.5.0-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.20-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.1-next.0
  - @backstage/plugin-catalog-react@1.9.2-next.0
  - @backstage/core-components@0.13.9-next.0
  - @backstage/theme@0.5.0-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.18

### Patch Changes

- 6c2b872153: Add official support for React 18.
- 62b5922916: Internal theme type updates
- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.0
  - @backstage/core-components@0.13.8
  - @backstage/core-plugin-api@1.8.0
  - @backstage/theme@0.4.4
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.18-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.8-next.2
  - @backstage/plugin-catalog-react@1.9.0-next.2

## 0.3.18-next.1

### Patch Changes

- 62b5922916: Internal theme type updates
- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.0-next.1
  - @backstage/core-components@0.13.8-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.0-next.0
  - @backstage/errors@1.2.3
  - @backstage/theme@0.4.4-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.18-next.0

### Patch Changes

- 6c2b872153: Add official support for React 18.
- Updated dependencies
  - @backstage/core-components@0.13.7-next.0
  - @backstage/plugin-catalog-react@1.9.0-next.0
  - @backstage/core-plugin-api@1.8.0-next.0
  - @backstage/theme@0.4.4-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.17

### Patch Changes

- 9a1fce352e: Updated dependency `@testing-library/jest-dom` to `^6.0.0`.
- f95af4e540: Updated dependency `@testing-library/dom` to `^9.0.0`.
- 21f409d776: Export `ScorecardInfo` and `ScorecardsList` components to be able to use manually queried check results directly.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.5
  - @backstage/core-plugin-api@1.7.0
  - @backstage/core-components@0.13.6
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/theme@0.4.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.17-next.2

### Patch Changes

- 21f409d776: Export `ScorecardInfo` and `ScorecardsList` components to be able to use manually queried check results directly.
- Updated dependencies
  - @backstage/core-components@0.13.6-next.2
  - @backstage/core-plugin-api@1.7.0-next.1
  - @backstage/catalog-model@1.4.3-next.0
  - @backstage/plugin-catalog-react@1.8.5-next.2
  - @backstage/errors@1.2.3-next.0
  - @backstage/theme@0.4.3-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.17-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.6-next.1
  - @backstage/plugin-catalog-react@1.8.5-next.1
  - @backstage/core-plugin-api@1.7.0-next.0
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/theme@0.4.2
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.17-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.5-next.0
  - @backstage/core-plugin-api@1.7.0-next.0
  - @backstage/core-components@0.13.6-next.0
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/theme@0.4.2
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.3.16

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- 8cec7664e146: Removed `@types/node` dependency
- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.4
  - @backstage/core-components@0.13.5
  - @backstage/catalog-model@1.4.2
  - @backstage/core-plugin-api@1.6.0
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage/theme@0.4.2
  - @backstage/types@1.1.1

## 0.3.16-next.3

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- Updated dependencies
  - @backstage/catalog-model@1.4.2-next.2
  - @backstage/core-components@0.13.5-next.3
  - @backstage/core-plugin-api@1.6.0-next.3
  - @backstage/errors@1.2.2-next.0
  - @backstage/plugin-catalog-react@1.8.4-next.3
  - @backstage-community/plugin-tech-insights-common@0.2.12-next.0
  - @backstage/theme@0.4.2-next.0
  - @backstage/types@1.1.1-next.0

## 0.3.16-next.2

### Patch Changes

- 8cec7664e146: Removed `@types/node` dependency
- Updated dependencies
  - @backstage/core-components@0.13.5-next.2
  - @backstage/core-plugin-api@1.6.0-next.2
  - @backstage/plugin-catalog-react@1.8.4-next.2
  - @backstage/catalog-model@1.4.2-next.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.16-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.4-next.1
  - @backstage/core-components@0.13.5-next.1
  - @backstage/catalog-model@1.4.2-next.0
  - @backstage/core-plugin-api@1.6.0-next.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.15-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.6.0-next.0
  - @backstage/core-components@0.13.5-next.0
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage/types@1.1.0
  - @backstage/plugin-catalog-react@1.8.3-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.13

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/core-components@0.13.4
  - @backstage/plugin-catalog-react@1.8.1
  - @backstage/core-plugin-api@1.5.3
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.13-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.1-next.1

## 0.3.13-next.1

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/catalog-model@1.4.1
  - @backstage/core-components@0.13.4-next.0
  - @backstage/core-plugin-api@1.5.3
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage/types@1.1.0
  - @backstage/plugin-catalog-react@1.8.1-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.13-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.4-next.0
  - @backstage/core-plugin-api@1.5.3
  - @backstage/plugin-catalog-react@1.8.1-next.0
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.12

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1
  - @backstage/errors@1.2.1
  - @backstage/plugin-catalog-react@1.8.0
  - @backstage/core-components@0.13.3
  - @backstage/core-plugin-api@1.5.3
  - @backstage/catalog-model@1.4.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.12-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.0-next.2
  - @backstage/theme@0.4.1-next.1
  - @backstage/core-plugin-api@1.5.3-next.1
  - @backstage/core-components@0.13.3-next.2
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/errors@1.2.1-next.0
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.12-next.1

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1-next.0
  - @backstage/core-components@0.13.3-next.1
  - @backstage/core-plugin-api@1.5.3-next.0
  - @backstage/plugin-catalog-react@1.7.1-next.1

## 0.3.12-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/core-components@0.13.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/core-plugin-api@1.5.2
  - @backstage/theme@0.4.0
  - @backstage/types@1.1.0
  - @backstage/plugin-catalog-react@1.7.1-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.11

### Patch Changes

- c03307ded3e6: The check description is now rendered with markdown.
- Updated dependencies
  - @backstage/core-plugin-api@1.5.2
  - @backstage/core-components@0.13.2
  - @backstage/types@1.1.0
  - @backstage/theme@0.4.0
  - @backstage/plugin-catalog-react@1.7.0
  - @backstage/catalog-model@1.4.0
  - @backstage/errors@1.2.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.3.11-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.2-next.3
  - @backstage/catalog-model@1.4.0-next.1
  - @backstage/core-plugin-api@1.5.2-next.0
  - @backstage/errors@1.2.0-next.0
  - @backstage/theme@0.4.0-next.1
  - @backstage/types@1.0.2
  - @backstage/plugin-catalog-react@1.7.0-next.3
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.11-next.2

### Patch Changes

- c03307ded3e6: The check description is now rendered with markdown.
- Updated dependencies
  - @backstage/theme@0.4.0-next.1
  - @backstage/plugin-catalog-react@1.7.0-next.2
  - @backstage/core-components@0.13.2-next.2
  - @backstage/core-plugin-api@1.5.2-next.0

## 0.3.11-next.1

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.0-next.0
  - @backstage/core-components@0.13.2-next.1
  - @backstage/plugin-catalog-react@1.7.0-next.1
  - @backstage/catalog-model@1.4.0-next.0
  - @backstage/core-plugin-api@1.5.2-next.0
  - @backstage/theme@0.4.0-next.0
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.11-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.7.0-next.0
  - @backstage/theme@0.4.0-next.0
  - @backstage/core-components@0.13.2-next.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.10

### Patch Changes

- 22963209d23: Added the possibility to customize the check description in the scorecard component.

  - The `CheckResultRenderer` type now exposes an optional `description` method that allows to overwrite the description with a different string or a React component for a provided check result.

  Until now only the `BooleanCheck` element could be overridden, but from now on it's also possible to override the description for a check.
  As an example, the description could change depending on the check result. Refer to the [README](https://github.com/backstage/backstage/blob/master/plugins/tech-insights/README.md#adding-custom-rendering-components) file for more details

- Updated dependencies
  - @backstage/theme@0.3.0
  - @backstage/plugin-catalog-react@1.6.0
  - @backstage/core-components@0.13.1
  - @backstage/catalog-model@1.3.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.10-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.3.0-next.0
  - @backstage/core-components@0.13.1-next.1
  - @backstage/plugin-catalog-react@1.6.0-next.2
  - @backstage/core-plugin-api@1.5.1

## 0.3.10-next.1

### Patch Changes

- 22963209d23: Added the possibility to customize the check description in the scorecard component.

  - The `CheckResultRenderer` type now exposes an optional `description` method that allows to overwrite the description with a different string or a React component for a provided check result.

  Until now only the `BooleanCheck` element could be overridden, but from now on it's also possible to override the description for a check.
  As an example, the description could change depending on the check result. Refer to the [README](https://github.com/backstage/backstage/blob/master/plugins/tech-insights/README.md#adding-custom-rendering-components) file for more details

- Updated dependencies
  - @backstage/core-components@0.13.1-next.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/plugin-catalog-react@1.6.0-next.1

## 0.3.10-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.6.0-next.0
  - @backstage/core-components@0.13.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.19
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.9

### Patch Changes

- f538b9c5b83: The `Check` type now optionally includes the `failureMetadata` and `successMetadata` as returned by the `runChecks` call.
- 8e00acb28db: Small tweaks to remove warnings in the console during development (mainly focusing on techdocs)
- e0c6e8b9c3c: Update peer dependencies
- Updated dependencies
  - @backstage/core-components@0.13.0
  - @backstage/plugin-catalog-react@1.5.0
  - @backstage/theme@0.2.19
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.9-next.3

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.5.0-next.3
  - @backstage/catalog-model@1.3.0-next.0
  - @backstage/core-components@0.13.0-next.3
  - @backstage/core-plugin-api@1.5.1-next.1
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.19-next.0
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.9-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.6-next.2
  - @backstage/plugin-catalog-react@1.4.1-next.2
  - @backstage/core-plugin-api@1.5.1-next.1
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.19-next.0
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.9-next.1

### Patch Changes

- e0c6e8b9c3c: Update peer dependencies
- Updated dependencies
  - @backstage/core-components@0.12.6-next.1
  - @backstage/core-plugin-api@1.5.1-next.0
  - @backstage/plugin-catalog-react@1.4.1-next.1
  - @backstage/theme@0.2.19-next.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.9-next.0

### Patch Changes

- f538b9c5b83: The `Check` type now optionally includes the `failureMetadata` and `successMetadata` as returned by the `runChecks` call.
- 8e00acb28db: Small tweaks to remove warnings in the console during development (mainly focusing on techdocs)
- Updated dependencies
  - @backstage/core-components@0.12.6-next.0
  - @backstage/plugin-catalog-react@1.4.1-next.0
  - @backstage/core-plugin-api@1.5.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.18
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.8

### Patch Changes

- 65454876fb2: Minor API report tweaks
- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/core-components@0.12.5
  - @backstage/plugin-catalog-react@1.4.0
  - @backstage/errors@1.1.5
  - @backstage/core-plugin-api@1.5.0
  - @backstage/catalog-model@1.2.1
  - @backstage/theme@0.2.18
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.8-next.2

### Patch Changes

- 65454876fb2: Minor API report tweaks
- Updated dependencies
  - @backstage/core-components@0.12.5-next.2
  - @backstage/plugin-catalog-react@1.4.0-next.2
  - @backstage/core-plugin-api@1.5.0-next.2

## 0.3.8-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/core-components@0.12.5-next.1
  - @backstage/errors@1.1.5-next.0
  - @backstage/core-plugin-api@1.4.1-next.1
  - @backstage/theme@0.2.18-next.0
  - @backstage/plugin-catalog-react@1.4.0-next.1
  - @backstage/catalog-model@1.2.1-next.1
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.4.0-next.0
  - @backstage/core-plugin-api@1.4.1-next.0
  - @backstage/catalog-model@1.2.1-next.0
  - @backstage/core-components@0.12.5-next.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.17
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.3.7

### Patch Changes

- 4024b37449: TechInsightsApi interface now has getFactSchemas() method.
  TechInsightsClient now implements method getFactSchemas().

  **BREAKING** FactSchema type moved from @backstage-community/plugin-tech-insights-node into @backstage-community/plugin-tech-insights-common

  These changes are **required** if you were importing this type directly.

  ```diff
  - import { FactSchema } from '@backstage-community/plugin-tech-insights-node';
  + import { FactSchema } from '@backstage-community/plugin-tech-insights-common';
  ```

- Updated dependencies
  - @backstage/core-components@0.12.4
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage/catalog-model@1.2.0
  - @backstage/theme@0.2.17
  - @backstage/core-plugin-api@1.4.0
  - @backstage/plugin-catalog-react@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2

## 0.3.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.2.0-next.1
  - @backstage/core-components@0.12.4-next.1
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2
  - @backstage/plugin-catalog-react@1.3.0-next.2
  - @backstage-community/plugin-tech-insights-common@0.2.10-next.0

## 0.3.7-next.1

### Patch Changes

- 4024b37449: TechInsightsApi interface now has getFactSchemas() method.
  TechInsightsClient now implements method getFactSchemas().

  **BREAKING** FactSchema type moved from @backstage-community/plugin-tech-insights-node into @backstage-community/plugin-tech-insights-common

  These changes are **required** if you were importing this type directly.

  ```diff
  - import { FactSchema } from '@backstage-community/plugin-tech-insights-node';
  + import { FactSchema } from '@backstage-community/plugin-tech-insights-common';
  ```

- Updated dependencies
  - @backstage-community/plugin-tech-insights-common@0.2.10-next.0
  - @backstage/core-components@0.12.4-next.0
  - @backstage/plugin-catalog-react@1.3.0-next.1
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2

## 0.3.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.3.0-next.0
  - @backstage/catalog-model@1.1.6-next.0

## 0.3.6

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5
  - @backstage/plugin-catalog-react@1.2.4
  - @backstage/core-components@0.12.3
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.9

## 0.3.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.3.0-next.1
  - @backstage/plugin-catalog-react@1.2.4-next.2
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/core-components@0.12.3-next.2
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.9

## 0.3.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/core-components@0.12.3-next.1
  - @backstage/core-plugin-api@1.2.1-next.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2
  - @backstage/plugin-catalog-react@1.2.4-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9

## 0.3.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.0
  - @backstage/plugin-catalog-react@1.2.4-next.0
  - @backstage/core-components@0.12.3-next.0
  - @backstage/core-plugin-api@1.2.0
  - @backstage/errors@1.1.4
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.9

## 0.3.5

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.2
  - @backstage/plugin-catalog-react@1.2.3

## 0.3.4

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/core-plugin-api@1.2.0
  - @backstage/core-components@0.12.1
  - @backstage/errors@1.1.4
  - @backstage/plugin-catalog-react@1.2.2
  - @backstage/types@1.0.2
  - @backstage/catalog-model@1.1.4
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-tech-insights-common@0.2.9

## 0.3.4-next.4

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.1-next.4
  - @backstage/plugin-catalog-react@1.2.2-next.4
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1

## 0.3.4-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.1-next.3
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2-next.1
  - @backstage/plugin-catalog-react@1.2.2-next.3
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1

## 0.3.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/core-components@0.12.1-next.2
  - @backstage/plugin-catalog-react@1.2.2-next.2
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.2-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1

## 0.3.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.1-next.1
  - @backstage/core-plugin-api@1.1.1-next.1
  - @backstage/types@1.0.2-next.1
  - @backstage/plugin-catalog-react@1.2.2-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1

## 0.3.4-next.0

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/core-components@0.12.1-next.0
  - @backstage/core-plugin-api@1.1.1-next.0
  - @backstage/types@1.0.2-next.0
  - @backstage/plugin-catalog-react@1.2.2-next.0
  - @backstage/catalog-model@1.1.4-next.0
  - @backstage/errors@1.1.4-next.0
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.0

## 0.3.3

### Patch Changes

- 7095e8bc03: Fixed bug when sending data by Post in `runChecks` and `runBulkChecks` functions of the `TechInsightsClient` class, the default `Content-Type` used was `plain/text`
- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.1
  - @backstage/core-components@0.12.0
  - @backstage/core-plugin-api@1.1.0
  - @backstage/catalog-model@1.1.3
  - @backstage/types@1.0.1
  - @backstage/errors@1.1.3
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-tech-insights-common@0.2.8

## 0.3.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.0-next.1
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/core-plugin-api@1.1.0-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.1-next.0
  - @backstage/plugin-catalog-react@1.2.1-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.8-next.0

## 0.3.2-next.0

### Patch Changes

- 7095e8bc03: Fixed bug when sending data by Post in `runChecks` and `runBulkChecks` functions of the `TechInsightsClient` class, the default `Content-Type` used was `plain/text`
- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.1-next.0
  - @backstage/core-components@0.12.0-next.0
  - @backstage/core-plugin-api@1.1.0-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/types@1.0.1-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/theme@0.2.16
  - @backstage-community/plugin-tech-insights-common@0.2.8-next.0

## 0.3.1

### Patch Changes

- f3d272cf57: Make sure to reload score card contents when props change
- a60a6807bd: making available the search for the last FACTS executed
- Updated dependencies
  - @backstage/catalog-model@1.1.2
  - @backstage/plugin-catalog-react@1.2.0
  - @backstage/core-components@0.11.2
  - @backstage/core-plugin-api@1.0.7
  - @backstage/errors@1.1.2
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.0
  - @backstage-community/plugin-tech-insights-common@0.2.7

## 0.3.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.0-next.2
  - @backstage/catalog-model@1.1.2-next.2
  - @backstage/core-components@0.11.2-next.2
  - @backstage/core-plugin-api@1.0.7-next.2
  - @backstage/errors@1.1.2-next.2
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.0
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.2

## 0.3.1-next.1

### Patch Changes

- a60a6807bd: making available the search for the last FACTS executed
- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.0-next.1
  - @backstage/core-components@0.11.2-next.1
  - @backstage/core-plugin-api@1.0.7-next.1
  - @backstage/catalog-model@1.1.2-next.1
  - @backstage/errors@1.1.2-next.1
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.0
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.1

## 0.3.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.2-next.0
  - @backstage/core-components@0.11.2-next.0
  - @backstage/plugin-catalog-react@1.1.5-next.0
  - @backstage/core-plugin-api@1.0.7-next.0
  - @backstage/errors@1.1.2-next.0
  - @backstage/theme@0.2.16
  - @backstage/types@1.0.0
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.0

## 0.3.0

### Minor Changes

- f7e99ac1d8: Added the possibility to display check results of different types on a single scorecard.

  - **BREAKING** Removed the `getScorecardsDefinition` method from the `TechInsightsApi` interface. Added the `getCheckResultRenderers` method that returns rendering components for given types.
  - **BREAKING** The `CheckResultRenderer` type now exposes the `component` factory method that creates a React component used to display a result of a provided check result.
  - The `TechInsightsClient` constructor accepts now the optional `renderers` parameter that can be used to inject a custom renderer.
  - **BREAKING** The `title` parameter in the `EntityTechInsightsScorecardContent` and `EntityTechInsightsScorecardCard` components is now mandatory.
  - The `jsonRulesEngineCheckResultRenderer` used to render `json-rules-engine` check results is exported.
  - The `BooleanCheck` component that can be used to render other check results types is also exported.

  If you were overriding the `getScorecardsDefinition` method to adjust the rendering of check results, you should now provide a custom renderer using `renderers` parameter in the `TechInsightsClient` class.

  See the [README](https://github.com/backstage/backstage/tree/master/plugins/tech-insights/README.md) for more details.

### Patch Changes

- 817f3196f6: Updated React Router dependencies to be peer dependencies.
- 3f739be9d9: Minor API signatures cleanup
- 763fb81e82: Internal refactor to use more type safe code when dealing with route parameters.
- 7d47def9c4: Removed dependency on `@types/jest`.
- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/core-components@0.11.1
  - @backstage/core-plugin-api@1.0.6
  - @backstage/plugin-catalog-react@1.1.4
  - @backstage/catalog-model@1.1.1
  - @backstage/errors@1.1.1

## 0.3.0-next.3

### Patch Changes

- 7d47def9c4: Removed dependency on `@types/jest`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.4-next.2
  - @backstage/catalog-model@1.1.1-next.0
  - @backstage/core-components@0.11.1-next.3
  - @backstage/core-plugin-api@1.0.6-next.3
  - @backstage/errors@1.1.1-next.0

## 0.3.0-next.2

### Patch Changes

- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- Updated dependencies
  - @backstage/core-components@0.11.1-next.2
  - @backstage/core-plugin-api@1.0.6-next.2

## 0.3.0-next.1

### Minor Changes

- f7e99ac1d8: Added the possibility to display check results of different types on a single scorecard.

  - **BREAKING** Removed the `getScorecardsDefinition` method from the `TechInsightsApi` interface. Added the `getCheckResultRenderers` method that returns rendering components for given types.
  - **BREAKING** The `CheckResultRenderer` type now exposes the `component` factory method that creates a React component used to display a result of a provided check result.
  - The `TechInsightsClient` constructor accepts now the optional `renderers` parameter that can be used to inject a custom renderer.
  - **BREAKING** The `title` parameter in the `EntityTechInsightsScorecardContent` and `EntityTechInsightsScorecardCard` components is now mandatory.
  - The `jsonRulesEngineCheckResultRenderer` used to render `json-rules-engine` check results is exported.
  - The `BooleanCheck` component that can be used to render other check results types is also exported.

  If you were overriding the `getScorecardsDefinition` method to adjust the rendering of check results, you should now provide a custom renderer using `renderers` parameter in the `TechInsightsClient` class.

  See the [README](https://github.com/backstage/backstage/tree/master/plugins/tech-insights/README.md) for more details.

### Patch Changes

- 817f3196f6: Updated React Router dependencies to be peer dependencies.
- 763fb81e82: Internal refactor to use more type safe code when dealing with route parameters.
- Updated dependencies
  - @backstage/core-components@0.11.1-next.1
  - @backstage/core-plugin-api@1.0.6-next.1
  - @backstage/plugin-catalog-react@1.1.4-next.1

## 0.2.5-next.0

### Patch Changes

- 3f739be9d9: Minor API signatures cleanup
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/core-plugin-api@1.0.6-next.0
  - @backstage/core-components@0.11.1-next.0
  - @backstage/plugin-catalog-react@1.1.4-next.0

## 0.2.4

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.11.0
  - @backstage/core-plugin-api@1.0.5
  - @backstage/plugin-catalog-react@1.1.3
  - @backstage-community/plugin-tech-insights-common@0.2.6

## 0.2.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.3-next.2
  - @backstage/core-components@0.11.0-next.2

## 0.2.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.0.5-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.6-next.0
  - @backstage/plugin-catalog-react@1.1.3-next.0
  - @backstage/core-components@0.10.1-next.0

## 0.2.3

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- 8006d0f9bf: Updated dependency `msw` to `^0.44.0`.
- Updated dependencies
  - @backstage/core-components@0.10.0
  - @backstage/catalog-model@1.1.0
  - @backstage/core-plugin-api@1.0.4
  - @backstage-community/plugin-tech-insights-common@0.2.5
  - @backstage/plugin-catalog-react@1.1.2
  - @backstage/theme@0.2.16
  - @backstage/errors@1.1.0

## 0.2.3-next.3

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- Updated dependencies
  - @backstage/core-plugin-api@1.0.4-next.0
  - @backstage/core-components@0.10.0-next.3
  - @backstage-community/plugin-tech-insights-common@0.2.5-next.0
  - @backstage/catalog-model@1.1.0-next.3
  - @backstage/plugin-catalog-react@1.1.2-next.3

## 0.2.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.10.0-next.2
  - @backstage/catalog-model@1.1.0-next.2
  - @backstage/theme@0.2.16-next.1
  - @backstage/plugin-catalog-react@1.1.2-next.2

## 0.2.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.9.6-next.1
  - @backstage/catalog-model@1.1.0-next.1
  - @backstage/errors@1.1.0-next.0
  - @backstage/theme@0.2.16-next.0
  - @backstage/plugin-catalog-react@1.1.2-next.1

## 0.2.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.0-next.0
  - @backstage/core-components@0.9.6-next.0
  - @backstage/plugin-catalog-react@1.1.2-next.0

## 0.2.2

### Patch Changes

- 09d2f4d179: Export TechInsightsClient so it may be extended by custom implementations
- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.1
  - @backstage/core-components@0.9.5
  - @backstage/core-plugin-api@1.0.3
  - @backstage/catalog-model@1.0.3

## 0.2.2-next.1

### Patch Changes

- 09d2f4d179: Export TechInsightsClient so it may be extended by custom implementations
- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/core-components@0.9.5-next.1
  - @backstage/core-plugin-api@1.0.3-next.0
  - @backstage/catalog-model@1.0.3-next.0
  - @backstage/plugin-catalog-react@1.1.1-next.1

## 0.2.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.1-next.0
  - @backstage/core-components@0.9.5-next.0

## 0.2.1

### Patch Changes

- aa8db01acb: Add new component `EntityTechInsightsScorecardCard`, which can be used in the overview of the `EntityPage` page or display multiple individual `EntityTechInsightsScorecardCard` in `EntityLayout.Route`.
- Updated dependencies
  - @backstage/core-components@0.9.4
  - @backstage/core-plugin-api@1.0.2
  - @backstage/plugin-catalog-react@1.1.0
  - @backstage/catalog-model@1.0.2

## 0.2.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.9.4-next.1
  - @backstage/plugin-catalog-react@1.1.0-next.2
  - @backstage/catalog-model@1.0.2-next.0
  - @backstage/core-plugin-api@1.0.2-next.1

## 0.2.1-next.1

### Patch Changes

- aa8db01acb: Add new component `EntityTechInsightsScorecardCard`, which can be used in the overview of the `EntityPage` page or display multiple individual `EntityTechInsightsScorecardCard` in `EntityLayout.Route`.
- Updated dependencies
  - @backstage/core-components@0.9.4-next.0
  - @backstage/core-plugin-api@1.0.2-next.0
  - @backstage/plugin-catalog-react@1.1.0-next.1

## 0.2.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.0-next.0

## 0.2.0

### Minor Changes

- 567b13a84a: Add checksId option to EntityTechInsightsScorecardContent component

### Patch Changes

- 24254fd433: build(deps): bump `@testing-library/user-event` from 13.5.0 to 14.0.0
- 230ad0826f: Bump to using `@types/node` v16
- 2fe58c7285: Improved the Tech-Insights documentation:

  - `lifecycle` examples used `ttl` when it should be `timeToLive`
  - Added list of included FactRetrievers
  - Added full backend example using all included FactRetrievers
  - Added boolean scorecard example image showing results of backend example

- Updated dependencies
  - @backstage/plugin-catalog-react@1.0.1
  - @backstage/catalog-model@1.0.1
  - @backstage/core-components@0.9.3
  - @backstage/core-plugin-api@1.0.1

## 0.2.0-next.1

### Minor Changes

- 567b13a84a: Add checksId option to EntityTechInsightsScorecardContent component

### Patch Changes

- 24254fd433: build(deps): bump `@testing-library/user-event` from 13.5.0 to 14.0.0
- 230ad0826f: Bump to using `@types/node` v16
- Updated dependencies
  - @backstage/core-components@0.9.3-next.2
  - @backstage/core-plugin-api@1.0.1-next.0
  - @backstage/plugin-catalog-react@1.0.1-next.3

## 0.1.14-next.0

### Patch Changes

- 2fe58c7285: Improved the Tech-Insights documentation:

  - `lifecycle` examples used `ttl` when it should be `timeToLive`
  - Added list of included FactRetrievers
  - Added full backend example using all included FactRetrievers
  - Added boolean scorecard example image showing results of backend example

- Updated dependencies
  - @backstage/catalog-model@1.0.1-next.0
  - @backstage/plugin-catalog-react@1.0.1-next.0
  - @backstage/core-components@0.9.3-next.0

## 0.1.13

### Patch Changes

- a422d7ce5e: chore(deps): bump `@testing-library/react` from 11.2.6 to 12.1.3
- Updated dependencies
  - @backstage/core-components@0.9.2
  - @backstage/core-plugin-api@1.0.0
  - @backstage/plugin-catalog-react@1.0.0
  - @backstage/catalog-model@1.0.0
  - @backstage/errors@1.0.0
  - @backstage/types@1.0.0
  - @backstage-community/plugin-tech-insights-common@0.2.4

## 0.1.12

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@0.9.0
  - @backstage/core-components@0.9.1
  - @backstage/catalog-model@0.13.0

## 0.1.12-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@0.9.0-next.0
  - @backstage/core-components@0.9.1-next.0
  - @backstage/catalog-model@0.13.0-next.0

## 0.1.11

### Patch Changes

- 36aa63022b: Use `CompoundEntityRef` instead of `EntityName`, and `getCompoundEntityRef` instead of `getEntityName`, from `@backstage/catalog-model`.
- Updated dependencies
  - @backstage/catalog-model@0.12.0
  - @backstage/core-components@0.9.0
  - @backstage/plugin-catalog-react@0.8.0
  - @backstage/core-plugin-api@0.8.0

## 0.1.10

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.10
  - @backstage/plugin-catalog-react@0.7.0
  - @backstage/catalog-model@0.11.0
  - @backstage/core-plugin-api@0.7.0

## 0.1.9

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
  - @backstage/types@0.1.2
  - @backstage-community/plugin-tech-insights-common@0.2.2

## 0.1.8

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.8
  - @backstage/plugin-catalog-react@0.6.14

## 0.1.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.8-next.0
  - @backstage/plugin-catalog-react@0.6.14-next.0

## 0.1.7

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.7
  - @backstage/plugin-catalog-react@0.6.13

## 0.1.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.8.7-next.0
  - @backstage/plugin-catalog-react@0.6.13-next.0

## 0.1.6

### Patch Changes

- 51fbedc445: Migrated usage of deprecated `IdentityApi` methods.
- Updated dependencies
  - @backstage/core-components@0.8.5
  - @backstage/core-plugin-api@0.6.0
  - @backstage/plugin-catalog-react@0.6.12
  - @backstage/catalog-model@0.9.10

## 0.1.6-next.0

### Patch Changes

- 51fbedc445: Migrated usage of deprecated `IdentityApi` methods.
- Updated dependencies
  - @backstage/core-components@0.8.5-next.0
  - @backstage/core-plugin-api@0.6.0-next.0
  - @backstage/plugin-catalog-react@0.6.12-next.0
  - @backstage/catalog-model@0.9.10-next.0

## 0.1.5

### Patch Changes

- 34883f5c9e: Added possibility to pass customized title and description for the scorecards instead of using hardcoded ones.
- a60eb0f0dd: adding new operation to run checks for multiple entities in one request
- 48580d0fbb: fix React warning because of missing `key` prop
- Updated dependencies
  - @backstage/core-components@0.8.4
  - @backstage/core-plugin-api@0.5.0
  - @backstage/plugin-catalog-react@0.6.11
  - @backstage-community/plugin-tech-insights-common@0.2.1
  - @backstage/errors@0.2.0
  - @backstage/catalog-model@0.9.9

## 0.1.4

### Patch Changes

- 4ce51ab0f1: Internal refactor of the `react-use` imports to use `react-use/lib/*` instead.
- 96fb10fe25: remove unnecessary http request when running all checks
- Updated dependencies
  - @backstage/core-plugin-api@0.4.1
  - @backstage/plugin-catalog-react@0.6.10
  - @backstage/core-components@0.8.3

## 0.1.3

### Patch Changes

- a86f5c1701: Fixed API auth in tech-insights plugin
- d83079fc11: Export `techInsightsApiRef` and associated types.
- Updated dependencies
  - @backstage/plugin-catalog-react@0.6.9

## 0.1.2

### Patch Changes

- 6ff4408fa6: RunChecks endpoint now handles missing retriever data in checks. Instead of
  showing server errors, the checks will be shown for checks whose retrievers have
  data, and a warning will be shown if no checks are returned.
- Updated dependencies
  - @backstage/core-plugin-api@0.4.0
  - @backstage/plugin-catalog-react@0.6.8
  - @backstage/core-components@0.8.2

## 0.1.1

### Patch Changes

- cd450844f6: Moved React dependencies to `peerDependencies` and allow both React v16 and v17 to be used.
- Updated dependencies
  - @backstage/core-components@0.8.0
  - @backstage/core-plugin-api@0.3.0
  - @backstage/plugin-catalog-react@0.6.5

## 0.1.0

### Minor Changes

- b5bd60fddc: New package containing UI components for the Tech Insights plugin.

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-tech-insights-common@0.2.0
  - @backstage/core-components@0.7.6
  - @backstage/theme@0.2.14
  - @backstage/core-plugin-api@0.2.2
