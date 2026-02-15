# @backstage-community/plugin-quay-common

## 1.17.1

### Patch Changes

- f4d1bd1: Removed unused dependencies

## 1.17.0

### Minor Changes

- c4a2eb9: Backstage version bump to v1.47.2

## 1.16.0

### Minor Changes

- c89d117: Backstage version bump to v1.46.2

## 1.15.0

### Minor Changes

- 482a213: Backstage version bump to v1.45.3

## 1.14.0

### Minor Changes

- 40d312e: **BREAKING**: Added support for multiple Quay instances. Backend plugin routes now require an `:instance-name` parameter to support multiple Quay instances:

  - `/repository/:org/:repo/tag` → `/:instanceName/repository/:org/:repo/tag`
  - `/repository/:org/:repo/manifest/{digest}` → `/:instanceName/repository/:org/:repo/manifest/{digest}`
  - `/repository/:org/:repo/manifest/{digest}/labels` → `/:instanceName/repository/:org/:repo/manifest/{digest}/labels`
  - `/repository/:org/:repo/manifest/{digest}/security` → `/instanceName/repository/:org/:repo/manifest/{digest}/security`

## 1.13.0

### Minor Changes

- 54a1b43: Backstage version bump to v1.44.0

## 1.12.0

### Minor Changes

- 5c7023b: Backstage version bump to v1.43.2

## 1.11.0

### Minor Changes

- f1dab24: Backstage version bump to v1.42.3

## 1.10.0

### Minor Changes

- 78bb7a9: Backstage version bump to v1.41.1

## 1.9.1

### Patch Changes

- 6a59fcf: remove support and lifecycle keywords in package.json

## 1.9.0

### Minor Changes

- 279c9ba: Backstage version bump to v1.39.1

## 1.8.1

### Patch Changes

- 1d7aaba: Update supported version metadata to 1.38.1

## 1.8.0

### Minor Changes

- e172aba: Bump backstage version to v1.38.1

## 1.7.2

### Patch Changes

- 16c57cc: chore: Remove usage of @spotify/prettier-config

## 1.7.1

### Patch Changes

- f84ad73: chore: remove homepage field from package.json

## 1.7.0

### Minor Changes

- 1f3ea2f: Backstage version bump to v1.36.1

### Patch Changes

- 973a5ef: remove prettier from devDevpendencies

## 1.6.0

### Minor Changes

- e541edd: Adds a new quay-backend plugin and updates the frontend quay plugin to use this new backend.
- e541edd: Add a quay-backend plugin to query the quay.io API

## 1.5.0

### Minor Changes

- 7226329: Backstage version bump to v1.35.0

## 1.4.0

### Minor Changes

- 7daf65a: Backstage version bump to v1.34.2

### Patch Changes

- 0f5c451: Updated dependency `prettier` to `3.4.2`.

## 1.3.4

### Patch Changes

- 1af220c: Clean up api report warnings and remove unnecessary files

## 1.3.3

### Patch Changes

- 8c4c579: Updated report.api.md

## 1.3.2

### Patch Changes

- 00c79ed: Migrated from [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins).

## 1.3.1

### Patch Changes

- 0e6bfd3: feat: update Backstage to the latest version

  Update to Backstage 1.32.5

## 1.3.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

## 1.2.0

### Minor Changes

- d9551ae: feat(deps): update to backstage 1.31

### Patch Changes

- d9551ae: change deps to peer deps in common packages
- d9551ae: upgrade to yarn v3
