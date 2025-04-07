# Multitenancy

The RBAC backend plugin has support for multitenancy through the use of its own conditional rule `IS_OWNER`. This rule will allow users the ability to perform actions against roles and permissions in which they are an owner. An example where this conditional rule could be helpful is where admins would like to grant team leads the ability to manage their own roles and permissions for their team.

## Conditional rule

```yaml
  {
    "pluginId": "permission",
    "rules": [
      {
        "name": "IS_OWNER",
        "description": "Should allow access to RBAC roles and Permissions through ownership",
        "resourceType": "policy-entity",
        "paramsSchema": {
          "type": "object",
          "properties": {
            "owners": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "List of entity refs to match against"
            }
          },
          "required": [
            "owners"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        }
      }
    ]
  },
```

## Example

### Admin

The following can be used as an example on how to set up multitenancy from the admin's point of view. In this example, we are going to create a role, assign a user, and assign the `catalog.entity.read` permission as well as a conditional policy for permission policies and roles.

1. Create a new role for the team lead:

   ```bash
   curl -X POST 'http://localhost:7007/api/permission/roles' \
   --header "Authorization: Bearer $ADMIN_TOKEN" \
   --header "Content-Type: application/json" \
   --data '{
     "memberReferences": ["user:default/team_lead"],
     "name": "role:default/team_lead",
     "metadata": {
       "description": "This is an example team lead role"
     }
   }'
   ```

2. Create a permission policy to grant the team lead read access to the catalog and create access to the RBAC backend plugin:

   ```bash
   curl -X POST 'http://localhost:7007/api/permission/policies' \
   --header "Authorization: Bearer $ADMIN_TOKEN" \
   --header "Content-Type: application/json" \
   --data '[
     {
       "entityReference": "role:default/team_lead",
       "permission": "policy-entity",
       "policy": "create",
       "effect": "allow"
     },
     {
       "entityReference": "role:default/team_lead",
       "permission": "catalog-entity",
       "policy": "read",
       "effect": "allow"
     }
   ]'
   ```

3. Create a conditional policy to grant the team lead access to the RBAC backend plugin:

   ```bash
   curl -X POST 'http://localhost:7007/api/permission/roles/conditions' \
   --header "Authorization: Bearer $ADMIN_TOKEN" \
   --header "Content-Type: application/json" \
   --data '{
    "result": "CONDITIONAL",
    "pluginId": "permission",
    "resourceType": "policy-entity",
    "conditions": {
      "rule": "IS_OWNER",
      "resourceType": "policy-entity",
      "params": {
        "owners": [
          "user:default/team_lead"
        ]
      }
    },
    "roleEntityRef": "role:default/team_lead",
    "permissionMapping": [
      "read",
      "update",
      "delete"
    ]
   }'
   ```

### Team Lead

The following is an example from the team lead's point of view after they have been granted conditional access to the RBAC backend plugin. In this example:

- We will check that we are unable to see any roles prior to performing any actions.
- Create a role, assign a user, and assign the `catalog.entity.read` permission.
- And finally check that we are able to read the new role and permission policy after creation.

1. Query the roles to see that we are unable to see any other roles:

   ```bash
   curl -X GET 'http://localhost:7007/api/permission/roles' \
   --header "Authorization: Bearer $TEAM_LEAD_TOKEN"
   ```

2. Query the permission policies to see that we are unable to see any other policies:

   ```bash
   curl -X GET 'http://localhost:7007/api/permission/policies' \
   --header "Authorization: Bearer $TEAM_LEAD_TOKEN"
   ```

3. Create a new role for your team, ensuring you set yourself as the owner:

   **NOTE**: Setting yourself the owner of the role is required as this is not done automatically for you. Missing this step will result in the inability to query this role.

   ```bash
   curl -X POST 'http://localhost:7007/api/permission/roles' \
   --header "Authorization: Bearer $TEAM_LEAD_TOKEN" \
   --header "Content-Type: application/json" \
   --data '{
     "memberReferences": ["user:default/team_member"],
     "name": "role:default/team_a",
     "metadata": {
       "description": "This is an example team_a role",
       "owner": "user:default/team_lead"
     }
   }'
   ```

4. Create a permission policy for your new role:

   ```bash
   curl -X POST 'http://localhost:7007/api/permission/policies' \
   --header "Authorization: Bearer $ADMIN_TOKEN" \
   --header "Content-Type: application/json" \
   --data '[
     {
       "entityReference": "role:default/team_a",
       "permission": "catalog-entity",
       "policy": "read",
       "effect": "allow"
     }
   ]'
   ```

5. Re-query the roles to see our new created role:

   ```bash
   curl -X GET 'http://localhost:7007/api/permission/roles' \
   --header "Authorization: Bearer $TEAM_LEAD_TOKEN"
   ```

6. Re-query the permission policies to see our new created policy:

   ```bash
   curl -X GET 'http://localhost:7007/api/permission/policies' \
   --header "Authorization: Bearer $TEAM_LEAD_TOKEN"
   ```
