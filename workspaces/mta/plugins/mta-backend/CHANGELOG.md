# @backstage-community/backstage-plugin-mta-backend

## 0.5.1

### Patch Changes

- ae8c5a9: Remove the need for backend plugin root config

## 0.5.0

### Minor Changes

- eb387c6: Updated MTA plugins for Backstage v1.42.5:

  - Migrated dynamic plugin installer from legacy to new format
  - Enhanced scaffolder action with better type safety and output handling
  - Updated dependencies to align with Backstage v1.42.5

## 0.4.1

### Patch Changes

- ff34bd4: Added logic to strip off any trailing forward slash in the mta.url string
- 1612393: Add ability to dynamically detect plugin version instead of requiring it in the configuration

## 0.4.0

### Minor Changes

- 8a364c5: update Backstage to v1.36.1
- 63609e9: update to Backstage v1.33.6
- 03dde0e: update to Backstage v1.31.3
- 440ab1a: update to Backstage v1.34.2
- fea01d4: update to Backstage v1.37.1
- 3a64cc5: update to Backstage v1.32.5
- 8a364c5: update to Backstage v1.35.1

## 0.3.0

### Minor Changes

- a26bb15: Removed usages and references of `@backstage/backend-common`

## 0.2.2

### Patch Changes

- 9004ac1: Deprecated `createRouter` and its router options in favour of the new backend system.

## 0.2.1

### Patch Changes

- 03b3e06: Removed `export-dynamic` script and Janus IDP cli from the build process and npm release.

## 0.2.0

### Minor Changes

- 5d06fa7: Handle deprecated Identity api

## 0.1.1

### Patch Changes

- 1af9fb3: Rename the package names to be included in @backstage-community
- 7e643d4: Fix broken tsc type check
