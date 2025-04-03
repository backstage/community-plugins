# Example permissions within Showcase / RHDH

Note: The requirements section primarily pertains to the frontend and may not be strictly necessary for the backend.

When defining a permission for the RBAC Backend plugin to consume, follow these guidelines:

- Permission policies defined using the name of the permission will have higher priority over permission policies that are defined using the resource type.

  - Example:

    ```CSV
    p, role:default/myrole, catalog-entity, read, allow
    p, role:default/myrole, catalog.entity.read, read, deny
    g, user:default/myuser, role:default/myrole
    ```

  Where 'myuser' will have a deny for reading catalog entities, because the permission name takes priority over the permission resource type.

- If the permission does not have a policy associated with it, use the keyword `use` in its place.
  - Example: `p, role:default/test, kubernetes.proxy, use, allow`

## Resource Type vs Basic Named Permissions

There are two types of permissions within Backstage that can be defined using the RBAC Backend plugin. These are resource permissions and basic named permissions. The difference between the two is whether or not a permission has a resource type. Resource type permissions can be defined either using their associated resource type or their name. Basic named permissions must use their name.

Basic name permissions are simple permissions that handle most use cases for plugins. These permissions on require a name and an attribute during creation. While the name and attribute for the basic named permission are required, the actions under the attributes are optional. These actions are what we consider policies within the RBAC Backend plugin.

- Example of the `catalog.location.read` permission and how it would be defined using the RBAC Backend plugin:

  ```ts
  export const catalogLocationReadPermission = createPermission({
    name: 'catalog.location.read',
    attributes: {
      action: 'read',
    },
  });
  ```

  ```CSV
  p, role:default/myrole, catalog.location.read, read, allow
  g, user:default/myuser, role:default/myrole
  ```

Resource type permissions on the other hand are basic named permissions with a resource type. These permissions are typically associated with conditional permission rules based on that particular resource type. We can define these permissions using either their name or resource type.

- Example of the `catalog.entity.read` permission and two ways that we can define its permissions using the RBAC Backend plugin:

  ```ts
  export const RESOURCE_TYPE_CATALOG_ENTITY = 'catalog-entity';

  export const catalogEntityReadPermission = createPermission({
    name: 'catalog.entity.read',
    attributes: {
      action: 'read',
    },
    resourceType: RESOURCE_TYPE_CATALOG_ENTITY,
  });
  ```

  ```CSV
  p, role:default/myrole, catalog.entity.read, read, allow
  g, user:default/myuser, role:default/myrole

  p, role:default/another-role, catalog-entity, read, allow
  g, user:default/another-user, role:default/another-role
  ```

## Catalog

| Name                    | Resource Type  | Policy | Description                                             | Requirements            |
| ----------------------- | -------------- | ------ | ------------------------------------------------------- | ----------------------- |
| catalog.entity.read     | catalog-entity | read   | Allows the user to read from the catalog                | X                       |
| catalog.entity.create   |                | create | Allows the user to create catalog entities              | catalog.location.create |
| catalog.entity.refresh  | catalog-entity | update | Allows the user to refresh one or more catalog entities | catalog.entity.read     |
| catalog.entity.delete   | catalog-entity | delete | Allows the user to delete one or more catalog entities  | catalog.entity.read     |
| catalog.location.read   |                | read   | Allows the user to read one or more catalog locations   | catalog.entity.read     |
| catalog.location.create |                | create | Allows the user to create one or more catalog locations | catalog.entity.create   |
| catalog.location.delete |                | delete | Allows the user to delete one or more catalog locations | catalog.entity.delete   |

## Jenkins

| Name            | Resource Type  | Policy | Description                                                | Requirements        |
| --------------- | -------------- | ------ | ---------------------------------------------------------- | ------------------- |
| jenkins.execute | catalog-entity | update | Allows the user to execute an action in the Jenkins plugin | catalog.entity.read |

## Kubernetes

| Name                      | Resource Type | Policy | Description                                                                                                 | Requirements        |
| ------------------------- | ------------- | ------ | ----------------------------------------------------------------------------------------------------------- | ------------------- |
| kubernetes.clusters.read  |               | read   | Allows the user to read Kubernetes clusters information under `/clusters`                                   | catalog.entity.read |
| kubernetes.resources.read |               | read   | Allows the user to read Kubernetes resources information under `/services/:serviceId` and `/resources`      | catalog.entity.read |
| kubernetes.proxy          |               |        | Allows the user to access the proxy endpoint (ability to read pod logs and events within Showcase and RHDH) | catalog.entity.read |

## RBAC

| Name                 | Resource Type | Policy | Description                                           | Requirements |
| -------------------- | ------------- | ------ | ----------------------------------------------------- | ------------ |
| policy.entity.read   | policy-entity | read   | Allows the user to read permission policies / roles   | X            |
| policy.entity.create | policy-entity | create | Allows the user to create permission policies / roles | X            |
| policy.entity.update | policy-entity | update | Allow the user to update permission policies / roles  | X            |
| policy.entity.delete | policy-entity | delete | Allow the user to delete permission policies / roles  | X            |

## Scaffolder

| Name                               | Resource Type       | Policy | Description                                                                                                                                           | Requirements                                                      |
| ---------------------------------- | ------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| scaffolder.action.execute          | scaffolder-action   |        | Allows the execution of an action from a template                                                                                                     | scaffolder.template.parameter.read, scaffolder.template.step.read |
| scaffolder.template.parameter.read | scaffolder-template | read   | Allows the user to read parameters of a template                                                                                                      | scaffolder.template.step.read                                     |
| scaffolder.template.step.read      | scaffolder-template | read   | Allows the user to read steps of a template                                                                                                           | scaffolder.template.parameter.read                                |
| scaffolder.task.create             |                     | create | This permission is used to authorize actions that involve the creation of tasks in the scaffolder                                                     | scaffolder.template.parameter.read, scaffolder.template.step.read |
| scaffolder.task.read               |                     | read   | This permission is used to authorize actions that involve reading one or more tasks in the scaffolder and reading logs of tasks                       | scaffolder.template.parameter.read, scaffolder.template.step.read |
| scaffolder.task.cancel             |                     | use    | This permission is used to authorize actions that involve the cancellation of tasks in the scaffolder                                                 | scaffolder.template.parameter.read, scaffolder.template.step.read |
| scaffolder.template.management     |                     | use    | Allows a user or role to access frontend template management features, including editing, previewing, and trying templates, forms, and custom fields. |                                                                   |

## OCM

| Name             | Resource Type | Policy | Description                                                       | Requirements |
| ---------------- | ------------- | ------ | ----------------------------------------------------------------- | ------------ |
| ocm.entity.read  |               | read   | Allows the user to read from the ocm plugin                       | X            |
| ocm.cluster.read |               | read   | Allows the user to read the cluster information in the ocm plugin | X            |

## Tekton

| Name                      | Resource Type | Policy | Description                                                                                                        | Requirements        |
| ------------------------- | ------------- | ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------- |
| kubernetes.clusters.read  |               | read   | Allows the user to read Kubernetes clusters information under `/clusters`                                          | catalog.entity.read |
| kubernetes.resources.read |               | read   | Allows the user to read Kubernetes resources information under `/services/:serviceId` and `/resources`             | catalog.entity.read |
| kubernetes.proxy          |               |        | Allows the user to access the proxy endpoint (ability to read tekton pod logs and events within Showcase and RHDH) | catalog.entity.read |

## Topology

| Name                      | Resource Type | Policy | Description                                                                                                 | Requirements        |
| ------------------------- | ------------- | ------ | ----------------------------------------------------------------------------------------------------------- | ------------------- |
| kubernetes.clusters.read  |               | read   | Allows the user to read Kubernetes clusters information under `/clusters`                                   | catalog.entity.read |
| kubernetes.resources.read |               | read   | Allows the user to read Kubernetes resources information under `/services/:serviceId` and `/resources`      | catalog.entity.read |
| kubernetes.proxy          |               |        | Allows the user to access the proxy endpoint (ability to read pod logs and events within Showcase and RHDH) | catalog.entity.read |

## Argocd

| Name             | Resource Type | Policy | Description                               | Requirements        |
| ---------------- | ------------- | ------ | ----------------------------------------- | ------------------- |
| argocd.view.read |               | read   | Allows the user to view the argocd plugin | catalog.entity.read |

## Quay

| Name           | Resource Type | Policy | Description                             | Requirements        |
| -------------- | ------------- | ------ | --------------------------------------- | ------------------- |
| quay.view.read |               | read   | Allows the user to view the quay plugin | catalog.entity.read |

## Bulk Import

| Name        | Resource Type | Policy | Description                                                                                                                                                                          | Requirements |
| ----------- | ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| bulk.import | bulk-import   |        | Allows the user to access the bulk import endpoints (listing all repositories and organizations accessible by all GitHub integrations, as well as managing the import requests, ...) | X            |
