# ServiceNow Frontend Plugin

This is the frontend implementation of the ServiceNow plugin for Backstage.

Together with its backend this plugin can show incident data for catalog entities.

## Screenshot

Software Catalog integration:

![Software Catalog that shows an ServiceNow tab with a table of incidents](../../docs/images/catalog-entity-incidents.png)

## Installation

1. **Install the frontend dependency**:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-servicenow
   ```

2. **Add components to your app** (classic frontend system):

   Open `packages/app/src/components/catalog/EntityPage.tsx` and add this imports:

   ```tsx
   import {
     EntityServicenowContent,
     isServicenowAvailable,
     isMyProfile,
   } from '@backstage-community/plugin-servicenow';
   ```

   Then add the following **route** to the `serviceEntityPage`, `websiteEntityPage`,
   and `defaultEntityPage` to show a ServiceNow tab if the annotation is configured:

   ```tsx
   <EntityLayout.Route
     path="/servicenow"
     title="ServiceNow"
     if={isServicenowAvailable}
   >
     <EntityServicenowContent />
   </EntityLayout.Route>
   ```

   You can also a "My ServiceNow Tickets" tab to the `userEntity`.
   The `isMyProfile` condition shows this tab then only the entity of the current user:

   ```tsx
   <EntityLayout.Route path="/servicenow" title="ServiceNow" if={isMyProfile}>
     <EntityServicenowContent />
   </EntityLayout.Route>
   ```

3. Or, if you're using the **new frontend system**:

   In your `packages/app/src/App.tsx` add the plugin to your `createApp` `features` list:

   ```tsx
   import servicenowPlugin from '@backstage-community/plugin-servicenow/alpha';

   // ...
   export default createApp({
     features: [..., servicenowPlugin],
   });
   ```

## Configuration

To enable ServiceNow integration for an entity, add the following annotation to its metadata:

```yaml
metadata:
  annotations:
    servicenow.com/entity-id: my-servicenow-entity-id # has to match the value defined in the incident ticket `u_backstage_entity_id` field
```

For more information how to setup the plugin, please refer to the [General](../../docs/index.md) and [Configuration.md](../../docs/Configuration.md) documentation.

## Development

1. Install dependencies with `yarn install`
2. Start the Backstage dev app with `yarn start`

Your plugin has been added to the example app in this `plugins/servicenow` directory, meaning you'll be able to access it by running `yarn start` in the current directory, and then navigating to [/servicenow](http://localhost:3000/servicenow).
