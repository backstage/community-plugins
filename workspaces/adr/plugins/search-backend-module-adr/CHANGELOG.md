# @backstage-community/search-backend-module-adr

## 0.12.0

### Minor Changes

- f9ce1d4: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [f9ce1d4]
  - @backstage-community/plugin-adr-common@0.13.0

## 0.11.0

### Minor Changes

- 603ae9e: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [603ae9e]
  - @backstage-community/plugin-adr-common@0.12.0

## 0.10.0

### Minor Changes

- bf9bd69: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [bf9bd69]
  - @backstage-community/plugin-adr-common@0.11.0

## 0.9.0

### Minor Changes

- c5f6243: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [c5f6243]
  - @backstage-community/plugin-adr-common@0.10.0

## 0.8.0

### Minor Changes

- e368185: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [e368185]
  - @backstage-community/plugin-adr-common@0.9.0

## 0.7.0

### Minor Changes

- fc4fa2c: Backstage version bump to v1.39.0

### Patch Changes

- Updated dependencies [fc4fa2c]
  - @backstage-community/plugin-adr-common@0.8.0

## 0.6.0

### Minor Changes

- e22d803: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [e22d803]
  - @backstage-community/plugin-adr-common@0.7.0

## 0.5.1

### Patch Changes

- Updated dependencies [b397bd6]
  - @backstage-community/plugin-adr-common@0.6.0

## 0.5.0

### Minor Changes

- b075789: Backstage version bump to v1.37.0

### Patch Changes

- Updated dependencies [b075789]
  - @backstage-community/plugin-adr-common@0.5.0

## 0.4.0

### Minor Changes

- d527ea3: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [d527ea3]
  - @backstage-community/plugin-adr-common@0.4.0

## 0.3.2

### Patch Changes

- 03913ac: Fixed backend-plugin-api import that caused an error at backend startup

## 0.3.1

### Patch Changes

- 9e92818: Removed usages of `@backstage/backend-tasks`

## 0.3.0

### Minor Changes

- d5e54af: Backstage version bump to v1.34.1

### Patch Changes

- Updated dependencies [d5e54af]
  - @backstage-community/plugin-adr-common@0.3.0

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
