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
[backend]: 2025-03-25T17:24:17.438Z permission info permission.role-create isAuditEvent=true eventId="role-create" severityLevel="medium" actor={"actorId":"user:default/dzemanov","ip":"::1","hostname":"localhost","us
erAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"} request={"url":"/api/permission/roles","method":"POST"} meta={"source":"rest"} status=
"initiated"
[backend]: 2025-03-25T17:24:17.458Z permission info permission.role-create isAuditEvent=true eventId="role-create" severityLevel="medium" actor={"actorId":"user:default/dzemanov","ip":"::1","hostname":"localhost","us
erAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"} request={"url":"/api/permission/roles","method":"POST"} meta={"source":"rest","respons
e":{"status":201},"roleEntityRef":"role:default/test","description":"some test role","author":"user:default/dzemanov","modifiedBy":"user:default/dzemanov","createdAt":"Tue, 25 Mar 2025 17:24:17 GMT","lastModified":"T
ue, 25 Mar 2025 17:24:17 GMT","members":["user:default/dzemanov"]} status="succeeded"

[backend]: 2025-03-25T17:24:17.461Z permission info permission.policy-create isAuditEvent=true eventId="policy-create" severityLevel="medium" actor={"actorId":"user:default/dzemanov","ip":"::1","hostname":"localhost"
,"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"} request={"url":"/api/permission/policies","method":"POST"} meta={"source":"rest"}
status="initiated"
[backend]: 2025-03-25T17:24:17.473Z permission info permission.policy-create isAuditEvent=true eventId="policy-create" severityLevel="medium" actor={"actorId":"user:default/dzemanov","ip":"::1","hostname":"localhost"
,"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"} request={"url":"/api/permission/policies","method":"POST"} meta={"source":"rest","
response":{"status":201},"policies":[["role:default/test","catalog.entity.read","read","allow"],["role:default/test","catalog.entity.create","create","allow"],["role:default/test","catalog.entity.refresh","update","a
llow"],["role:default/test","scaffolder.task.create","create","allow"],["role:default/test","scaffolder.task.read","read","allow"]]} status="succeeded"

[backend]: 2025-03-25T17:24:17.476Z permission info permission.condition-create isAuditEvent=true eventId="condition-create" severityLevel="medium" actor={"actorId":"user:default/dzemanov","ip":"::1","hostname":"loca
lhost","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"} request={"url":"/api/permission/roles/conditions","method":"POST"} meta={"so
urce":"rest"} status="initiated"
[backend]: 2025-03-25T17:24:17.488Z permission info permission.condition-create isAuditEvent=true eventId="condition-create" severityLevel="medium" actor={"actorId":"user:default/dzemanov","ip":"::1","hostname":"loca
lhost","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"} request={"url":"/api/permission/roles/conditions","method":"POST"} meta={"so
urce":"rest","response":{"status":201},"condition":{"result":"CONDITIONAL","roleEntityRef":"role:default/test","pluginId":"catalog","resourceType":"catalog-entity","permissionMapping":["delete"],"conditions":{"rule":
"IS_ENTITY_OWNER","resourceType":"catalog-entity","params":{"claims":["group:default/team-a"]}}}} status="succeeded"
```

b) Check access user to application resource:

```json
[backend]: 2025-03-25T17:24:29.154Z permission info permission.permission-evaluation isAuditEvent=true eventId="permission-evaluation" severityLevel="medium" actor={"actorId":"plugin:permission"} request=undefined meta={"userEntityRef":"user:default/dzemanov","permissionName":"scaffolder.task.create","action":"create"} status="initiated"
[backend]: 2025-03-25T17:24:29.171Z permission info permission.permission-evaluation isAuditEvent=true eventId="permission-evaluation" severityLevel="medium" actor={"actorId":"plugin:permission"} request=undefined meta={"userEntityRef":"user:default/dzemanov","permissionName":"scaffolder.task.create","action":"create","result":"ALLOW"} status="succeeded"

[backend]: 2025-03-25T17:24:17.509Z permission info permission.permission-evaluation isAuditEvent=true eventId="permission-evaluation" severityLevel="medium" actor={"actorId":"plugin:permission"} request=undefined me
ta={"userEntityRef":"user:default/dzemanov","permissionName":"policy.entity.delete","action":"delete","resourceType":"policy-entity"} status="initiated"
[backend]: 2025-03-25T17:24:17.522Z permission info permission.permission-evaluation isAuditEvent=true eventId="permission-evaluation" severityLevel="medium" actor={"actorId":"plugin:permission"} request=undefined me
ta={"userEntityRef":"user:default/dzemanov","permissionName":"policy.entity.delete","action":"delete","resourceType":"policy-entity","result":"ALLOW"} status="succeeded"
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

- **`condition-rules-read`**: List conditional rule parameter schema. (GET `/plugins/condition-rules`)

**Plugins Event meta:**

- source: string (`rest`)

**Plugins Event fail/success meta:**

- source: string (`rest`)
