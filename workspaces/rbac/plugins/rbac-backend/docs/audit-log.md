# Audit logging

The RBAC backend plugin supports audit logging with the help of the Auditor Service from [`@backstage/backend-plugin-api`](https://www.npmjs.com/package/@backstage/backend-plugin-api) package. Audit logging helps to track the latest changes and events from the RBAC plugin:

- RBAC role changes;
- RBAC permissions changes;
- RBAC conditions changes;
- Changes causing modification of application configuration;
- Changes causing modification of the permission policy file;
- GET requests for RBAC permission information;
- User authorization results to RBAC resources.

The RBAC backend plugin logging doesn't provide information about the actual state of the permissions. The actual state of RBAC permissions can be found in the RBAC UI. Audit logging provides information about what operations were performed, by whom, when, and on which resources. Each operation to audit is recorded as an event with an `eventId` that represents the logical group of the action, such as `role-create`. The event contains information about event id, RBAC permission changes, the actor who made these changes, time, severityLevel, some part of the request if applicable, response if applicable, and so on. You can use this information like a history of the RBAC operations.

Notice: RBAC permissions and conditions are bound to RBAC roles. However, the RBAC backend plugin logs information about permissions and conditions with the help of separated log messages. That's because for now, the RBAC plugin has a separated API for RBAC roles, RBAC permissions, and RBAC conditions.

## Audit log actor

The audit log actor can be a real REST API user or the RBAC plugin itself. When the actor is a REST API user, then the RBAC plugin logs the user's IP, browser agent, and hostname. The RBAC plugin can also be the actor of the events. In this case, the actor has an actorId: "plugin:permission". In this case, the plugin typically applies changes from the configuration or permission policy file. Application configuration and permission policy files usually mount to the application deployment with the help of config maps. Unfortunately, the RBAC plugin cannot track who originally made modifications to these resources. But you can enable Kubernetes API audit log: https://kubernetes.io/docs/tasks/debug/debug-cluster/audit. Then you can match RBAC plugin audit log events to the events from Kubernetes logs by time.

## Audit log format

The RBAC plugin prints information to the backend log in JSON format. The format of these messages is defined in the `@backstage/backend-plugin-api` library. Each audit log line contains the key "isAuditEvent".

Example logged RBAC events:

a) RBAC role created with corresponding basic permissions and conditional permission:

```json
backend:start: {"actor":{"actorId":"user:default/andrienkoaleksandr","hostname":"localhost","ip":"::1","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"},"eventName":"CreateRole","isAuditLog":true,"level":"info","message":"Created role:default/test","meta":{"author":"user:default/andrienkoaleksandr","createdAt":"Tue, 04 Jun 2024 13:51:45 GMT","description":"some test role","lastModified":"Tue, 04 Jun 2024 13:51:45 GMT","members":["user:default/logarifm","group:default/team-a"],"modifiedBy":"user:default/andrienkoaleksandr","roleEntityRef":"role:default/test","source":"rest"},"plugin":"permission","request":{"body":{"memberReferences":["user:default/logarifm","group:default/team-a"],"metadata":{"description":"some test role"},"name":"role:default/test"},"method":"POST","params":{},"query":{},"url":"/api/permission/roles"},"response":{"status":201},"service":"backstage","stage":"sendResponse","status":"succeeded","timestamp":"2024-06-04 16:51:45"}

backend:start: {"actor":{"actorId":"user:default/andrienkoaleksandr","hostname":"localhost","ip":"::1","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"},"eventName":"CreatePolicy","isAuditLog":true,"level":"info","message":"Created permission policies","meta":{"policies":[["role:default/test","scaffolder-template","read","allow"]],"source":"rest"},"plugin":"permission","request":{"body":[{"effect":"allow","entityReference":"role:default/test","permission":"scaffolder-template","policy":"read"}],"method":"POST","params":{},"query":{},"url":"/api/permission/policies"},"response":{"status":201},"service":"backstage","stage":"sendResponse","status":"succeeded","timestamp":"2024-06-04 16:51:45"}

backend:start: {"actor":{"actorId":"user:default/andrienkoaleksandr","hostname":"localhost","ip":"::1","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"},"eventName":"CreateCondition","isAuditLog":true,"level":"info","message":"Created conditional permission policy","meta":{"condition":{"conditions":{"params":{"claims":["group:default/team-a"]},"resourceType":"catalog-entity","rule":"IS_ENTITY_OWNER"},"permissionMapping":[{"action":"read","name":"catalog.entity.read"},{"action":"delete","name":"catalog.entity.delete"},{"action":"update","name":"catalog.entity.refresh"}],"pluginId":"catalog","resourceType":"catalog-entity","result":"CONDITIONAL","roleEntityRef":"role:default/test"}},"plugin":"permission","request":{"body":{"conditions":{"params":{"claims":["group:default/team-a"]},"resourceType":"catalog-entity","rule":"IS_ENTITY_OWNER"},"permissionMapping":["read","delete","update"],"pluginId":"catalog","resourceType":"catalog-entity","result":"CONDITIONAL","roleEntityRef":"role:default/test"},"method":"POST","params":{},"query":{},"url":"/api/permission/roles/conditions"},"response":{"body":{"id":9},"status":201},"service":"backstage","stage":"sendResponse","status":"succeeded","timestamp":"2024-06-04 16:51:45"}
```

b) Check access user to application resource:

```json
backend:start: {"actor":{"actorId":"user:default/andrienkoaleksandr"},"eventName":"PermissionEvaluationStarted","isAuditLog":true,"level":"info","message":"Policy check for user:default/andrienkoaleksandr","meta":{"action":"create","permissionName":"policy.entity.create","resourceType":"policy-entity","userEntityRef":"user:default/andrienkoaleksandr"},"plugin":"permission","service":"backstage","stage":"evaluatePermissionAccess","status":"succeeded","timestamp":"2024-06-04 16:51:45"}

backend:start: {"actor":{"actorId":"user:default/andrienkoaleksandr"},"eventName":"PermissionEvaluationCompleted","isAuditLog":true,"level":"info","message":"user:default/andrienkoaleksandr is ALLOW for permission 'policy.entity.create', resource type 'policy-entity' and action 'create'","meta":{"action":"create","decision":{"result":"ALLOW"},"permissionName":"policy.entity.create","resourceType":"policy-entity","userEntityRef":"user:default/andrienkoaleksandr"},"plugin":"permission","service":"backstage","stage":"evaluatePermissionAccess","status":"succeeded","timestamp":"2024-06-04 16:51:45"}
```

Most audit log lines contain a metadata object. The RBAC plugin includes information about RBAC roles, permissions, conditions, and authorization results in this metadata.

Notice: You need to properly configure the logger to see nested JSON objects in the audit log lines.

## RBAC audit events

The RBAC backend emits audit events for various operations. Events are grouped logically by `eventId`. Failed events contain `error` information.

### Role Events

- **`role-create`**: Creates roles. (POST `/roles`, extension point `applyRoles`, `rbac_admin` role from `configuration`)

- **`role-read`**: Reads roles. (GET `/roles`)

  Filter on `queryType`.

  - **`all`**: Read all roles. (GET `/roles`)
  - **`by-role`**: Read concrete role. (GET `/roles/:kind/:namespace/:name`)

- **`role-update`**: Updates roles. (PUT `/roles`)

- **`role-delete`**: Deletes roles. (DELETE `/roles`, extension point `applyRoles`)

- **`role-mutate`**: Bulk creates or updates roles. (loading roles from `csv file`)

  **Event meta:**

  - source: string (source emitting the event: `csv-file`)

  **Event fail/success meta:**

  - source: string (source emitting the event: `csv-file`)
  - addedPolicies: string[][]
  - updatedPolicies: string[][]
  - failedPolicies: string[][]

**Role Event meta:**

- source: string (source emitting the event, `rest`, `csv-file`, `configuration`, `externalProviderPluginId`)

**Role Event fail/success meta:**

- source: string (source emitting the event, `rest`, `csv-file`, `configuration`, `externalProviderPluginId`)
- roleEntityRef: string
- description?: string
- members: string[]

### Permission Events

- **`policy-create`**: Creates permissions. (POST `/policies`, extension point `applyPermissions`)

- **`policy-read`**: Reads permissions. (GET `/policies`)

  Filter on `queryType`.

  - **`all`**: Read all policies. (GET `/policies`)
  - **`by-role`**: Read all policies associated with a role. (GET `/policies/:kind/:namespace/:name`)
  - **`by-query`**: Read all policies that match query filter criteria. (GET `/policies`)

- **`policy-update`**: Updates permissions. (PUT `/policies`)

- **`policy-delete`**: Deletes permissions. (DELETE `/policies`, extension point `applyPermissions`)

**Permission Event meta:**

- source: string (source emitting the event, `rest`, `csv-file`, `configuration`, `externalProviderPluginId`)

**Permission Event fail/success meta:**

- source: string (source emitting the event, `rest`, `csv-file`, `configuration`, `externalProviderPluginId`)
- policies: string[][]

### Condition Events

- **`condition-create`**: Creates conditions. (POST `/roles/conditions`, extension point `applyPermissions`)

- **`condition-read`**: Reads conditions. (GET `/roles/conditions`)

  Filter on `queryType`.

  - **`all`**: Read all conditions. (GET `/roles/conditions`)
  - **`by-id`**: Read condition with id. (GET `/roles/conditions/:id`)
  - **`by-query`**: Read all conditions that match query filter criteria. (GET `/policies`)

- **`condition-update`**: Updates conditions. (PUT `/roles/conditions`)

- **`condition-delete`**: Deletes conditions. (DELETE `/roles/conditions`, extension point `applyPermissions`)

**Condition Event meta:**

- source?: string (source emitting the event, `rest` or not included for conditions from `yaml-conditional-file`)

**Condition Event fail/success meta:**

- source?: string (source emitting the event, `rest` or not included for conditions from `yaml-conditional-file`)
- policies: string[][]

### Conditional File Events

- **`conditional-policies-file-not-found`**: Conditional policies file was not found.

- **`conditional-policies-file-change`**: Conditional policies file changed.

### Permission Evaluation Events

- **`permission-evaluation`**: Evaluation of permissions.

**Permission Evaluation Event meta:**

- userEntityRef: string
- permissionName: string
- action: PermissionAction
- resourceType?: string
- decision?: PolicyDecision

**Permission Evaluation Success/Fail meta:**

- userEntityRef: string
- permissionName: string
- action: PermissionAction
- resourceType?: string
- decision?: PolicyDecision
- result: AuthorizeResult

### Plugins Events

- **`plugin-policies-read`**: List available plugin permission policies. (GET `/plugins/policies`)

- **`condition-rules-read`**: List conditional rule parameter schema. (GET `/condition-rules-read`)

**Plugins Event meta:**

- source: string (`rest`)

**Plugins Event fail/success meta:**

- source: string (`rest`)
