# Keycloak Configuration for LSS

This guide provides step-by-step instructions to configure Keycloak for LSS authentication and authorization.

## Prerequisites

- Keycloak server running (version 20+ recommended)
- Admin access to Keycloak
- Network connectivity between Backstage and Keycloak

## Overview

We will configure:

1. A Keycloak realm for your organization
2. A client for Backstage OIDC authentication
3. A client for MCP server token validation
4. Groups for access control
5. Users for testing

## Step 1: Create or Select a Realm

If you don't have a realm, create one:

1. Log into Keycloak Admin Console
2. Click **Create Realm**
3. Name: `demo` (or your preferred name)
4. Click **Create**

## Step 2: Create the Backstage Client

This client handles user authentication for Backstage.

### 2.1 Create the Client

1. Go to **Clients** → **Create client**
2. Configure:

| Setting     | Value          |
| ----------- | -------------- |
| Client type | OpenID Connect |
| Client ID   | `backstage`    |
| Name        | Backstage OIDC |

3. Click **Next**

### 2.2 Configure Client Settings

| Setting               | Value        |
| --------------------- | ------------ |
| Client authentication | ON           |
| Authorization         | OFF          |
| Standard flow         | ON (checked) |
| Direct access grants  | ON (checked) |

Click **Next**, then **Save**

### 2.3 Configure Access Settings

Go to the **Settings** tab:

| Setting                         | Value                     |
| ------------------------------- | ------------------------- |
| Root URL                        | `http://localhost:7007`   |
| Home URL                        | `http://localhost:7007`   |
| Valid redirect URIs             | `http://localhost:7007/*` |
| Valid post logout redirect URIs | `http://localhost:7007/*` |
| Web origins                     | `http://localhost:7007`   |

> **Note**: Replace `localhost:7007` with your Backstage URL in production.

### 2.4 Get Client Secret

1. Go to **Credentials** tab
2. Copy the **Client secret** - you'll need this for Backstage configuration

### 2.5 Add Group Mapper

To include group memberships in the JWT token:

1. Go to **Client scopes** tab
2. Click on `backstage-dedicated`
3. Go to **Mappers** tab
4. Click **Configure a new mapper**
5. Select **Group Membership**
6. Configure:

| Setting             | Value    |
| ------------------- | -------- |
| Name                | `groups` |
| Token Claim Name    | `groups` |
| Full group path     | OFF      |
| Add to ID token     | ON       |
| Add to access token | ON       |
| Add to userinfo     | ON       |

7. Click **Save**

## Step 3: Create the MCP Server Client

This client is used for MCP server token validation.

### 3.1 Create the Client

1. Go to **Clients** → **Create client**
2. Configure:

| Setting     | Value          |
| ----------- | -------------- |
| Client type | OpenID Connect |
| Client ID   | `mcp-server`   |
| Name        | MCP Server     |

3. Click **Next**

### 3.2 Configure Client Settings

| Setting                | Value |
| ---------------------- | ----- |
| Client authentication  | ON    |
| Authorization          | OFF   |
| Standard flow          | OFF   |
| Direct access grants   | OFF   |
| Service accounts roles | ON    |

Click **Save**

### 3.3 Get Client Secret

1. Go to **Credentials** tab
2. Copy the **Client secret** - needed for MCP server configuration

### 3.4 Add Audience Mapper

To ensure tokens have the correct audience for MCP:

1. Go to **Client scopes** tab for the `backstage` client
2. Click on `backstage-dedicated`
3. Go to **Mappers** tab
4. Click **Add mapper** → **By configuration**
5. Select **Audience**
6. Configure:

| Setting                  | Value                 |
| ------------------------ | --------------------- |
| Name                     | `mcp-server-audience` |
| Included Client Audience | `mcp-server`          |
| Add to ID token          | OFF                   |
| Add to access token      | ON                    |

7. Click **Save**

## Step 4: Create Groups

Create groups to control access to LSS.

### 4.1 Create agentic-chat-users Group

1. Go to **Groups** → **Create group**
2. Name: `agentic-chat-users`
3. Click **Create**

### 4.2 Create Additional Groups (Optional)

For more granular control, create additional groups:

- `agentic-chat-admins` - Full access
- `agentic-chat-readonly` - Read-only access
- `rhdh-team` - General RHDH team members

## Step 5: Create Test Users

### 5.1 Create Admin User (developer)

1. Go to **Users** → **Add user**
2. Configure:

| Setting        | Value                   |
| -------------- | ----------------------- |
| Username       | `developer`             |
| Email          | `developer@example.com` |
| Email verified | ON                      |
| First name     | Developer               |
| Last name      | User                    |

3. Click **Create**

4. Go to **Credentials** tab:

   - Click **Set password**
   - Password: `developer123`
   - Temporary: OFF
   - Click **Save**

5. Go to **Groups** tab:
   - Click **Join Group**
   - Select `agentic-chat-users`
   - Click **Join**

### 5.2 Create Restricted User (user1)

1. Go to **Users** → **Add user**
2. Configure:

| Setting        | Value               |
| -------------- | ------------------- |
| Username       | `user1`             |
| Email          | `user1@example.com` |
| Email verified | ON                  |
| First name     | User                |
| Last name      | One                 |

3. Click **Create**

4. Go to **Credentials** tab:
   - Click **Set password**
   - Password: `user1password`
   - Temporary: OFF
   - Click **Save**

> **Note**: Do NOT add `user1` to `agentic-chat-users` group. This user will be denied access.

## Step 6: Verify Configuration

### 6.1 Test Token Generation

Use the Keycloak token endpoint to verify the configuration:

```bash
# Get a token for developer user
curl -X POST \
  "https://YOUR_KEYCLOAK_URL/realms/demo/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=backstage" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=developer" \
  -d "password=developer123" \
  -d "scope=openid profile email"
```

### 6.2 Decode and Verify JWT

Decode the access token at [jwt.io](https://jwt.io) and verify:

1. **Groups claim exists**:

```json
{
  "groups": ["agentic-chat-users"]
}
```

2. **Audience includes mcp-server**:

```json
{
  "aud": ["mcp-server", "backstage"]
}
```

3. **User info is present**:

```json
{
  "preferred_username": "developer",
  "email": "developer@example.com"
}
```

### 6.3 Test Restricted User

Get a token for `user1` and verify it does NOT have the `agentic-chat-users` group:

```bash
curl -X POST \
  "https://YOUR_KEYCLOAK_URL/realms/demo/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=backstage" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=user1" \
  -d "password=user1password" \
  -d "scope=openid profile email"
```

The token should either have no `groups` claim or an empty array.

## Summary of Created Resources

| Resource Type | Name                  | Purpose                       |
| ------------- | --------------------- | ----------------------------- |
| Realm         | `demo`                | Organization realm            |
| Client        | `backstage`           | Backstage OIDC authentication |
| Client        | `mcp-server`          | MCP server token validation   |
| Group         | `agentic-chat-users`  | Access to Agentic Chat        |
| User          | `developer`           | Test user with access         |
| User          | `user1`               | Test user without access      |
| Mapper        | `groups`              | Include groups in JWT         |
| Mapper        | `mcp-server-audience` | Add audience claim            |

## Configuration Values for Next Steps

Save these values for Backstage and MCP configuration:

```yaml
# Values from Keycloak setup
keycloak:
  realm: demo
  url: https://YOUR_KEYCLOAK_URL
  backstage_client_id: backstage
  backstage_client_secret: YOUR_BACKSTAGE_CLIENT_SECRET
  mcp_client_id: mcp-server
  mcp_client_secret: YOUR_MCP_CLIENT_SECRET
```

## Next Steps

- [Configure Backstage RBAC](./BACKSTAGE_RBAC_SETUP.md)
- [Configure MCP Server](./MCP_SERVER_SETUP.md)

## Troubleshooting

### Groups Not Appearing in Token

1. Verify the Group Mapper is configured on the `backstage-dedicated` scope
2. Check that `Add to access token` is enabled
3. Verify the user is actually in the group

### Audience Claim Missing

1. Verify the Audience Mapper is configured
2. Check that `mcp-server` client exists
3. Verify `Add to access token` is enabled

### Token Validation Fails

1. Check the Keycloak realm URL is correct
2. Verify the client secret matches
3. Check for clock skew between servers

### CORS Errors

1. Verify `Web origins` is set correctly on the client
2. Add your Backstage URL to allowed origins
3. Check for trailing slashes in URLs
