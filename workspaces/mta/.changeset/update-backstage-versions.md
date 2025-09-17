---
'@backstage-community/backstage-plugin-mta-frontend': patch
'@backstage-community/backstage-plugin-mta-backend': patch
'@backstage-community/backstage-plugin-catalog-backend-module-mta-entity-provider': patch
'@backstage-community/backstage-plugin-scaffolder-backend-module-mta': patch
---

Update MTA plugins to Backstage 1.39.1 compatibility

- Add supported-versions field to all MTA plugin package.json files
- Update @backstage/cli from ^0.31.1 to ^0.32.0 across all plugins
- Update frontend plugin dependencies to latest compatible versions
- This enables discovery by the RHDH overlay repository automation
