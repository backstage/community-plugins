# @backstage-community/plugin-scaffolder-backend-module-azure-devops

## 0.22.0

### Minor Changes

- 00555dc: Backstage version bump to v1.48.2

## 0.21.0

### Minor Changes

- 20faa44: **BREAKING** Fixed bug in `createAzureDevopsRunPipelineAction` where `pipelineRun.result` returned an integer instead of the corresponding string

## 0.20.1

### Patch Changes

- 09a0a9b: Add support for alternative merge strategies, when using azure:pr:create

## 0.20.0

### Minor Changes

- 5f512a6: Backstage version bump to v1.47.2

## 0.19.1

### Patch Changes

- 7c297d4: Updated dependency `azure-devops-node-api` to `^15.0.0`.

## 0.19.0

### Minor Changes

- f9618c9: Backstage version bump to v1.46.2

## 0.18.0

### Minor Changes

- c2644cb: Add option that marks action as failed if pipeline result is not successful

### Patch Changes

- 3c0a6e4: Fix bearer token authentication for Git clone operations

## 0.17.0

### Minor Changes

- 840c7dc: Backstage version bump to v1.45.1

## 0.16.1

### Patch Changes

- e05584e: Added validation to prevent branch names with spaces

## 0.16.0

### Minor Changes

- ff113c2: Backstage version bump to v1.44.0

## 0.15.1

### Patch Changes

- 93cfa0a: Added fetch depth option to the `azure:repository:clone` action.

## 0.15.0

### Minor Changes

- 40839b2: Backstage version bump to v1.43.2

## 0.14.0

### Minor Changes

- 1e1ece3: Add new actions for Azure DevOps: Git Clone, Push and Create new Pull Request

## 0.13.0

### Minor Changes

- 8367480: Backstage version bump to v1.42.3

## 0.12.0

### Minor Changes

- 1634963: Backstage version bump to v1.41.1

## 0.11.1

### Patch Changes

- 1fc5b4b: Add new action (azure:pipeline:permit) to Authorize the necessary pipeline resources (e.g., Service Connections, repositories) by executing azure:pipeline:permit; this step ensures that the pipeline has all the required permissions to automatically access the protected resources.

## 0.11.0

### Minor Changes

- 1e109cd: Backstage version bump to v1.40.2

## 0.10.1

### Patch Changes

- 28b2765: Add a new action (azure:pipeline:create) to create pipeline definition from a YAML file.

## 0.10.0

### Minor Changes

- dd67a17: Backstage version bump to v1.39.0

## 0.9.0

### Minor Changes

- 6f19535: Added ability to wait for pipeline to complete and to get output variables

## 0.8.1

### Patch Changes

- 735b8a0: fix syntax error in install command in README

## 0.8.0

### Minor Changes

- 79f360a: Backstage version bump to v1.38.1

## 0.7.0

### Minor Changes

- 75f72bb: Backstage version bump to v1.37.0

## 0.6.0

### Minor Changes

- ff23f2f: Backstage version bump to v1.36.1

## 0.5.0

### Minor Changes

- 2ca3917: Backstage version bump to v1.35.1

## 0.4.0

### Minor Changes

- 52190f0: Backstage version bump to v1.34.1

## 0.3.0

### Minor Changes

- 5b2427d: Adds support for template parameters to the `azure:pipeline:run` action

## 0.2.0

### Minor Changes

- 7ce46dc: Backstage version bump to v1.33.5

## 0.1.2

### Patch Changes

- 0880746: Updated code with proper TSDoc comments to generate API Reports

## 0.1.1

### Patch Changes

- 28110f5: Introduced the `azure:pipeline:run` scaffolder action
