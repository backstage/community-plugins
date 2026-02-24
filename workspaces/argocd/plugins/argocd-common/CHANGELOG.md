# @backstage-community/plugin-argocd-common

## 1.13.0

### Minor Changes

- 2ef9a5d: Backstage version bump to v1.47.2

## 1.12.2

### Patch Changes

- 4818f35: Updated the `repository.url` value to just be an HTTP URL in the `package.json` file following the common convention in this repo.

## 1.12.1

### Patch Changes

- 536b783: Updated dependency `@kubernetes/client-node` to `1.4.0`.

## 1.12.0

### Minor Changes

- 6d47b9f: Renamed @backstage-community/plugin-redhat-argocd-common to @backstage-community/plugin-argocd-common

# @backstage-community/plugin-redhat-argocd-common

## 1.11.0

### Minor Changes

- a23ba3c: Adds ArgoCD application discovery from multiple clusters (ArgoCD instances) per Catalog entity. You can now specify multiple ArgoCD instances to fetch ArgoCD applications from in your entity via `argocd/instance-name` annotation, separated by commas. These instance names must match instance names configured in your `app-config.yaml`. Use `argocd/app-selector` annotation to filter ArgoCD applications for your entity across ArgoCD instances and namespaces. Use `argocd/app-name` annotation to filter out single ArgoCD application per ArgoCD instance. Without the `argocd/instance-name` annotation, the plugin now searches all available ArgoCD instances instead of defaulting to the first one. The order of displayed applications is determined by the order of instance names under `argocd/instance-name` annotation. If this annotation is missing, order is determined by the order of instances in the configuration.

## 1.10.0

### Minor Changes

- c5dc1a5: Backstage version bump to v1.45.1

## 1.9.0

### Minor Changes

- d49c2a6: Backstage version bump to v1.44.2

## 1.8.0

### Minor Changes

- 3131da0: Backstage version bump to v1.42.3

## 1.7.0

### Minor Changes

- a0dba77: Backstage version bump to v1.41.1

## 1.6.1

### Patch Changes

- 6a59fcf: remove support and lifecycle keywords in package.json

## 1.6.0

### Minor Changes

- a6a149c: Bump backstage version to v1.39.1

## 1.5.2

### Patch Changes

- 6cb63d0: Resolve 'React not defined error' due to misconfigured plugin level tsconfig

## 1.5.1

### Patch Changes

- 1d7aaba: Update supported version metadata to 1.38.1

## 1.5.0

### Minor Changes

- bfc2838: Bump backstage version to v1.38.1

## 1.4.0

### Minor Changes

- 1eafdb8: Bump backstage version to 1.36.1

### Patch Changes

- f84ad73: chore: remove homepage field from package.json

## 1.3.0

### Minor Changes

- bba0c01: Add multi-source application support and move application types to plugin-redhat-argocd-common package.

## 1.2.0

### Minor Changes

- b1f7d58: Backstage version bump to v1.35.0

## 1.1.0

### Minor Changes

- 5b0553e: bump backstage to 1.34.2 and remove @spotify/prettier-config

## 1.0.7

### Patch Changes

- ccc01a0: Backstage version bump to v1.32.2

## 1.0.6

### Patch Changes

- a1313aa: Backstage version bump to v1.31.2

## 1.0.5

### Patch Changes

- 38d858e: regen yarn.lock

## 1.0.4

### Patch Changes

- 576a2d1: chore: update supported-versions to 1.29.2

## 1.0.3

### Patch Changes

- 8907cb6: Backstage version bump to v1.30.2

## 1.0.2

### Patch Changes

- 3b45ff6: The `argocd` and `argocd-common` plugins from the [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins) repository were migrated to the community plugins, based on commit [c3232099](https://github.com/janus-idp/backstage-plugins/commit/c3232099). The migration was performed by following the manual migration steps outlined in the [Community Plugins CONTRIBUTING guide](https://github.com/backstage/community-plugins/blob/main/CONTRIBUTING.md#migrating-a-plugin)
