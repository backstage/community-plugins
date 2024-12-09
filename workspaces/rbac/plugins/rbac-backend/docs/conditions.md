# Conditional Permission Policies

The Backstage permission framework provides conditions, and the RBAC backend plugin supports this feature. Conditions work like content filters for Backstage resources (provided by plugins). The RBAC backend API stores conditions assigned to the role in the database. When a user requests access to the frontend resources, the RBAC backend API searches for corresponding conditions and delegates the condition for this resource to the corresponding plugin by its plugin ID. If a user was assigned to multiple roles, and each of these roles contains its own condition, the RBAC backend merges conditions using the anyOf criteria.

The corresponding plugin analyzes conditional parameters and makes a decision about which part of the content the user should see. Consequently, the user can view not all resource content but only some allowed parts. The RBAC backend plugin supports conditions bounded to the RBAC role.

A Backstage condition can be a simple condition with a rule and parameters. But also a Backstage condition could consists of a parameter or an array of parameters joined by criteria. The list of supported conditional criteria includes:

- allOf
- anyOf
- not

The plugin defines the supported condition parameters. API users can retrieve the conditional object schema from the RBAC API endpoint to determine how to build a condition JSON object and utilize it through the RBAC backend plugin API.

The structure of the condition JSON object is as follows:

| Json field        | Description                                                           | Type         |
| ----------------- | --------------------------------------------------------------------- | ------------ |
| result            | Always has the value "CONDITIONAL"                                    | String       |
| roleEntityRef     | String entity reference to the RBAC role ('role:default/dev')         | String       |
| pluginId          | Corresponding plugin ID (e.g., "catalog")                             | String       |
| permissionMapping | Array permission actions (['read', 'update', 'delete'])               | String array |
| resourceType      | Resource type provided by the plugin (e.g., "catalog-entity")         | String       |
| conditions        | Condition JSON with parameters or array parameters joined by criteria | JSON         |

To get the available conditional rules that can be used to create conditional permission policies, use the GET API request `api/permission/plugins/condition-rules` as seen below.

GET <api/permission/plugins/condition-rules>

Provides condition parameters schemas.

```json
[
   {
      "pluginId": "catalog",
      "rules": [
         {
            "name": "HAS_ANNOTATION",
            "description": "Allow entities with the specified annotation",
            "resourceType": "catalog-entity",
            "paramsSchema": {
               "type": "object",
               "properties": {
                  "annotation": {
                     "type": "string",
                     "description": "Name of the annotation to match on"
                  },
                  "value": {
                     "type": "string",
                     "description": "Value of the annotation to match on"
                  }
               },
               "required": [
                  "annotation"
               ],
               "additionalProperties": false,
               "$schema": "http://json-schema.org/draft-07/schema#"
            }
         },
         {
            "name": "HAS_LABEL",
            "description": "Allow entities with the specified label",
            "resourceType": "catalog-entity",
            "paramsSchema": {
               "type": "object",
               "properties": {
                  "label": {
                     "type": "string",
                     "description": "Name of the label to match on"
                  }
               },
               "required": [
                  "label"
               ],
               "additionalProperties": false,
               "$schema": "http://json-schema.org/draft-07/schema#"
            }
         },
         {
            "name": "HAS_METADATA",
            "description": "Allow entities with the specified metadata subfield",
            "resourceType": "catalog-entity",
            "paramsSchema": {
               "type": "object",
               "properties": {
                  "key": {
                     "type": "string",
                     "description": "Property within the entities metadata to match on"
                  },
                  "value": {
                     "type": "string",
                     "description": "Value of the given property to match on"
                  }
               },
               "required": [
                  "key"
               ],
               "additionalProperties": false,
               "$schema": "http://json-schema.org/draft-07/schema#"
            }
         },
         {
            "name": "HAS_SPEC",
            "description": "Allow entities with the specified spec subfield",
            "resourceType": "catalog-entity",
            "paramsSchema": {
               "type": "object",
               "properties": {
                  "key": {
                     "type": "string",
                     "description": "Property within the entities spec to match on"
                  },
                  "value": {
                     "type": "string",
                     "description": "Value of the given property to match on"
                  }
               },
               "required": [
                  "key"
               ],
               "additionalProperties": false,
               "$schema": "http://json-schema.org/draft-07/schema#"
            }
         },
         {
            "name": "IS_ENTITY_KIND",
            "description": "Allow entities matching a specified kind",
            "resourceType": "catalog-entity",
            "paramsSchema": {
               "type": "object",
               "properties": {
                  "kinds": {
                     "type": "array",
                     "items": {
                        "type": "string"
                     },
                     "description": "List of kinds to match at least one of"
                  }
               },
               "required": [
                  "kinds"
               ],
               "additionalProperties": false,
               "$schema": "http://json-schema.org/draft-07/schema#"
            }
         },
         {
            "name": "IS_ENTITY_OWNER",
            "description": "Allow entities owned by a specified claim",
            "resourceType": "catalog-entity",
            "paramsSchema": {
               "type": "object",
               "properties": {
                  "claims": {
                     "type": "array",
                     "items": {
                        "type": "string"
                     },
                     "description": "List of claims to match at least one on within ownedBy"
                  }
               },
               "required": [
                  "claims"
               ],
               "additionalProperties": false,
               "$schema": "http://json-schema.org/draft-07/schema#"
            }
         }
      ]
   }
   ... <another plugin condition parameter schemas>
]
```

From this condition schema, the RBAC backend API user can determine how to build a condition JSON object.

For example, consider a condition without criteria: displaying catalogs only if the user is a member of the owner group. The Catalog plugin schema "IS_ENTITY_OWNER" can be utilized to achieve this goal. To construct the condition JSON object based on this schema, the following information should be used:

- rule: the parameter name is "IS_ENTITY_OWNER" in this case
- resourceType: "catalog-entity"
- criteria: in this example, criteria are not used since we need to use only one conditional parameter
- params: from the schema, it is evident that it should be an object named "claims" with a string array. This string array constitutes a list of user or group string entity references.

Based on the above schema condition is:

```json
{
  "rule": "IS_ENTITY_OWNER",
  "resourceType": "catalog-entity",
  "params": {
    "claims": ["group:default/team-a"]
  }
}
```

To utilize this condition to the RBAC REST api you need to wrap it with more info

```json
{
  "result": "CONDITIONAL",
  "roleEntityRef": "role:default/test",
  "pluginId": "catalog",
  "resourceType": "catalog-entity",
  "permissionMapping": ["read"],
  "conditions": {
    "rule": "IS_ENTITY_OWNER",
    "resourceType": "catalog-entity",
    "params": {
      "claims": ["group:default/team-a"]
    }
  }
}
```

**Example condition with criteria**: display catalogs only if user is a member of owner group "OR" display list of all catalog user groups.

We can reuse previous condition parameter to display catalogs only for owner. Also we can use one more condition "IS_ENTITY_KIND" to display catalog groups for any user:

- rule - the parameter name is "IS_ENTITY_KIND" in this case.
- resource type: "catalog-entity".
- criteria - "anyOf".
- params - from the schema, it is evident that it should be an object named "kinds" with string array. This string array is a list of catalog kinds. It should be array with single element "Group" in our case.

Based on the above schema:

```json
{
  "anyOf": [
    {
      "rule": "IS_ENTITY_OWNER",
      "resourceType": "catalog-entity",
      "params": {
        "claims": ["group:default/team-a"]
      }
    },
    {
      "rule": "IS_ENTITY_KIND",
      "resourceType": "catalog-entity",
      "params": {
        "kinds": ["Group"]
      }
    }
  ]
}
```

To utilize this condition to the RBAC REST api you need to wrap it with more info:

```json
{
  "result": "CONDITIONAL",
  "roleEntityRef": "role:default/test",
  "pluginId": "catalog",
  "resourceType": "catalog-entity",
  "permissionMapping": ["read"],
  "conditions": {
    "anyOf": [
      {
        "rule": "IS_ENTITY_OWNER",
        "resourceType": "catalog-entity",
        "params": {
          "claims": ["group:default/team-a"]
        }
      },
      {
        "rule": "IS_ENTITY_KIND",
        "resourceType": "catalog-entity",
        "params": {
          "kinds": ["Group"]
        }
      }
    ]
  }
}
```

## Conditional Policy Aliases

The RBAC-backend plugin allows for the use of aliases in the conditional policy rule parameters. These aliases are dynamically replaced with corresponding values during the policy evaluation process. Each alias is prefixed with a `$` sign to denote its special function.

### Supported Aliases

1. **`$currentUser`**:

   - **Description**: This alias is replaced with the user entity reference for the user currently requesting access to the resource.
   - **Example**: If the user "Tom" from the "default" namespace is requesting access, `$currentUser` will be replaced with `user:default/tom`.

2. **`$ownerRefs`**:
   - **Description**: This alias is replaced with ownership references, typically in the form of an array. The array usually contains the user entity reference and the user's parent group entity reference.
   - **Example**: For a user "Tom" who belongs to "team-a", `$ownerRefs` will be replaced with `['user:default/tom', 'group:default/team-a']`.

### Example of a Conditional Policy Object with Alias

This condition should allow members of the `role:default/developer` to delete only their own catalogs and no others:

```json
{
  "result": "CONDITIONAL",
  "roleEntityRef": "role:default/developer",
  "pluginId": "catalog",
  "resourceType": "catalog-entity",
  "permissionMapping": ["delete"],
  "conditions": {
    "rule": "IS_ENTITY_OWNER",
    "resourceType": "catalog-entity",
    "params": {
      "claims": ["$currentUser"]
    }
  }
}
```

## Examples of Conditional Policies

Below are a few examples that can be used on some of the Janus IDP plugins. These can help in determining how based to define conditional policies

### Keycloak plugin

```json
{
  "result": "CONDITIONAL",
  "roleEntityRef": "role:default/developer",
  "pluginId": "catalog",
  "resourceType": "catalog-entity",
  "permissionMapping": ["update", "delete"],
  "conditions": {
    "not": {
      "rule": "HAS_ANNOTATION",
      "resourceType": "catalog-entity",
      "params": { "annotation": "keycloak.org/realm", "value": "<YOUR_REALM>" }
    }
  }
}
```

This example will prevent users in the role `role:default/developer` from updating or deleting users that ingested into the catalog from the Keycloak plugin.

Notice the use of the annotation `keycloak.org/realm` requires the value of `<YOUR_REALM>`

### Quay Actions

```json
{
  "result": "CONDITIONAL",
  "roleEntityRef": "role:default/developer",
  "pluginId": "scaffolder",
  "resourceType": "scaffolder-action",
  "permissionMapping": ["use"],
  "conditions": {
    "not": {
      "rule": "HAS_ACTION_ID",
      "resourceType": "scaffolder-action",
      "params": { "actionId": "quay:create-repository" }
    }
  }
}
```

This example will prevent users from using the Quay scaffolder action if they are a part of the role `role:default/developer`.

Notice, we use the `permissionMapping` field with `use`. This is because the `scaffolder-action` resource type permission does not have a permission policy. More information can be found in our documentation on [permissions](./permissions.md).

**NOTE**: We do not support the ability to run conditions in parallel during creation. An example can be found below, notice that `anyOf` and `not` are on the same level. Consider making separate condition requests, or nest your conditions based on the available criteria.

```json
{
  "anyOf": [
    {
      "rule": "IS_ENTITY_OWNER",
      "resourceType": "catalog-entity",
      "params": {
        "claims": ["group:default/team-a"]
      }
    },
    {
      "rule": "IS_ENTITY_KIND",
      "resourceType": "catalog-entity",
      "params": {
        "kinds": ["Group"]
      }
    }
  ],
  "not": {
    "rule": "IS_ENTITY_KIND",
    "resourceType": "catalog-entity",
    "params": { "kinds": ["Api"] }
  }
}
```
