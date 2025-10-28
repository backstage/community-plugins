# @janus-idp/backstage-plugin-tekton-common

## 1.14.0

### Minor Changes

- 547b888: Backstage version bump to v1.44.0

## 1.13.0

### Minor Changes

- f9604b7: Backstage version bump to v1.43.2

## 1.12.0

### Minor Changes

- 8878087: Backstage version bump to v1.42.5

## 1.11.0

### Minor Changes

- 8e74b11: Backstage version bump to v1.41.1

## 1.10.1

### Patch Changes

- 6a59fcf: remove support and lifecycle keywords in package.json

## 1.10.0

### Minor Changes

- 40d7a3b: Bump to backstage version 1.39.1

## 1.9.1

### Patch Changes

- 1d7aaba: Update supported version metadata to 1.38.1

## 1.9.0

### Minor Changes

- 692fc75: Backstage version bump to v1.38.1

## 1.8.1

### Patch Changes

- f84ad73: chore: remove homepage field from package.json

## 1.8.0

### Minor Changes

- de82c49: Bump backstage version to 1.36.1

## 1.7.0

### Minor Changes

- d5a2be5: Update Kubernetes plugin dependencies

## 1.6.0

### Minor Changes

- 48e0647: Use Kubernetes plugin permissions for Tekton plugin, remove tekton-specific permissions from tekton-common plugin

## 1.5.0

### Minor Changes

- 2f344ca: Backstage version bump to v1.35.0

## 1.4.0

### Minor Changes

- fa93564: Migrate Tekton plugin from Janus-IDP community to Backstage community-plugins

  - The plugin now recommends and supports a new annotation to show Tekton PipelineRuns on the CI/CD tab: `tekton.dev/cicd: "true"`
  - The old annotation `janus-idp.io/tekton` is still supported. Any value there enables the plugin.
  - The plugin doesn't export `TEKTON_CI_ANNOTATION`, please use `TektonAnnotations.CICD` from `@backstage-community/plugin-tekton-common` instead. This is a minor breaking change since an update also requires a npm package change.

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
