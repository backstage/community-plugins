# @backstage-community/plugin-argocd-backend

## 1.1.0

### Minor Changes

- 2ef9a5d: Backstage version bump to v1.47.2

### Patch Changes

- Updated dependencies [2ef9a5d]
  - @backstage-community/plugin-argocd-common@1.13.0

## 1.0.4

### Patch Changes

- 074cfaa: Changes the (mostly internal used) pluginId from `argocd` to `backstage-community-argocd` to resolve a conflict with the Argo CD plugin from Roadie. This will allow users to install both plugins in parallel. Since the Backstage Community Argo CD plugin works fine with the Roadie Argo CD Backend plugin the frontend automatically falls back to the `argocd` backend if there is no `backstage-community-argocd` backend available.

## 1.0.3

### Patch Changes

- b133c9d: Updated dependency `@types/supertest` to `^6.0.0`.
- Updated dependencies [4818f35]
  - @backstage-community/plugin-argocd-common@1.12.2

## 1.0.2

### Patch Changes

- 9ed8237: Removed deprecations, switched to using `permissionsRegistry` instead of `permissionIntegrationRouter`. Fixed ERR_HTTP_HEADERS_SENT error when permissions are missing.

## 1.0.1

### Patch Changes

- 536b783: Updated dependency `@kubernetes/client-node` to `1.4.0`.
- Updated dependencies [536b783]
  - @backstage-community/plugin-argocd-common@1.12.1

## 1.0.0

### Major Changes

- 6d47b9f: Renamed @backstage-community/plugin-redhat-argocd-backend to @backstage-community/plugin-argocd-backend
- 6d47b9f: Release the major version of argocd backend plugin

### Patch Changes

- Updated dependencies [6d47b9f]
  - @backstage-community/plugin-argocd-common@1.12.0

# @backstage-community/plugin-redhat-argocd-backend

## 0.13.0

### Minor Changes

- a23ba3c: Adds ArgoCD application discovery from multiple clusters (ArgoCD instances) per Catalog entity. You can now specify multiple ArgoCD instances to fetch ArgoCD applications from in your entity via `argocd/instance-name` annotation, separated by commas. These instance names must match instance names configured in your `app-config.yaml`. Use `argocd/app-selector` annotation to filter ArgoCD applications for your entity across ArgoCD instances and namespaces. Use `argocd/app-name` annotation to filter out single ArgoCD application per ArgoCD instance. Without the `argocd/instance-name` annotation, the plugin now searches all available ArgoCD instances instead of defaulting to the first one. The order of displayed applications is determined by the order of instance names under `argocd/instance-name` annotation. If this annotation is missing, order is determined by the order of instances in the configuration.

### Patch Changes

- 6d3ed24: Updated dependency `supertest` to `^7.0.0`.
- Updated dependencies [a23ba3c]
  - @backstage-community/plugin-redhat-argocd-common@1.11.0

## 0.12.0

### Minor Changes

- c5dc1a5: Backstage version bump to v1.45.1

### Patch Changes

- Updated dependencies [c5dc1a5]
  - @backstage-community/plugin-redhat-argocd-common@1.10.0

## 0.11.0

### Minor Changes

- d49c2a6: Backstage version bump to v1.44.2

### Patch Changes

- Updated dependencies [d49c2a6]
  - @backstage-community/plugin-redhat-argocd-common@1.9.0

## 0.10.0

### Minor Changes

- 3131da0: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [3131da0]
  - @backstage-community/plugin-redhat-argocd-common@1.8.0

## 0.9.0

### Minor Changes

- a0dba77: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [a0dba77]
  - @backstage-community/plugin-redhat-argocd-common@1.7.0

## 0.8.1

### Patch Changes

- 6a59fcf: remove support and lifecycle keywords in package.json
- Updated dependencies [6a59fcf]
  - @backstage-community/plugin-redhat-argocd-common@1.6.1

## 0.8.0

### Minor Changes

- a6a149c: Bump backstage version to v1.39.1

### Patch Changes

- Updated dependencies [a6a149c]
  - @backstage-community/plugin-redhat-argocd-common@1.6.0

## 0.7.1

### Patch Changes

- Updated dependencies [6cb63d0]
  - @backstage-community/plugin-redhat-argocd-common@1.5.2

## 0.7.0

### Minor Changes

- 90b54c9: allow appNamespace and project to be used with appName

### Patch Changes

- 9c78a8d: Fix issue where backend does not return instance url in the metadata

## 0.6.1

### Patch Changes

- 1d7aaba: Update supported version metadata to 1.38.1
- Updated dependencies [1d7aaba]
  - @backstage-community/plugin-redhat-argocd-common@1.5.1

## 0.6.0

### Minor Changes

- bfc2838: Bump backstage version to v1.38.1

### Patch Changes

- Updated dependencies [bfc2838]
  - @backstage-community/plugin-redhat-argocd-common@1.5.0

## 0.5.0

### Minor Changes

- 1eafdb8: Bump backstage version to 1.36.1

### Patch Changes

- f84ad73: chore: remove homepage field from package.json
- Updated dependencies [f84ad73]
- Updated dependencies [1eafdb8]
  - @backstage-community/plugin-redhat-argocd-common@1.4.0

## 0.4.0

### Minor Changes

- 110b103: Add scalprum configuration for generating OCI artifacts

## 0.3.0

### Minor Changes

- bba0c01: Add multi-source application support and move application types to plugin-redhat-argocd-common package.

### Patch Changes

- Updated dependencies [bba0c01]
  - @backstage-community/plugin-redhat-argocd-common@1.3.0

## 0.2.0

### Minor Changes

- 8322199: Introduce new Red Hat ArgoCD Backend for the Red Hat ArgoCD Plugin
