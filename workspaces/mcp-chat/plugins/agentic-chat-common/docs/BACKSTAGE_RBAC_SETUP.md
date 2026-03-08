# Backstage RBAC Configuration for LSS

This guide explains how to configure Backstage RBAC to control access to the LSS plugin based on Keycloak groups.

## Prerequisites

- Keycloak configured as per [Keycloak Setup Guide](./KEYCLOAK_SETUP.md)
- Backstage with RBAC plugin installed (included in RHDH)
- `@backstage/plugin-permission-backend` configured

## Overview

Backstage RBAC allows you to:

1. Map Keycloak groups to Backstage roles
2. Assign permissions to roles
3. Control access to LSS based on group membership

## Step 1: Configure Keycloak Authentication

Add OIDC authentication to your `app-config.yaml`:

```yaml
auth:
  environment: development
  providers:
    oidc:
      development:
        metadataUrl: https://YOUR_KEYCLOAK_URL/realms/demo/.well-known/openid-configuration
        clientId: backstage
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}
        prompt: auto
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityProfileEmail
```

### Environment Variable

Set the client secret as an environment variable:

```bash
export KEYCLOAK_CLIENT_SECRET="your-backstage-client-secret"
```

## Step 2: Configure Catalog User/Group Sync

To have users and groups available for RBAC, you can either:

### Option A: Use Keycloak Entity Provider (Recommended)

```yaml
catalog:
  providers:
    keycloakOrg:
      default:
        baseUrl: https://YOUR_KEYCLOAK_URL
        loginRealm: master
        realm: demo
        clientId: backstage
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 3 }
```

### Option B: Define Entities Manually

Create `users-and-groups.yaml`:

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Group
metadata:
  name: agentic-chat-users
  namespace: default
  description: Users with access to LSS
spec:
  type: team
  children: []
---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: developer
  namespace: default
spec:
  profile:
    displayName: Developer User
    email: developer@example.com
  memberOf:
    - agentic-chat-users
---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: user1
  namespace: default
spec:
  profile:
    displayName: User One
    email: user1@example.com
  memberOf: []
```

Add to catalog locations:

```yaml
catalog:
  locations:
    - type: file
      target: ./users-and-groups.yaml
      rules:
        - allow: [User, Group]
```

## Step 3: Enable Permission Framework

Configure the permission backend in `app-config.yaml`:

```yaml
permission:
  enabled: true
```

## Step 4: Configure RBAC Policies

### Option A: Inline Policies (Simple)

For simple setups, define policies inline:

```yaml
permission:
  enabled: true
  rbac:
    policies:
      # Map Keycloak group to Backstage role
      - g, group:default/agentic-chat-users, role:default/agentic-chat-user

      # Grant LSS access to the role
      - p, role:default/agentic-chat-user, agenticChat.access, read, allow

      # Optional: Admin role with full access
      - g, group:default/agentic-chat-admins, role:default/agentic-chat-admin
      - p, role:default/agentic-chat-admin, agenticChat.access, read, allow
```

### Option B: CSV File (Recommended for Production)

For larger deployments, use a CSV file:

**app-config.yaml:**

```yaml
permission:
  enabled: true
  rbac:
    policies-csv-file: /path/to/rbac-policy.csv
    admin:
      users:
        - name: user:default/admin
```

**rbac-policy.csv:**

```csv
# Group to Role mappings
g, group:default/agentic-chat-users, role:default/agentic-chat-user
g, group:default/agentic-chat-admins, role:default/agentic-chat-admin
g, group:default/rhdh-team, role:default/agentic-chat-user

# Permission grants
p, role:default/agentic-chat-user, agenticChat.access, read, allow
p, role:default/agentic-chat-admin, agenticChat.access, read, allow

# Default deny for users not in any group (implicit)
```

## Step 5: Understand the Permission

LSS uses a single permission:

| Permission           | Resource Type | Action | Description                          |
| -------------------- | ------------- | ------ | ------------------------------------ |
| `agenticChat.access` | (none)        | read   | Controls access to the entire plugin |

This is an "all or nothing" permission:

- If ALLOW → User has full access to LSS
- If DENY → User cannot access any LSS features

## Step 6: Policy Syntax Reference

### Group Mappings (g)

```csv
g, <entity_reference>, <role>
```

Examples:

```csv
# User to role
g, user:default/alice, role:default/agentic-chat-user

# Group to role
g, group:default/agentic-chat-users, role:default/agentic-chat-user

# Nested roles (role inheritance)
g, role:default/agentic-chat-admin, role:default/agentic-chat-user
```

### Permission Policies (p)

```csv
p, <role>, <permission>, <action>, <effect>
```

Examples:

```csv
# Allow read access
p, role:default/agentic-chat-user, agenticChat.access, read, allow

# Deny access (explicit)
p, role:default/restricted-user, agenticChat.access, read, deny
```

## Step 7: Verify Configuration

### 7.1 Check User Groups in Backstage

1. Navigate to Backstage catalog
2. Search for `kind:user`
3. Click on a user and verify their group memberships

### 7.2 Test Permission Evaluation

Use the Backstage permission API to test:

```bash
# With Backstage running, test permission for a user token
curl -X POST http://localhost:7007/api/permission/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "items": [
      {
        "permission": {
          "type": "basic",
          "name": "agenticChat.access",
          "attributes": { "action": "read" }
        }
      }
    ]
  }'
```

Expected responses:

- Allowed user: `{"items":[{"result":"ALLOW"}]}`
- Denied user: `{"items":[{"result":"DENY"}]}`

### 7.3 View Permission Logs

Look for permission evaluation logs:

```bash
# In Backstage logs
grep "permission-evaluation" /path/to/backstage.log
```

Example log output:

```
permission info permission.permission-evaluation
  meta={"userEntityRef":"user:default/developer","permissionName":"agenticChat.access","result":"ALLOW"}
```

## Complete Configuration Example

Here's a complete `app-config.yaml` section:

```yaml
auth:
  environment: development
  providers:
    oidc:
      development:
        metadataUrl: https://keycloak.example.com/realms/demo/.well-known/openid-configuration
        clientId: backstage
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}
        prompt: auto
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityProfileEmail

catalog:
  providers:
    keycloakOrg:
      default:
        baseUrl: https://keycloak.example.com
        loginRealm: master
        realm: demo
        clientId: backstage
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}

permission:
  enabled: true
  rbac:
    policies:
      # LSS access control
      - g, group:default/agentic-chat-users, role:default/agentic-chat-user
      - p, role:default/agentic-chat-user, agenticChat.access, read, allow

      # Catalog read access for all authenticated users
      - p, role:default/agentic-chat-user, catalog.entity.read, read, allow
```

## How It Works at Runtime

1. **User logs in** via Keycloak OIDC
2. **Backstage receives JWT** with groups claim
3. **User entity resolved** via email matching
4. **User's groups determined** from entity or JWT claims
5. **Permission check requested** for `agenticChat.access`
6. **RBAC policy evaluated**:
   - Is user in `group:default/agentic-chat-users`?
   - If yes → user has `role:default/agentic-chat-user`
   - Does role have `agenticChat.access` permission?
   - If yes → ALLOW
   - Otherwise → DENY

## Frontend Behavior

The LSS frontend uses a `ConditionalPermissionWrapper` that respects the security mode:

```tsx
// In 'none' mode - no permission check, content renders directly
// In 'plugin-only' or 'full' mode - uses RequirePermission

<ConditionalPermissionWrapper>
  {/* Main content */}
</ConditionalPermissionWrapper>
```

The wrapper fetches the `securityMode` from the backend `/status` endpoint:

- **`none` mode**: Content renders directly, no permission check
- **`plugin-only` / `full` mode**: Uses `RequirePermission` to enforce RBAC

Denied users see: "You do not have the necessary permissions to access LSS"

## Backend Behavior

All LSS API endpoints are protected:

```typescript
// Middleware in router.ts
const requirePluginAccess: express.RequestHandler = async (req, res, next) => {
  const decision = await permissions.authorize(
    [{ permission: agenticChatAccessPermission }],
    { credentials },
  );

  if (decision.result === AuthorizeResult.DENY) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  next();
};
```

- Denied users receive: `403 Forbidden`
- Response includes: `{"error":"You don't have permission to access LSS"}`

## Troubleshooting

### User Gets Access Denied Despite Being in Group

1. **Check entity sync**: Is the user's group membership in Backstage catalog?

   ```bash
   curl http://localhost:7007/api/catalog/entities?filter=kind=user,metadata.name=developer
   ```

2. **Check group name format**: Must match `group:default/GROUP_NAME`

3. **Check policy syntax**: Ensure no typos in CSV file

### Permission Not Registered

If you see "Unknown permission" errors:

1. Verify agentic-chat-backend is loaded
2. Check backend logs for permission registration:
   ```
   Registered agenticChat.access permission for plugin-level access control
   ```

### Keycloak Groups Not Syncing

1. Verify Group Mapper is configured in Keycloak
2. Check if groups appear in JWT token
3. Verify `keycloakOrg` provider is configured and running

## Next Steps

- [Configure MCP Server](./MCP_SERVER_SETUP.md)
- [Validation Guide](./VALIDATION.md)
