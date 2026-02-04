# Archived Workspaces

This document contains a list of workspaces and plugins that have been archived from the community-plugins repository.

## About Archived Workspaces

When a workspace or plugin is archived:

- The code is no longer actively maintained
- The npm packages are deprecated with a deprecation message
- The workspace/plugin is removed from the active codebase
- A Git tag can provide historical reference to the source
- An entry is added to this document for reference

To archive a workspace or plugin, use the `archive-workspace` script:

```bash
# Archive an entire workspace
./scripts/archive-workspace workspace-name

# Archive a specific plugin within a workspace
./scripts/archive-workspace workspace-name plugin-name
```

## Archived Items

| Workspace | Package                                                                            | Reason                                                            | Source                                                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| analytics | `@backstage-community/plugin-analytics-module-ga`                                  | Built for Universal Analytics, which has been deprecated.         | [@backstage-community/plugin-analytics-module-ga@0.9.0](https://github.com/backstage/community-plugins/tree/@backstage-community/plugin-analytics-module-ga@0.9.0/workspaces/analytics)                                                             |
| odo       | `@backstage-community/plugin-odo-module-devfile-field-extension`                   | No longer maintained                                              | [@backstage-community/plugin-odo-module-devfile-field-extension@0.24.0](https://github.com/backstage/community-plugins/tree/@backstage-community/plugin-odo-module-devfile-field-extension@0.24.0/workspaces/odo)                                   |
| odo       | `@backstage-community/plugin-scaffolder-backend-module-odo`                        | No longer maintained                                              | [@backstage-community/plugin-scaffolder-backend-module-odo@0.24.0](https://github.com/backstage/community-plugins/tree/@backstage-community/plugin-scaffolder-backend-module-odo@0.24.0/workspaces/odo)                                             |
| matomo    | `@backstage-community/plugin-matomo`                                               | No longer maintained                                              | [@backstage-community/plugin-matomo@1.13.1](https://github.com/backstage/community-plugins/tree/@backstage-community/plugin-matomo@1.13.1/workspaces/matomo)                                                                                        |
| matomo    | `@backstage-community/plugin-matomo-backend`                                       | No longer maintained                                              | [@backstage-community/plugin-matomo-backend@1.14.0](https://github.com/backstage/community-plugins/tree/@backstage-community/plugin-matomo-backend@1.14.0/workspaces/matomo)                                                                        |
| mta       | `@backstage-community/backstage-plugin-catalog-backend-module-mta-entity-provider` | Plugin moved to rhdh-plugins repository for RHDH-specific support | [@backstage-community/backstage-plugin-catalog-backend-module-mta-entity-provider@0.4.0](https://github.com/backstage/community-plugins/tree/@backstage-community/backstage-plugin-catalog-backend-module-mta-entity-provider@0.4.0/workspaces/mta) |
| mta       | `@backstage-community/backstage-plugin-mta-backend`                                | Plugin moved to rhdh-plugins repository for RHDH-specific support | [@backstage-community/backstage-plugin-mta-backend@0.5.2](https://github.com/backstage/community-plugins/tree/@backstage-community/backstage-plugin-mta-backend@0.5.2/workspaces/mta)                                                               |
| mta       | `@backstage-community/backstage-plugin-mta-frontend`                               | Plugin moved to rhdh-plugins repository for RHDH-specific support | [@backstage-community/backstage-plugin-mta-frontend@0.4.1](https://github.com/backstage/community-plugins/tree/@backstage-community/backstage-plugin-mta-frontend@0.4.1/workspaces/mta)                                                             |
| mta       | `@backstage-community/backstage-plugin-scaffolder-backend-module-mta`              | Plugin moved to rhdh-plugins repository for RHDH-specific support | [@backstage-community/backstage-plugin-scaffolder-backend-module-mta@0.5.0](https://github.com/backstage/community-plugins/tree/@backstage-community/backstage-plugin-scaffolder-backend-module-mta@0.5.0/workspaces/mta)                           |
