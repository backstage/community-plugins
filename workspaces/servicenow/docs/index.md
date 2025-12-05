# ServiceNow Plugin for Backstage

This plugin integrates [ServiceNow](https://www.servicenow.com/) with Backstage, enabling users to view and interact with ServiceNow incident data directly from entity pages in the catalog.

## Features

- Displays "ServiceNow" incident tab, related to a specific entity.
- Supports a "My ServiceNow Tickets" tab, showing incidents for the logged-in user.

## Screenshot

Software Catalog integration:

![Software Catalog that shows an ServiceNow tab with a table of incidents](./images/catalog-entity-incidents.png)

## Link Backstage Entities to ServiceNow Incidents

To associate a ServiceNow incident with a Backstage entity, you can use custom fields in your ServiceNow incident table to filter incidents.

### Standard Entity ID Field (Optional)

If you want to use the `servicenow.com/entity-id` annotation, ensure your ServiceNow incident table includes a custom field named `Backstage entity id`:

**Setup in ServiceNow:**

- **Field name (system ID):** `u_backstage_entity_id`
- **Field label (display name):** `Backstage entity id`
- **Data type:** String
- **Value example:** `my-servicenow-entity-id`

### Custom Fields for Filtering

You can use any custom field in your ServiceNow incidents table (fields starting with `u_`) to filter incidents. For example:

- **Field name:** `u_service` - to filter by service name
- **Field name:** `u_environment` - to filter by environment
- **Field name:** `u_team` - to filter by team

The plugin automatically validates that all annotation fields exist in your ServiceNow schema before querying incidents.

Refer to [Configuration](./Configuration.md) for detailed backend configuration instructions.

### Annotations

To enable ServiceNow integration for an entity, you can use annotations to filter incidents by custom fields in ServiceNow.

#### Standard Entity ID Annotation

The `servicenow.com/entity-id` annotation is a special annotation that filters incidents using the `u_backstage_entity_id` field:

```yaml
metadata:
  annotations:
    servicenow.com/entity-id: my-servicenow-entity-id # has to match the value defined in the incident ticket `u_backstage_entity_id` field
```

#### Custom Field Annotations

You can also use any custom ServiceNow field to filter incidents. The annotation format is `servicenow.com/<field_name>`, where `<field_name>` is the name of a custom field in your ServiceNow incidents table (must start with `u_`).

For example, to filter incidents by a custom field `u_service`:

```yaml
metadata:
  annotations:
    servicenow.com/u_service: my-service-value # filters incidents where u_service field equals "my-service-value"
```

You can use multiple custom field annotations simultaneously:

```yaml
metadata:
  annotations:
    servicenow.com/entity-id: my-servicenow-entity-id
    servicenow.com/u_service: production-service
    servicenow.com/u_environment: production
```

**Important notes:**

- Custom field names must start with `u_` (ServiceNow convention for custom fields)
- The field must exist in your ServiceNow incidents table schema
- The plugin validates that all annotation fields exist in ServiceNow before querying
- All specified annotations are combined using AND logic (incidents must match all specified field values)

### Condition Functions

The plugin includes a `isServicenowAvailable` function to check if the ServiceNow annotation is specified on a software catalog entity.

There is a second condition (`isMyProfile`) that checks whether the current entity matches the logged-in user's entity reference.

This can be used to show "My ServiceNow Tickets" only on a user's own profile page.

> **Note**: The plugin stores the user's `userEntityRef` in `localStorage` at runtime to support this check.

## Backend plugin configuration

```yaml
servicenow:
  instanceUrl: ${SERVICENOW_BASE_URL}
  basicAuth:
    username: ${SERVICENOW_USERNAME}
    password: ${SERVICENOW_PASSWORD}
```
