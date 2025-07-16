# @backstage-community/plugin-search-backend-module-confluence-collator

## 0.10.0

### Minor Changes

- 106dd40: Add support for scoped API tokens when using Atlassian Cloud for the Confluence plugin.

## 0.9.0

### Minor Changes

- 8298b36: Backstage version bump to v1.40.2

## 0.8.0

### Minor Changes

- 3b26c6b: Backstage version bump to v1.38.1

## 0.7.0

### Minor Changes

- 7f9ae73: Added configurable rate limiting to the Confluence plugin to mitigate excessive requests and improve performance under high load. Administrators can now set limits on API calls to better control usage. Please refer to the documentation for configuration details.

## 0.6.0

### Minor Changes

- 5b8d4b0: Backstage version bump to v1.37.0

## 0.5.0

### Minor Changes

- 53f211f: Backstage version bump to v1.36.1

## 0.4.1

### Patch Changes

- 0a80de6: update app-config example for confluence search collator schedule

## 0.4.0

### Minor Changes

- 75f7435: Backstage version bump to v1.35.1

## 0.3.2

### Patch Changes

- 18c36d8: Removed usages of `@backstage/backend-tasks`

## 0.3.1

### Patch Changes

- 5431e37: Update config with links to confluence docs, and ensure omitting the optional 'spaces' & 'query' config sections returns all results (instead of throwing an error)

## 0.3.0

### Minor Changes

- cfd4174: Backstage version bump to v1.34.2

## 0.2.5

### Patch Changes

- f4ea9a2: Fix typo in readme

## 0.2.4

### Patch Changes

- 3211478: Make `parallelismLimit` configuration field optional.

  This field is already treated as optional in the package code, and the default
  value is already mentioned in the description. As such we can safely mark it as
  optional and treat configuration which omits it as valid.

## 0.2.3

### Patch Changes

- e45e2f8: Remove unused @backstage/backend-common package from dependencies.

## 0.2.2

### Patch Changes

- e4aaaf6: Backstage version bump to v1.32.2

## 0.2.1

### Patch Changes

- 8efbeed: Backstage version bump to v1.31.1

## 0.2.0

### Minor Changes

- 33f9933: Add query parameter that allows providing a CQL query that is combined with spaces to more finely select the documents to index

### Patch Changes

- 8d99cb1: Backstage version bump to v1.30.2

## 0.1.0

### Minor Changes

- 3ee48db: Initial plugin version. A copy of its original [repo](https://github.com/K-Phoen/backstage-plugin-confluence) updated to support the new backend system and compatible with the configuration specs of the [Confluence to Markdown action](https://github.com/backstage/backstage/tree/master/plugins/scaffolder-backend-module-confluence-to-markdown) scaffolder plugin.
