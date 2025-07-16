# ServiceNow Plugin for Backstage

This plugin integrates [ServiceNow](https://www.servicenow.com/) with Backstage, enabling users to view and interact with ServiceNow incident data directly from entity pages in the catalog.

## Features

- Displays ServiceNow incident tickets related to a specific entity.
- Supports a "My ServiceNow Tickets" tab, showing incidents for the logged-in user.
- Integrates with dynamic plugin configuration (`dynamic-plugins-config.yaml`) to control visibility via conditions.
- Fetches data via a secure backend API client using `identityApi` and `discoveryApi`.

## Backend configuration

Refer to [Configuration.md](./docs/Configuration.md) for detailed backend configuration instructions.

## Linking ServiceNow Tickets to Backstage Entities

To associate a ServiceNow incident with a Backstage entity, ensure your ServiceNow incident table includes a custom field named `Backstage entity id`.

**Required setup in ServiceNow:**

- **Field name (system ID):** `u_backstage_entity_id`
- **Field label (display name):** `Backstage entity id`
- **Data type:** String
- **Value example:** `my-servicenow-entity-id`

## Annotations

To enable ServiceNow integration for an entity, add the following annotation to its metadata:

```yaml
metadata:
  annotations:
    servicenow.com/entity-id: my-servicenow-entity-id # has to match the value defined in the incident ticket `u_backstage_entity_id` field
```

## Dynamic Mount Configuration

This plugin supports dynamic mount points via Backstage’s dynamic plugin system (e.g., in [RHDH instances](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.6)).

### Backend plugin configuration

```yaml
pluginConfig:
  servicenow:
    instanceUrl: ${SERVICENOW_BASE_URL}
    basicAuth:
      username: ${SERVICENOW_USERNAME}
      password: ${SERVICENOW_PASSWORD}
```

### Frontend plugin configuration

```yaml
dynamicPlugins:
  frontend:
    backstage-community.plugin-servicenow:
      entityTabs:
        - path: /servicenow
          title: ServiceNow
          mountPoint: entity.page.servicenow
        - path: /my-servicenow
          title: My ServiceNow tickets
          mountPoint: entity.page.my-servicenow
      mountPoints:
        - mountPoint: entity.page.servicenow/cards
          importName: ServicenowPage
          config:
            layout:
              gridColumn: 1 / -1
              height: 75vh
            if:
              anyOf:
                - hasAnnotation: servicenow.com/entity-id
        - mountPoint: entity.page.my-servicenow/cards
          importName: ServicenowPage
          config:
            layout:
              gridColumn: 1 / -1
              height: 75vh
            if:
              allOf:
                - isKind: user
                - isMyProfile
```

## Condition Function

The plugin includes a condition module (isMyProfile) that checks whether the current entity matches the logged-in user's entity reference. This is used to show "My ServiceNow Tickets" only on a user's own profile page.

> **Note**: The plugin stores the user's `userEntityRef` in `localStorage` at runtime to support this check.

## Running the Dev App

To start the dev app, refer to [plugins/servicenow/README.md](./plugins/README.md)
