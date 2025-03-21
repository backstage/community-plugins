# @backstage-community/plugin-tech-insights-maturity

## 0.2.1

### Patch Changes

- d2113b3: Fixed entity page integration instructions
- a8e2f2c: Updated dependency `@material-ui/lab` to `4.0.0-alpha.61`.
  Updated dependency `@mui/icons-material` to `5.16.14`.
  Updated dependency `@mui/material` to `5.16.14`.
  Updated dependency `@mui/styles` to `5.16.14`.
  Updated dependency `@mui/x-charts` to `6.19.8`.
  Updated dependency `@mui/lab` to `5.0.0-alpha.175`.
- 47f1713: - update imports to come from the tech-insights-react package
  - remove direct dependency on `tech-insights` frontend package

## 0.2.0

### Minor Changes

- e919e53: Backstage version bump to v1.35.1

### Patch Changes

- f015469: Introducing a new tech insights react plugin for reusuable frontend utilities. All migrated components and APIs have been marked as deprecated. Please update your imports to come from `@backstage-community/plugin-tech-insights-react`

  Package json files for each plugin have been updated to reflect the new plugin in the Backstage `pluginPackages` metadata.

- Updated dependencies [f015469]
- Updated dependencies [f015469]
- Updated dependencies [e919e53]
- Updated dependencies [c107e0f]
  - @backstage-community/plugin-tech-insights-maturity-common@0.2.0
  - @backstage-community/plugin-tech-insights-common@0.5.0
  - @backstage-community/plugin-tech-insights@0.5.0
