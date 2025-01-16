# @backstage-community/plugin-search-backend-module-confluence-collator

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
