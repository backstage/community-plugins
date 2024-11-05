# ServiceNow actions for Backstage

This plugin provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [ServiceNow](https://developer.servicenow.com/dev.do#!/reference/api/vancouver/rest).

The following actions are currently supported in this plugin:

- [Table API](https://developer.servicenow.com/dev.do#!/reference/api/vancouver/rest/c_TableAPI)

## Prerequisites

- A [Backstage](https://backstage.io/docs/getting-started/) project

## Installation

Run the following command to install the action package in your Backstage project:

```console
yarn workspace backend add @backstage-community/plugin-scaffolder-backend-module-servicenow
```

### Installing the action on the new backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-servicenow'),
);

backend.start();
```

## Configuration

Update the `app-config.yaml` file to include the following config:

```yaml title="app-config.yaml"
servicenow:
  # The base url of the ServiceNow instance.
  baseUrl: ${SERVICENOW_BASE_URL}
  # The username to use for authentication.
  username: ${SERVICENOW_USERNAME}
  # The password to use for authentication.
  password: ${SERVICENOW_PASSWORD}
```

## Usage

### Action : `servicenow:now:table:createRecord`

#### Request Type: `POST`

#### Input

| Parameter Name                |              Type              | Required | Description                                                                                |
| ----------------------------- | :----------------------------: | :------: | ------------------------------------------------------------------------------------------ |
| `tableName`                   |            `string`            |   Yes    | Name of the table in which to save the record                                              |
| `requestBody`                 | `Record<PropertyKey, unknown>` |    No    | Field name and the associated value for each parameter to define in the specified record   |
| `sysparmDisplayValue`         | `enum("true", "false", "all")` |    No    | Return field display values (true), actual values (false), or both (all) (default: false)  |
| `sysparmExcludeReferenceLink` |           `boolean`            |    No    | True to exclude Table API links for reference fields (default: false)                      |
| `sysparmFields`               |           `string[]`           |    No    | An array of fields to return in the response                                               |
| `sysparmInputDisplayValue`    |           `boolean`            |    No    | Set field values using their display value (true) or actual value (false) (default: false) |
| `sysparmSuppressAutoSysField` |           `boolean`            |    No    | True to suppress auto generation of system fields (default: false)                         |
| `sysparmView`                 |            `string`            |    No    | Render the response according to the specified UI view (overridden by sysparm_fields)      |

#### Output

| Name     |              Type              | Description                      |
| -------- | :----------------------------: | -------------------------------- |
| `result` | `Record<PropertyKey, unknown>` | The response body of the request |

### Action : `servicenow:now:table:deleteRecord`

#### Request Type: `DELETE`

#### Input

| Parameter Name         |   Type    | Required | Description                                                       |
| ---------------------- | :-------: | :------: | ----------------------------------------------------------------- |
| `tableName`            | `string`  |   Yes    | Name of the table in which to delete the record                   |
| `sysId`                | `string`  |   Yes    | Unique identifier of the record to delete                         |
| `sysparmQueryNoDomain` | `boolean` |    No    | True to access data across domains if authorized (default: false) |

### Action : `servicenow:now:table:modifyRecord`

#### Request Type: `PUT`

#### Input

| Parameter Name                |              Type              | Required | Description                                                                                |
| ----------------------------- | :----------------------------: | :------: | ------------------------------------------------------------------------------------------ |
| `tableName`                   |            `string`            |   Yes    | Name of the table in which to modify the record                                            |
| `sysId`                       |            `string`            |   Yes    | Unique identifier of the record to modify                                                  |
| `requestBody`                 | `Record<PropertyKey, unknown>` |    No    | Field name and the associated value for each parameter to define in the specified record   |
| `sysparmDisplayValue`         | `enum("true", "false", "all")` |    No    | Return field display values (true), actual values (false), or both (all) (default: false)  |
| `sysparmExcludeReferenceLink` |           `boolean`            |    No    | True to exclude Table API links for reference fields (default: false)                      |
| `sysparmFields`               |           `string[]`           |    No    | An array of fields to return in the response                                               |
| `sysparmInputDisplayValue`    |           `boolean`            |    No    | Set field values using their display value (true) or actual value (false) (default: false) |
| `sysparmSuppressAutoSysField` |           `boolean`            |    No    | True to suppress auto generation of system fields (default: false)                         |
| `sysparmView`                 |            `string`            |    No    | Render the response according to the specified UI view (overridden by sysparm_fields)      |
| `sysparmQueryNoDomain`        |           `boolean`            |    No    | True to access data across domains if authorized (default: false)                          |

#### Output

| Name     |              Type              | Description                      |
| -------- | :----------------------------: | -------------------------------- |
| `result` | `Record<PropertyKey, unknown>` | The response body of the request |

### Action : `servicenow:now:table:retrieveRecord`

#### Request Type: `GET`

#### Input

| Parameter Name                |              Type              | Required | Description                                                                               |
| ----------------------------- | :----------------------------: | :------: | ----------------------------------------------------------------------------------------- |
| `tableName`                   |            `string`            |   Yes    | Name of the table from which to retrieve the record                                       |
| `sysId`                       |            `string`            |   Yes    | Unique identifier of the record to retrieve                                               |
| `sysparmDisplayValue`         | `enum("true", "false", "all")` |    No    | Return field display values (true), actual values (false), or both (all) (default: false) |
| `sysparmExcludeReferenceLink` |           `boolean`            |    No    | True to exclude Table API links for reference fields (default: false)                     |
| `sysparmFields`               |           `string[]`           |    No    | An array of fields to return in the response                                              |
| `sysparmView`                 |            `string`            |    No    | Render the response according to the specified UI view (overridden by sysparm_fields)     |
| `sysparmQueryNoDomain`        |           `boolean`            |    No    | True to access data across domains if authorized (default: false)                         |

#### Output

| Name     |              Type              | Description                      |
| -------- | :----------------------------: | -------------------------------- |
| `result` | `Record<PropertyKey, unknown>` | The response body of the request |

### Action : `servicenow:now:table:retrieveRecords`

#### Request Type: `GET`

#### Input

| Parameter Name                    |              Type              | Required | Description                                                                               |
| --------------------------------- | :----------------------------: | :------: | ----------------------------------------------------------------------------------------- |
| `tableName`                       |            `string`            |   Yes    | Name of the table from which to retrieve the records                                      |
| `sysparmQuery`                    |            `string`            |    No    | An encoded query string used to filter the results                                        |
| `sysparmDisplayValue`             | `enum("true", "false", "all")` |    No    | Return field display values (true), actual values (false), or both (all) (default: false) |
| `sysparmExcludeReferenceLink`     |           `boolean`            |    No    | True to exclude Table API links for reference fields (default: false)                     |
| `sysparmSuppressPaginationHeader` |           `boolean`            |    No    | True to suppress pagination header (default: false)                                       |
| `sysparmFields`                   |           `string[]`           |    No    | An array of fields to return in the response                                              |
| `sysparmLimit`                    |             `int`              |    No    | The maximum number of results returned per page (default: 10,000)                         |
| `sysparmView`                     |            `string`            |    No    | Render the response according to the specified UI view (overridden by sysparm_fields)     |
| `sysparmQueryCategory`            |            `string`            |    No    | Name of the query category (read replica category) to use for queries                     |
| `sysparmQueryNoDomain`            |           `boolean`            |    No    | True to access data across domains if authorized (default: false)                         |
| `sysparmNoCount`                  |           `boolean`            |    No    | Do not execute a select count(\*) on table (default: false)                               |

#### Output

| Name     |              Type              | Description                      |
| -------- | :----------------------------: | -------------------------------- |
| `result` | `Record<PropertyKey, unknown>` | The response body of the request |

### Action : `servicenow:now:table:updateRecord`

#### Request Type: `PATCH`

#### Input

| Parameter Name                |              Type              | Required | Description                                                                                |
| ----------------------------- | :----------------------------: | :------: | ------------------------------------------------------------------------------------------ |
| `tableName`                   |            `string`            |   Yes    | Name of the table in which to update the record                                            |
| `sysId`                       |            `string`            |   Yes    | Unique identifier of the record to update                                                  |
| `requestBody`                 | `Record<PropertyKey, unknown>` |    No    | Field name and the associated value for each parameter to define in the specified record   |
| `sysparmDisplayValue`         | `enum("true", "false", "all")` |    No    | Return field display values (true), actual values (false), or both (all) (default: false)  |
| `sysparmExcludeReferenceLink` |           `boolean`            |    No    | True to exclude Table API links for reference fields (default: false)                      |
| `sysparmFields`               |           `string[]`           |    No    | An array of fields to return in the response                                               |
| `sysparmInputDisplayValue`    |           `boolean`            |    No    | Set field values using their display value (true) or actual value (false) (default: false) |
| `sysparmSuppressAutoSysField` |           `boolean`            |    No    | True to suppress auto generation of system fields (default: false)                         |
| `sysparmView`                 |            `string`            |    No    | Render the response according to the specified UI view (overridden by sysparm_fields)      |
| `sysparmQueryNoDomain`        |           `boolean`            |    No    | True to access data across domains if authorized (default: false)                          |

#### Output

| Name     |              Type              | Description                      |
| -------- | :----------------------------: | -------------------------------- |
| `result` | `Record<PropertyKey, unknown>` | The response body of the request |
