# @backstage-community/plugin-search-backend-module-report-portal

The report-portal-collator backend module for the search plugin.

_This plugin was created through the Backstage CLI_

## Installation

1. Run the following command to install report portal search collator module:

   ```sh
   yarn workspace backend add @backstage-community/plugin-search-backend-module-report-portal
   ```

2. Add the module after search plugin in you `backend/src/index.ts`
   ```js title="backend/src/index.ts"
   backend.add(import('@backstage-community/plugin-search-backend'));
   backend.add(
     import('@backstage-community/plugin-search-backend-module-report-portal'),
   );
   ```

## Config:

You may also want to add configuration parameters to your app-config, for example for controlling the scheduled indexing interval. These parameters should be placed under the `search.collators.reportPortal` key.See [config](./config.d.ts) file for up to date options.

```yaml
search:
  collators:
    reportPortal:
      # Configure schdeule for indexing
      schedule: # Example :down:
        frequency: { minutes: 10 }
        timeout: { minutes: 5 }
        initialDelay: { seconds: 3 }
      # Base location for collated resources, should be same as your frontend plugin route.
      locationTemplate: '/report-portal'
```
