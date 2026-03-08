# LSS Security Documentation

This directory contains comprehensive documentation and **automated setup scripts** for configuring security for the LSS plugin with Keycloak.

## ⚠️ Choose Your Security Mode First

| Mode              | Setup Required                             | Status                  |
| ----------------- | ------------------------------------------ | ----------------------- |
| **`none`**        | Nothing - just set `security.mode: 'none'` | ✅ Tested               |
| **`plugin-only`** | Keycloak + Backstage RBAC                  | ✅ Tested (Recommended) |
| **`full`**        | Keycloak + RBAC + MCP OAuth                | 🚧 Experimental         |

## Quick Start for `plugin-only` Mode (Recommended)

```bash
cd docs/scripts
chmod +x *.sh

# 1. Configure Keycloak
export KEYCLOAK_URL="https://keycloak.example.com"
export KEYCLOAK_ADMIN_PASSWORD="admin-password"
./01-keycloak-setup.sh

# 2. Generate Backstage configuration
source keycloak-config.env
./02-backstage-config.sh

# 3. Validate
./validate-quick.sh
```

> **Note**: Scripts 03 and 04 are for `full` mode (MCP OAuth) which is experimental.

See [scripts/README.md](./scripts/README.md) for detailed script documentation.

## Documentation Index

### For `none` and `plugin-only` Modes ✅

| Document                                             | Description                                     |
| ---------------------------------------------------- | ----------------------------------------------- |
| [**SECURITY_MODES.md**](./SECURITY_MODES.md)         | **⭐ 3 Security Modes Explained (start here!)** |
| [**scripts/**](./scripts/)                           | Automated setup scripts                         |
| [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md)             | Complete Keycloak configuration guide           |
| [BACKSTAGE_RBAC_SETUP.md](./BACKSTAGE_RBAC_SETUP.md) | Backstage permission and RBAC configuration     |
| [VALIDATION.md](./VALIDATION.md)                     | Step-by-step validation and testing guide       |

### For `full` Mode 🚧 (Experimental)

| Document                                     | Description                    |
| -------------------------------------------- | ------------------------------ |
| [MCP_SERVER_SETUP.md](./MCP_SERVER_SETUP.md) | MCP server OAuth configuration |
| [SECURITY.md](./SECURITY.md)                 | Security architecture overview |

## Tested Versions

| Component             | Tested Versions  |
| --------------------- | ---------------- |
| Keycloak              | 22.x, 24.x, 25.x |
| Backstage             | 1.35.x+          |
| RHDH                  | 1.3+             |
| kubernetes-mcp-server | 0.5.x+           |
| Kubernetes            | 1.28+            |
| OpenShift             | 4.14+            |

## Manual Setup

1. **Read the Architecture**: Start with [SECURITY.md](./SECURITY.md) to understand the security model
2. **Configure Keycloak**: Follow [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) to set up authentication
3. **Configure RBAC**: Follow [BACKSTAGE_RBAC_SETUP.md](./BACKSTAGE_RBAC_SETUP.md) for access control
4. **Configure MCP**: Follow [MCP_SERVER_SETUP.md](./MCP_SERVER_SETUP.md) for MCP security
5. **Validate**: Use [VALIDATION.md](./VALIDATION.md) to test your setup

## Security Feature Summary

### What Works ✅

| Feature               | Layer          | Description                     |
| --------------------- | -------------- | ------------------------------- |
| User Authentication   | Keycloak       | OIDC-based user authentication  |
| Group Membership      | Keycloak       | Groups synced to JWT tokens     |
| Plugin Access Control | Backstage RBAC | `agenticChat.access` permission |
| Token Validation      | MCP Server     | JWT validation against Keycloak |
| Tool Restrictions     | MCP Server     | Read-only mode, disabled tools  |
| Resource Blocking     | MCP Server     | Block access to K8s resources   |

### What Doesn't Work ❌

| Feature            | Status          | Workaround                         |
| ------------------ | --------------- | ---------------------------------- |
| Per-User K8s RBAC  | Not Implemented | Use MCP tool/resource restrictions |
| Group-Based Tools  | Not Implemented | Use global tool restrictions       |
| User Impersonation | Not Implemented | All users share ServiceAccount     |

## Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Keycloak   │────▶│  Backstage  │────▶│ LSS│────▶│ MCP Server  │
│  (AuthN)    │     │   (RBAC)    │     │  (Backend)   │     │ (Controls)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │                   │
      │                   │                    │                   │
      ▼                   ▼                    ▼                   ▼
  ┌───────┐          ┌─────────┐         ┌─────────┐         ┌─────────┐
  │ JWT   │          │Permission│        │  403    │         │ Tool    │
  │ Token │          │ Check   │         │ if Deny │         │ Filter  │
  │+groups│          │         │         │         │         │+Resource│
  └───────┘          └─────────┘         └─────────┘         │ Block   │
                                                             └─────────┘
```

## Configuration Values Reference

When configuring, you'll need these values from each system:

### From Keycloak

```
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=demo
KEYCLOAK_BACKSTAGE_CLIENT_ID=backstage
KEYCLOAK_BACKSTAGE_CLIENT_SECRET=<from Keycloak>
KEYCLOAK_MCP_CLIENT_ID=mcp-server
KEYCLOAK_MCP_CLIENT_SECRET=<from Keycloak>
```

### For Backstage

```yaml
# app-config.yaml
auth.providers.oidc.development.clientId: backstage
auth.providers.oidc.development.clientSecret: ${KEYCLOAK_BACKSTAGE_CLIENT_SECRET}
permission.enabled: true
```

### For MCP Server

```toml
# config.toml
require_oauth = true
authorization_url = "https://keycloak.example.com/realms/demo"
oauth_audience = "mcp-server"
```

## Validation Quick Test

```bash
# Get a token
TOKEN=$(curl -s -X POST "https://keycloak.example.com/realms/demo/protocol/openid-connect/token" \
  -d "grant_type=password" -d "client_id=backstage" -d "client_secret=SECRET" \
  -d "username=developer" -d "password=developer123" | jq -r '.access_token')

# Test Backstage permission
curl -X POST "http://localhost:7007/api/permission/authorize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"permission":{"type":"basic","name":"agenticChat.access","attributes":{"action":"read"}}}]}'

# Expected: {"items":[{"result":"ALLOW"}]}
```

## Support

For issues with:

- **LSS Plugin**: File an issue in the backstage-community-plugins repository
- **Kubernetes MCP Server**: File an issue at https://github.com/containers/kubernetes-mcp-server
- **Keycloak**: Refer to Keycloak documentation at https://www.keycloak.org/documentation
