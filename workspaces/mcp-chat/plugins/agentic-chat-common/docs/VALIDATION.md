# Validation Guide

This guide provides step-by-step instructions to validate that your Keycloak + Backstage RBAC + MCP Server security configuration is working correctly.

## Security Mode

This guide assumes you're using **`plugin-only`** security mode (the default and recommended mode). See [SECURITY_MODES.md](./SECURITY_MODES.md) for other modes.

| Mode          | This Validation Applies?       |
| ------------- | ------------------------------ |
| `none`        | ❌ No auth, all access allowed |
| `plugin-only` | ✅ Yes - this guide            |
| `full`        | ✅ Yes, plus MCP OAuth testing |

## Prerequisites

Before running these tests, ensure you have completed:

- [Keycloak Setup](./KEYCLOAK_SETUP.md)
- [Backstage RBAC Setup](./BACKSTAGE_RBAC_SETUP.md)
- [MCP Server Setup](./MCP_SERVER_SETUP.md) (optional for `plugin-only` mode)

## Test Users

For these tests, you should have:

| User      | Password      | Groups             | Expected Access |
| --------- | ------------- | ------------------ | --------------- |
| developer | developer123  | agentic-chat-users | ✅ Full Access  |
| user1     | user1password | (none)             | ❌ Denied       |

## Test 1: Keycloak Token Generation

### 1.1 Get Token for Authorized User

```bash
# Set your Keycloak URL
KEYCLOAK_URL="https://YOUR_KEYCLOAK_URL"
REALM="demo"
CLIENT_ID="backstage"
CLIENT_SECRET="YOUR_CLIENT_SECRET"

# Get token for developer (authorized user)
DEVELOPER_TOKEN=$(curl -s -X POST \
  "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "username=developer" \
  -d "password=developer123" \
  -d "scope=openid profile email" | jq -r '.access_token')

echo "Developer token obtained: ${DEVELOPER_TOKEN:0:50}..."
```

**Expected**: Token is returned (not null or error)

### 1.2 Verify Token Claims

```bash
# Decode token (without verification) to check claims
echo $DEVELOPER_TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .
```

**Expected Output**:

```json
{
  "exp": 1702800000,
  "iat": 1702796400,
  "aud": ["mcp-server", "backstage"],
  "sub": "user-uuid",
  "preferred_username": "developer",
  "email": "developer@example.com",
  "groups": ["agentic-chat-users"]
}
```

**Verify**:

- [ ] `groups` contains `agentic-chat-users`
- [ ] `aud` contains `mcp-server`
- [ ] `preferred_username` is `developer`

### 1.3 Get Token for Unauthorized User

```bash
# Get token for user1 (unauthorized user)
USER1_TOKEN=$(curl -s -X POST \
  "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "username=user1" \
  -d "password=user1password" \
  -d "scope=openid profile email" | jq -r '.access_token')

# Decode and check groups
echo $USER1_TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.groups'
```

**Expected**: `null` or `[]` (no groups)

## Test 2: Backstage RBAC Permission Evaluation

### 2.1 Start Backstage

Ensure Backstage is running with RBAC enabled:

```bash
cd /path/to/backstage
yarn dev
```

### 2.2 Test Permission API for Authorized User

```bash
BACKSTAGE_URL="http://localhost:7007"

# Test permission for developer
curl -s -X POST "${BACKSTAGE_URL}/api/permission/authorize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEVELOPER_TOKEN}" \
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
  }' | jq .
```

**Expected**:

```json
{
  "items": [
    {
      "result": "ALLOW"
    }
  ]
}
```

### 2.3 Test Permission API for Unauthorized User

```bash
# Test permission for user1
curl -s -X POST "${BACKSTAGE_URL}/api/permission/authorize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER1_TOKEN}" \
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
  }' | jq .
```

**Expected**:

```json
{
  "items": [
    {
      "result": "DENY"
    }
  ]
}
```

### 2.4 Check Backstage Logs

Look for permission evaluation in logs:

```bash
# Grep for permission logs
grep "permission.permission-evaluation" /path/to/backstage.log | tail -10
```

**Expected Log Entries**:

```
permission info permission.permission-evaluation
  meta={"userEntityRef":"user:default/developer","permissionName":"agenticChat.access","result":"ALLOW"}

permission info permission.permission-evaluation
  meta={"userEntityRef":"user:default/user1","permissionName":"agenticChat.access","result":"DENY"}
```

## Test 3: LSS Backend API

### 3.1 Test Health Endpoint (No Auth Required)

```bash
curl -s "${BACKSTAGE_URL}/api/agentic-chat/health" | jq .
```

**Expected**:

```json
{
  "status": "ok"
}
```

### 3.2 Test Protected Endpoint with Authorized User

```bash
# Test workflows endpoint (requires auth)
curl -s "${BACKSTAGE_URL}/api/agentic-chat/workflows" \
  -H "Authorization: Bearer ${DEVELOPER_TOKEN}" | jq .
```

**Expected**: Valid response (workflows data or empty array)

### 3.3 Test Protected Endpoint with Unauthorized User

```bash
# Test workflows endpoint with unauthorized user
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "${BACKSTAGE_URL}/api/agentic-chat/workflows" \
  -H "Authorization: Bearer ${USER1_TOKEN}" | jq .
```

**Expected**:

```json
{
  "error": {
    "name": "NotAllowedError",
    "message": "You don't have permission to access LSS"
  }
}
HTTP Status: 403
```

### 3.4 Test All Protected Endpoints

```bash
# Test all protected endpoints for unauthorized user
for endpoint in workflows swim-lanes quick-actions status documents; do
  echo "Testing /api/agentic-chat/${endpoint}:"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "${BACKSTAGE_URL}/api/agentic-chat/${endpoint}" \
    -H "Authorization: Bearer ${USER1_TOKEN}")
  echo "  Status: ${HTTP_CODE}"
done
```

**Expected**: All endpoints return 403

## Test 4: MCP Server Token Validation

### 4.1 Test MCP Health (If Available)

```bash
MCP_URL="http://localhost:8080"

curl -s "${MCP_URL}/health" 2>/dev/null || echo "Health endpoint not available"
```

### 4.2 Test MCP Without Token

```bash
curl -s -w "\nHTTP Status: %{http_code}\n" "${MCP_URL}/sse"
```

**Expected**: `401 Unauthorized`

### 4.3 Test MCP With Valid Token

```bash
curl -s -H "Authorization: Bearer ${DEVELOPER_TOKEN}" "${MCP_URL}/sse" &
MCP_PID=$!
sleep 2
kill $MCP_PID 2>/dev/null

echo "Connection established successfully if no errors above"
```

**Expected**: Connection establishes (no 401 error)

### 4.4 Test MCP With Invalid Token

```bash
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer invalid-token" \
  "${MCP_URL}/sse"
```

**Expected**: `401 Unauthorized`

## Test 5: End-to-End UI Testing

### 5.1 Login as Authorized User (developer)

1. Open Backstage: http://localhost:7007
2. Click "Sign In"
3. Select Keycloak/OIDC provider
4. Login with:
   - Username: `developer`
   - Password: `developer123`
5. Navigate to LSS

**Expected**:

- [ ] Login succeeds
- [ ] LSS page loads
- [ ] Workflows display (or empty state)
- [ ] Chat interface is available
- [ ] No "Access Denied" errors

### 5.2 Login as Unauthorized User (user1)

1. Log out from Backstage
2. Click "Sign In"
3. Login with:
   - Username: `user1`
   - Password: `user1password`
4. Navigate to LSS

**Expected**:

- [ ] Login succeeds
- [ ] LSS shows "Access Denied" page
- [ ] Message: "You do not have the necessary permissions to access LSS"
- [ ] No workflows or chat visible

### 5.3 Check Browser Network Tab

For unauthorized user:

1. Open Developer Tools (F12)
2. Go to Network tab
3. Navigate to LSS
4. Check API calls

**Expected**:

- `/api/agentic-chat/workflows` returns 403
- `/api/agentic-chat/swim-lanes` returns 403
- All other endpoints return 403

## Test 6: MCP Tool Restrictions

### 6.1 Check Available Tools (Read-Only Mode)

If MCP is configured with `read_only = true`:

1. Login as authorized user
2. Open LSS Chat
3. Ask: "What tools are available?"

**Expected Tools** (read-only):

- list_resources
- get_resource
- get_pod_logs
- get_events
- list_api_resources

**Should NOT see**:

- apply_resource
- delete_resource
- patch_resource

### 6.2 Test Resource Blocking

If `denied_resources` includes Secrets:

1. Login as authorized user
2. Open LSS Chat
3. Ask: "List all secrets in default namespace"

**Expected**: Error or empty response indicating secrets are blocked

## Validation Checklist

### Keycloak

- [ ] Token generation works for all test users
- [ ] Groups claim present in developer token
- [ ] Audience claim includes mcp-server
- [ ] user1 token has no groups

### Backstage RBAC

- [ ] Permission API returns ALLOW for developer
- [ ] Permission API returns DENY for user1
- [ ] Permission logs show correct evaluations

### LSS Backend

- [ ] Health endpoint accessible without auth
- [ ] Protected endpoints return 200 for developer
- [ ] Protected endpoints return 403 for user1

### MCP Server

- [ ] Rejects requests without token (401)
- [ ] Accepts requests with valid token
- [ ] Rejects requests with invalid token (401)

### End-to-End

- [ ] developer can access LSS UI
- [ ] developer can use chat interface
- [ ] user1 sees Access Denied page
- [ ] user1 cannot access any API endpoints

## Troubleshooting Failed Tests

### Token Generation Fails

```bash
# Check Keycloak is reachable
curl -s "${KEYCLOAK_URL}/realms/${REALM}/.well-known/openid-configuration" | jq .issuer
```

### Permission Always Denied

1. Check user entity exists in catalog:

   ```bash
   curl -s "${BACKSTAGE_URL}/api/catalog/entities?filter=kind=user,metadata.name=developer" | jq .
   ```

2. Check group membership:

   ```bash
   curl -s "${BACKSTAGE_URL}/api/catalog/entities?filter=kind=group,metadata.name=agentic-chat-users" | jq '.items[0].spec.members'
   ```

3. Verify RBAC policy syntax

### MCP Connection Fails

1. Check MCP server is running:

   ```bash
   curl -s "${MCP_URL}/health" || echo "MCP not reachable"
   ```

2. Check Keycloak is reachable from MCP:
   ```bash
   # From MCP server container/host
   curl -s "${KEYCLOAK_URL}/realms/${REALM}/.well-known/openid-configuration"
   ```

## Automated Test Script

Save this as `validate-security.sh`:

```bash
#!/bin/bash
set -e

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-https://keycloak.example.com}"
REALM="${REALM:-demo}"
CLIENT_ID="${CLIENT_ID:-backstage}"
CLIENT_SECRET="${CLIENT_SECRET:-your-secret}"
BACKSTAGE_URL="${BACKSTAGE_URL:-http://localhost:7007}"
MCP_URL="${MCP_URL:-http://localhost:8080}"

echo "=== LSS Security Validation ==="
echo ""

# Test 1: Get tokens
echo "1. Getting tokens..."
DEVELOPER_TOKEN=$(curl -s -X POST \
  "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "username=developer" \
  -d "password=developer123" | jq -r '.access_token')

if [ "$DEVELOPER_TOKEN" == "null" ] || [ -z "$DEVELOPER_TOKEN" ]; then
  echo "   ❌ Failed to get developer token"
  exit 1
fi
echo "   ✅ Developer token obtained"

USER1_TOKEN=$(curl -s -X POST \
  "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "username=user1" \
  -d "password=user1password" | jq -r '.access_token')

if [ "$USER1_TOKEN" == "null" ] || [ -z "$USER1_TOKEN" ]; then
  echo "   ❌ Failed to get user1 token"
  exit 1
fi
echo "   ✅ User1 token obtained"

# Test 2: Permission API
echo ""
echo "2. Testing Backstage Permission API..."

DEV_PERM=$(curl -s -X POST "${BACKSTAGE_URL}/api/permission/authorize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEVELOPER_TOKEN}" \
  -d '{"items":[{"permission":{"type":"basic","name":"agenticChat.access","attributes":{"action":"read"}}}]}' \
  | jq -r '.items[0].result')

if [ "$DEV_PERM" == "ALLOW" ]; then
  echo "   ✅ Developer permission: ALLOW"
else
  echo "   ❌ Developer permission: $DEV_PERM (expected ALLOW)"
fi

USER1_PERM=$(curl -s -X POST "${BACKSTAGE_URL}/api/permission/authorize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER1_TOKEN}" \
  -d '{"items":[{"permission":{"type":"basic","name":"agenticChat.access","attributes":{"action":"read"}}}]}' \
  | jq -r '.items[0].result')

if [ "$USER1_PERM" == "DENY" ]; then
  echo "   ✅ User1 permission: DENY"
else
  echo "   ❌ User1 permission: $USER1_PERM (expected DENY)"
fi

# Test 3: LSS API
echo ""
echo "3. Testing LSS API..."

DEV_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "${BACKSTAGE_URL}/api/agentic-chat/workflows" \
  -H "Authorization: Bearer ${DEVELOPER_TOKEN}")

if [ "$DEV_STATUS" == "200" ]; then
  echo "   ✅ Developer API access: 200"
else
  echo "   ❌ Developer API access: $DEV_STATUS (expected 200)"
fi

USER1_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "${BACKSTAGE_URL}/api/agentic-chat/workflows" \
  -H "Authorization: Bearer ${USER1_TOKEN}")

if [ "$USER1_STATUS" == "403" ]; then
  echo "   ✅ User1 API blocked: 403"
else
  echo "   ❌ User1 API access: $USER1_STATUS (expected 403)"
fi

# Test 4: MCP Server
echo ""
echo "4. Testing MCP Server..."

MCP_NOAUTH=$(curl -s -o /dev/null -w "%{http_code}" "${MCP_URL}/sse" 2>/dev/null || echo "000")

if [ "$MCP_NOAUTH" == "401" ]; then
  echo "   ✅ MCP rejects unauthenticated: 401"
elif [ "$MCP_NOAUTH" == "000" ]; then
  echo "   ⚠️  MCP server not reachable"
else
  echo "   ❌ MCP without auth: $MCP_NOAUTH (expected 401)"
fi

echo ""
echo "=== Validation Complete ==="
```

Make it executable and run:

```bash
chmod +x validate-security.sh
./validate-security.sh
```

## Next Steps

If all tests pass:

- Your security configuration is working correctly
- Deploy to production with confidence

If tests fail:

- Review the troubleshooting section
- Check the relevant setup guide
- Verify network connectivity between services
