# @backstage-community/search-backend-module-adr

## 0.2.1

### Patch Changes

- b9f6780: Backstage version bump to v1.32.2
- Updated dependencies [b9f6780]
  - @backstage-community/plugin-adr-common@0.2.30

## 0.2.0

### Minor Changes

- 5b56188: **BREAKING** Removed `TokenManager` as it has been removed from the upstream Backstage packages. `AuthService` is also now required. Please use the new backend system.

### Patch Changes

- 5b56188: Backstage version bump to v1.31.1
- Updated dependencies [5b56188]
  - @backstage-community/plugin-adr-common@0.2.29

## 0.1.4

### Patch Changes

- f43e557: Made the token manager optional. The new-backend module no longer injects custom token managers.

## 0.1.3

### Patch Changes

- f18c579: Backstage version bump to v1.30.2
- Updated dependencies [f18c579]
  - @backstage-community/plugin-adr-common@0.2.28

## 0.1.2

### Patch Changes

- Updated dependencies [5541765]
  - @backstage-community/plugin-adr-common@0.2.27

## 0.1.1

### Patch Changes

- 72e8c01: version:bump to v1.29.1
- Updated dependencies [72e8c01]
  - @backstage-community/plugin-adr-common@0.2.26

## 0.1.0

### Minor Changes

- 828f213: Initial version for the search-backend-module-adr. This module can be used to
  add the search collator directly without having to create the backend module
  on your own if using the new backend system.

### Patch Changes

- Updated dependencies [7ba08a5]
  - @backstage-community/plugin-adr-common@0.2.25
