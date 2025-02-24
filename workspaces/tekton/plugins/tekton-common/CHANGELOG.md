# @janus-idp/backstage-plugin-tekton-common

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
