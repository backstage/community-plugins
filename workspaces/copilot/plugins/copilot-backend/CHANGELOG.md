# @backstage-community/plugin-copilot-backend

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
