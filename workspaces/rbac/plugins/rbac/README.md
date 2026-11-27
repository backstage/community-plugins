# RBAC frontend plugin for Backstage

The RBAC UI plugin offers a streamlined user interface for effectively managing permissions in your Backstage instance. It allows you to assign permissions to users and groups, empowering them to view, create, modify and delete Roles, provided they have the necessary permissions.

For local development and test commands, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## For administrators

### Installation

#### Prerequisites

Follow the RBAC backend plugin [README](../rbac-backend/README.md) to integrate rbac in your Backstage instance.

---

**NOTE**

- For non-admin users, to enable create/edit role button on Administration -> RBAC roles list page, the role associated with your user should have the following permission policies associated with it. Add the following in your permission policies configuration file:

```CSV
p, role:default/team_a, catalog-entity, read, allow
p, role:default/team_a, policy-entity, read, allow
p, role:default/team_a, policy-entity, create, allow
g, user:default/<login-id/user-name>, role:default/team_a
```

> Note: Make sure required users/groups are available in catalog as a role cannot be created without users/groups.

> Note: Even after ingesting users/groups in catalog and applying above permissions if the create/edit button is still disabled then please contact your administrator as you might be conditionally restricted from accessing the create/edit button.

### Role sources and UI editability

Each role in the Roles list shows a **Source** column that indicates where the role was created:

| Source label | Backend source  | Editable in UI |
| ------------ | --------------- | -------------- |
| Form         | `rest`          | Yes            |
| App Config   | `configuration` | No             |
| CSV          | `csv-file`      | No             |
| Legacy       | `legacy`        | No             |

**App Config**, **CSV**, and **Legacy** roles are immutable in the UI: Edit and Delete are disabled, and hovering those actions explains that the role is managed by its source. To change those roles, update the corresponding source (for example `app-config.yaml` or the CSV policy file) and redeploy. Only roles created through the REST API or the RBAC UI (**Form**) can be edited or deleted from the Roles list.

- To fetch the permissions from other plugins like `Kubernetes` and `Jenkins` in the Role Form as mentioned in the [RBAC permissions documentation](../rbac-backend/docs/permissions.md), add the following configuration in your `app-config.yaml`:

```yaml title="app-config.yaml"
permission:
  enabled: true
  rbac:
    pluginsWithPermission:
      - kubernetes
      - jenkins
    admin:
      users:
        - name: user:default/<user-name>
```

### Permissions by plugin

The RBAC page has a second tab, **Permissions by plugin**, with a read-only matrix of every role against every plugin permission. Each cell shows the decision for that role and permission: allow, deny, conditional (hover the cell to see its rules), or no policy. Roles that cannot be edited in the UI carry a lock icon naming their source.

The sidebar filters the matrix: search roles by name, check a few roles to compare only those, narrow the columns to one plugin, or keep only the rows and columns where a policy decision (allow, deny, conditional) appears. Role names link to the role's overview page.

The matrix shows conditional policies as taking precedence over basic policies, which matches the backend's default `policyDecisionPrecedence: conditional` setting. If your backend sets `policyDecisionPrecedence: basic`, the enforced decision for a cell shown as **Conditional** comes from the basic policy instead.

### Access check

The **Access check** tab explains the decisions the permission policy makes for one user. Pick a user to see:

- the user's roles, each with how the user is connected to it: a direct assignment or the group membership that grants it;
- every plugin permission with the decision the policy answers (allow, deny, or conditional) and the role or group the decision comes from. When a deny policy vetoes an allow, the denying role is shown.

A **Conditional** result is not a final answer: the owning plugin evaluates the stored conditions against a concrete resource at request time, so the access check reports the conditions without evaluating them. Super users configured under `permission.rbac.admin.superUsers` are called out, since every permission is allowed for them regardless of the policies. A user who is a super user only through a group membership is not called out, since the check runs without the user's session.

The check aggregates policies across all roles, so it requires unrestricted `policy.entity.read` access: administrators whose read access is scoped to the roles they own get a 403 from this view.

---

#### Procedure

1. Install the RBAC UI plugin executing the following command from the Backstage root directory :

   ```console
   yarn workspace app add @backstage-community/plugin-rbac
   ```

2. Add Route in `packages/app/src/App.tsx`:

   ```tsx title="packages/app/src/App.tsx"
   /* highlight-add-next-line */
   import { RbacPage } from '@backstage-community/plugin-rbac';

   <Route path="/rbac" element={<RbacPage />} />;
   ```

3. Add **Administration** Sidebar Item in `packages/app/src/components/Root/Root.tsx`:

   ```tsx title="packages/app/src/components/Root/Root.tsx"
   /* highlight-add-next-line */
   import { Administration } from '@backstage-community/plugin-rbac';

   export const Root = ({ children }: PropsWithChildren<{}>) => (
     <SidebarPage>
       <Sidebar>
         ...
         <Administration />
         ...
       </Sidebar>
     </SidebarPage>
   );
   ```

4. For users with vanilla backstage instance, would need to integrate [`Auth`](https://backstage.io/docs/auth/) in to the instance:

   - ```yaml title="app-config.yaml"
     # see https://backstage.io/docs/auth/ to learn about auth providers
     environment: development
     providers:
        # Plugin: GitHub
        github:
           development:
           clientId: ${GITHUB_BUCKET_CLIENT_ID}
           clientSecret: ${GITHUB_BUCKET_SECRET}
        # Plugin: BitBucket
        bitbucket:
           development:
           clientId: ${BIT_BUCKET_CLIENT_ID}
           clientSecret: ${BIT_BUCKET_SECRET}
        ...
     ```

   - Integrate the [`SignIn`](https://backstage.io/docs/auth/#sign-in-configuration) component to be able to sign-in to the Backstage instance.

## New Frontend System

If you're using Backstage's new frontend system, add the plugin to your app:

```tsx
// packages/app/src/App.tsx
import rbacPlugin from '@backstage-community/plugin-rbac/alpha';

export default createApp({
  features: [
    // ...other plugins
    rbacPlugin,
  ],
});
```

The plugin will automatically provide:

- RBAC at `/rbac` with all the existing features
- A "RBAC" navigation item in the sidebar

### Extensions

The following extensions are available in the plugin:

- `api:rbac`
- `api:rbac/licensed-users`
- `page:rbac`
- `nav-item:rbac`

### Configure plugins with permission

In order for the RBAC UI to display available permissions provided by installed plugins, add the corresponding
plugin IDs to the `app-config.yaml`.

You can specify the plugins with permission in your application configuration as follows:

```YAML
permission:
  enabled: true
  rbac:
    admin:
      users:
        - name: user:default/alice
        - name: group:default/admins
    pluginsWithPermission:
      - catalog
      - scaffolder
      - permission
```

For more information on the available permissions, refer to the [RBAC permissions documentation](../rbac-backend/docs/permissions.md).
