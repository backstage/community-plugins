# RBAC backend plugin for Backstage

This plugin seamlessly integrates with the [Backstage permission framework](https://backstage.io/docs/permissions/overview/) to empower you with robust role-based access control capabilities within your Backstage environment.

The Backstage permission framework is a core component of the Backstage project, designed to provide meticulous control over resource and action access. Our RBAC plugin harnesses the power of this framework, allowing you to tailor access permissions without the need for coding. Instead, you can effortlessly manage your access policies through User interface embedded within Backstage or via the configuration files.

With the RBAC plugin, you'll have the means to efficiently administer permissions within your Backstage instance by assigning them to users and groups.

## Prerequisites

Before you dive into utilizing the RBAC plugin for Backstage, there are a few essential prerequisites to ensure a seamless experience. Please review the following requirements to make sure your environment is properly set up

### Setup Permission Framework

**NOTE**: This section is only relevant if you are still on the old backend system.

To effectively utilize the RBAC plugin, you must have the Backstage permission framework in place. If you're using the Red Hat Developer Hub, some of these steps may have already been completed for you. However, for other Backstage application instances, please verify that the following prerequisites are satisfied:

You need to [set up the permission framework in Backstage](https://backstage.io/docs/permissions/getting-started/).Since this plugin provides a dynamic policy that replaces the traditional one, there's no need to create a policy manually. Please note that one of the requirements for permission framework is enabling the [service-to-service authentication](https://backstage.io/docs/auth/service-to-service-auth/#setup). Ensure that you complete these authentication setup steps as well.

### Identity resolver

The permission framework, and consequently, this RBAC plugin, rely on the concept of group membership. To ensure smooth operation, please follow the [Sign-in identities and resolvers](https://backstage.io/docs/auth/identity-resolver/) documentation. It's crucial that when populating groups, you include any groups that you plan to assign permissions to.

## Installation

To integrate the RBAC plugin into your Backstage instance, follow these steps.

### Installing the plugin

Add the RBAC plugin packages as dependencies by running the following command.

```SHELL
yarn workspace backend add @backstage-community/plugin-rbac-backend
```

**NOTE**: If you are using Red Hat Developer Hub backend plugin is pre-installed and you do not need this step.

### Configuring the Backend

#### New Backend System

The RBAC plugin supports the integration with the new backend system.

Add the RBAC plugin to the `packages/backend/src/index.ts` file and remove the Permission backend plugin and Allow All Permission policy module.

```diff
// permission plugin
- backend.add(import('@backstage/plugin-permission-backend/alpha'));
- backend.add(
-    import('@backstage/plugin-permission-backend-module-allow-all-policy'),
-  );
+ backend.add(import('@backstage-community/plugin-rbac-backend'));
```

### Configure policy admins

The RBAC plugin empowers you to manage permission policies for users and groups with a designated group of individuals known as policy administrators. These administrators are granted access to the RBAC plugin's REST API and user interface as well as the ability to read from the catalog.

You can specify the policy administrators in your application configuration as follows:

```YAML
permission:
  enabled: true
  rbac:
    admin:
      users:
        - name: user:default/alice
        - name: group:default/admins
```

The RBAC plugin also enables you to grant users the title of 'super user,' which provides them with unrestricted access throughout the Backstage instance.

You can specify the super users in your application configuration as follows:

```YAML
permission:
  enabled: true
  rbac:
    admin:
      superUsers:
        - name: user:default/alice
        - name: user:default/mike
```

For more information on the available API endpoints accessible to the policy administrators, refer to the [API documentation](./docs/apis.md).

### Configure plugins with permission

In order for the RBAC UI to display available permissions provided by installed plugins, add the corresponding
plugin IDs to the `app-config.yaml`.

You can specify the plugins with permission in your application configuration as follows:

```YAML
permission:
  enabled: true
  rbac:
    pluginsWithPermission:
      - catalog
      - scaffolder
      - permission
    admin:
      users:
        - name: user:default/alice
        - name: group:default/admins
```

For more information on the available permissions, refer to the [RBAC permissions documentation](./docs/permissions.md).

### Configuring policies via file

The RBAC plugin also allows you to import policies from an external file. These policies are defined in the [Casbin rules format](https://casbin.org/docs/category/the-basics), known for its simplicity and clarity. For a quick start, please refer to the format details in the provided link.

Here's an example of an external permission policies configuration file named `rbac-policy.csv`:

```CSV
p, role:default/team_a, catalog-entity, read, deny
p, role:default/team_b, catalog.entity.create, create, deny

g, user:default/bob, role:default/team_a

g, group:default/team_b, role:default/team_b
```

---

**NOTE**: When you add a role in the permission policies configuration file, ensure that the role is associated with at least one permission policy with the `allow` effect.

---

You can specify the path to this configuration file in your application configuration:

```YAML
permission:
  enabled: true
  rbac:
    policies-csv-file: /some/path/rbac-policy.csv
```

Also, there is an additional configuration value that allows for the reloading of the CSV file without the need to restart.

```YAML
permission:
  enabled: true
  rbac:
    policies-csv-file: /some/path/rbac-policy.csv
    policyFileReload: true
```

For more information on the available permissions, refer to the [RBAC permissions documentation](./docs/permissions.md).

We also have a fairly strict validation for permission policies and roles based on the originating role's source information, refer to the [api documentation](./docs/apis.md).

### Configuring conditional policies via file

The RBAC plugin allows you to import conditional policies from an external file. User can defined conditional policies for roles created with the help of the policies-csv-file. Conditional policies should be defined as object sequences in the YAML format.

You can specify the path to this configuration file in your application configuration:

```YAML
permission:
  enabled: true
  rbac:
    conditionalPoliciesFile: /some/path/conditional-policies.yaml
    policies-csv-file: /some/path/rbac-policy.csv
```

Also, there is an additional configuration value that allows for the reloading of the file without the need to restart.

```YAML
permission:
  enabled: true
  rbac:
    conditionalPoliciesFile: /some/path/conditional-policies.yaml
    policies-csv-file: /some/path/rbac-policy.csv
    policyFileReload: true
```

This feature supports nested conditional policies.

Example of the conditional policies file:

```yaml
---
result: CONDITIONAL
roleEntityRef: 'role:default/test'
pluginId: catalog
resourceType: catalog-entity
permissionMapping:
  - read
  - update
conditions:
  rule: IS_ENTITY_OWNER
  resourceType: catalog-entity
  params:
    claims:
      - 'group:default/team-a'
      - 'group:default/team-b'
---
result: CONDITIONAL
roleEntityRef: 'role:default/test'
pluginId: catalog
resourceType: catalog-entity
permissionMapping:
  - delete
conditions:
  rule: IS_ENTITY_OWNER
  resourceType: catalog-entity
  params:
    claims:
      - 'group:default/team-a'
```

Information about condition policies format you can find in the doc: [Conditional policies documentation](./docs/conditions.md). There is only one difference: yaml format compare to json. But yaml and json are back convertiable.

### Configuring Database Storage for policies

The RBAC plugin offers the option to store policies in a database. It supports two database storage options:

- sqlite3: Suitable for development environments.
- postgres: Recommended for production environments.

Ensure that you have already configured the database backend for your Backstage instance, as the RBAC plugin utilizes the same database configuration.

### Optional maximum depth

The RBAC plugin also includes an option max depth feature for organizations with potentially complex group hierarchy, this configuration value will ensure that the RBAC plugin will stop at a certain depth when building user graphs.

```YAML
permission:
  enabled: true
  rbac:
    maxDepth: 1
```

The maxDepth must be greater than 0 to ensure that the graphs are built correctly. Also the graph will be built with a hierarchy of 1 + maxDepth.

More information about group hierarchy can be found in the doc: [Group hierarchy](./docs/group-hierarchy.md).

### Optional RBAC provider module support

We also include the ability to create and load in RBAC backend plugin modules that can be used to make connections to third part access management tools. For more information, consult the [RBAC Providers documentation](./docs/providers.md).

### Configure default permissions

By default, users who don't have any permissions assigned won't be able to access any resources. However, you can configure default permissions that apply to such users, ensuring a minimum level of access for everyone.

#### Detailed format (multiple specific permissions):

```YAML
permission:
  enabled: true
  rbac:
    defaultUserAccess:
      enabled: true # Enable/disable the default access feature
      defaultPermissions:
        - permission: catalog-entity # Resource type
          policy: read
          effect: allow
        - permission: scaffolder.template.step.read # Permission name
          policy: read
          effect: allow
    admin:
      users:
        - name: user:default/alice
```

The detailed format allows you to specify any permission from the [permissions documentation](./docs/permissions.md), giving you fine-grained control over default access. You can use either resource types (e.g., `catalog-entity`) or permission names (e.g., `catalog.entity.read`).

Note: When `defaultUserAccess.enabled` is set to false, no default permissions will be applied, and users will need explicit permission assignments to access resources.
