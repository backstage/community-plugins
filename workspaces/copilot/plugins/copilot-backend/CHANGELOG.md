# @backstage-community/plugin-copilot-backend

## 0.7.0

### Minor Changes

- 2bae2d2: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [2bae2d2]
  - @backstage-community/plugin-copilot-common@0.7.0

## 0.6.0

### Minor Changes

- 10cacf8: Backend updated for using the new /metrics API that Github Provides.
  Added new tables to the database to store all metrics provided by Github.

  New metrics output from the backend are currently made compatible with the
  old format expected by the frontend in order to make minimum amount of changes
  in this version.

  The Backend router merges the old saved metrics with the new if the selected
  date range overlaps both old and new metrics. Otherwise it selects from eiter
  old or new.

  It also fetches the maximum availible date range taking into account that
  old metrics and/or new metrics are availible from the database.

### Patch Changes

- Updated dependencies [10cacf8]
  - @backstage-community/plugin-copilot-common@0.6.0

## 0.5.0

### Minor Changes

- f5be5aa: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [f5be5aa]
  - @backstage-community/plugin-copilot-common@0.5.0

## 0.4.0

### Minor Changes

- 6e44ae3: Added ability to use GitHub App authentication for organization level metrics

## 0.3.2

### Patch Changes

- e9b265d: Removed usages of `@backstage/backend-tasks`

## 0.3.1

### Patch Changes

- 6bf6fe4: Updated READMEs to clarify installation instructions including locations to run commands from and steps for new backend system

## 0.3.0

### Minor Changes

- 53e7191: Backstage version bump to v1.34.2

### Patch Changes

- Updated dependencies [53e7191]
  - @backstage-community/plugin-copilot-common@0.4.0

## 0.2.0

### Minor Changes

- 7f17c9f: Introduced support for organizations and team metrics visualization in the Copilot plugin.

### Patch Changes

- Updated dependencies [7f17c9f]
  - @backstage-community/plugin-copilot-common@0.3.0

## 0.1.6

### Patch Changes

- f6d006d: Added support for specifying private GitHub tokens dedicated to the Copilot plugin. This is useful if you don't want to use the same token for both the Copilot backend and other GitHub integrations. To do this, you can specify a new GitHub integration using a string as the host:

  ```diff
    integrations:
      github:
        - host: github.com
          token: your_token
  +     - host: your_copilot_private_token
  +       token: your_super_token
  +       apiBaseUrl: https://api.github.com
    copilot:
  -   host: github.com
  +   host: your_copilot_private_token
      enterprise: your_enterprise
  ```

## 0.1.5

### Patch Changes

- e45e2f8: Remove unused @backstage/backend-common package from dependencies.

## 0.1.4

### Patch Changes

- 399dc3b: Backstage version bump to v1.32.2
- Updated dependencies [399dc3b]
  - @backstage-community/plugin-copilot-common@0.2.2

## 0.1.3

### Patch Changes

- 0617e87: Backstage version bump to v1.31.1
- Updated dependencies [0617e87]
  - @backstage-community/plugin-copilot-common@0.2.1

## 0.1.2

### Patch Changes

- Updated dependencies [c55888b]
  - @backstage-community/plugin-copilot-common@0.2.0

## 0.1.1

### Patch Changes

- ad6f23d: Backstage version bump to v1.30.2
- Updated dependencies [ad6f23d]
  - @backstage-community/plugin-copilot-common@0.1.1

## 0.1.0

### Minor Changes

- 2d5f011: Introduced the GitHub Copilot plugin, checkout the plugin's [`README.md`](https://github.com/backstage/community-plugins/tree/main/workspaces/copilot/plugins/copilot) for more details!

### Patch Changes

- Updated dependencies [2d5f011]
  - @backstage-community/plugin-copilot-common@0.1.0
