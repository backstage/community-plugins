# @backstage-community/plugin-catalog-backend-module-annotate-scm-slug

## 0.4.1

### Patch Changes

- d0442ab: add an option for configuring applicable entity kinds through app-config.yaml:

  ```yaml
  catalog:
    processors:
      annotateScmSlug:
        kinds:
          - API
          - Component
          - Resource
          - System
  ```

## 0.4.0

### Minor Changes

- 3d772bb: Backstage version bump to v1.51.0
- 91db3c1: Backstage version bump to v1.52.0

## 0.3.0

### Minor Changes

- c0e3399: Backstage version bump to v1.50.2

## 0.2.0

### Minor Changes

- e1b2ed3: Backstage version bump to v1.49.2

## 0.1.1

### Patch Changes

- a9fa274: Backstage version bump to v1.48.4

## 0.1.0

### Minor Changes

- b0d0837: Added a new Catalog backend module for the `AnnotateScmSlugEntityProcessor`, see the [`README`](https://github.com/backstage/community-plugins/tree/main/workspaces/catalog/plugins/catalog-backend-module-annotate-scm-slug) for more details
