# LSS Security with Keycloak

This document describes the security architecture and configuration for the LSS plugin when integrated with Keycloak for authentication and authorization.

## Table of Contents

1. [Security Modes](#security-modes)
2. [Architecture Overview](#architecture-overview)
3. [Security Layers](#security-layers)
4. [Quick Start](#quick-start)
5. [Detailed Setup Guides](#detailed-setup-guides)

## Security Modes

LSS supports **3 security modes** to accommodate different deployment scenarios:

| Mode          | Description                      | Use Case                       |
| ------------- | -------------------------------- | ------------------------------ |
| `none`        | No access control                | Development, demos             |
| `plugin-only` | Keycloak group → Backstage RBAC  | **Recommended for production** |
| `full`        | Full authentication chain to MCP | When MCP requires OAuth        |

**See [SECURITY_MODES.md](./SECURITY_MODES.md) for complete configuration details.**

```yaml
agenticChat:
  security:
    mode: 'plugin-only' # Options: 'none' | 'plugin-only' | 'full'
```

## Architecture Overview

LSS implements a multi-layer security model that integrates Keycloak with Backstage RBAC and MCP server security controls.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              End User                                        │
│                     (Authenticated via Keycloak)                             │
│                                                                              │
│  Identity: user:default/developer                                            │
│  Groups: [group:default/agentic-chat-users, group:default/rhdh-team]       │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: KEYCLOAK AUTHENTICATION                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  • User authenticates via OIDC                                       │    │
│  │  • Keycloak issues JWT with claims (groups, email, preferred_name)  │    │
│  │  • Token contains group memberships for RBAC decisions              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ JWT Token
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LAYER 2: BACKSTAGE RBAC                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Permission: agenticChat.access                                    │    │
│  │                                                                      │    │
│  │  Policy Check:                                                       │    │
│  │    IF user IN group:default/agentic-chat-users                      │    │
│  │    THEN role:default/agentic-chat-user                              │    │
│  │    AND  role HAS permission agenticChat.access → ALLOW             │    │
│  │                                                                      │    │
│  │  Enforcement Points:                                                 │    │
│  │    • Frontend: RequirePermission component                           │    │
│  │    • Backend: requirePluginAccess middleware                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ Backstage Service Token + User JWT
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LAYER 3: MCP SERVER SECURITY                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  A. Token Validation                                                 │    │
│  │     • Validates JWT signature against Keycloak JWKS                  │    │
│  │     • Checks audience claim matches expected value                   │    │
│  │     • Verifies token expiration                                      │    │
│  │                                                                      │    │
│  │  B. Tool Restrictions (Global - applies to all users)               │    │
│  │     • read_only: Only expose read-only tools                         │    │
│  │     • disable_destructive: Hide destructive operations               │    │
│  │     • enabled_tools / disabled_tools: Explicit tool lists            │    │
│  │                                                                      │    │
│  │  C. Resource Blocking                                                │    │
│  │     • denied_resources: Block access to specific K8s resources       │    │
│  │     • Example: Block Secrets, ClusterRoles                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ ServiceAccount Token
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LAYER 4: KUBERNETES RBAC                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Current State:                                                      │    │
│  │    • All requests use MCP ServiceAccount identity                    │    │
│  │    • User identity from Keycloak is NOT propagated                   │    │
│  │    • K8s RBAC applies to ServiceAccount, not end user                │    │
│  │                                                                      │    │
│  │  ⚠️  Limitation: Per-user K8s RBAC not currently supported          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Security Layers

### Layer 1: Keycloak Authentication

| Feature             | Status       | Description                          |
| ------------------- | ------------ | ------------------------------------ |
| OIDC Authentication | ✅ Supported | Users authenticate via Keycloak OIDC |
| JWT Token Issuance  | ✅ Supported | Keycloak issues JWT with user claims |
| Group Claims        | ✅ Supported | Groups synced to Backstage for RBAC  |
| Session Management  | ✅ Supported | Token refresh handled automatically  |

### Layer 2: Backstage RBAC

| Feature               | Status       | Description                                 |
| --------------------- | ------------ | ------------------------------------------- |
| Plugin Access Control | ✅ Supported | `agenticChat.access` permission             |
| Group-Based Policies  | ✅ Supported | Map Keycloak groups to roles                |
| Frontend Enforcement  | ✅ Supported | `ConditionalPermissionWrapper` (mode-aware) |
| Backend Enforcement   | ✅ Supported | Middleware returns 403 (mode-aware)         |
| Security Mode Aware   | ✅ Supported | `none` mode bypasses permission checks      |

### Layer 3: MCP Server Security

| Feature              | Status       | Description                     |
| -------------------- | ------------ | ------------------------------- |
| JWT Validation       | ✅ Supported | Validates against Keycloak JWKS |
| Audience Validation  | ✅ Supported | Checks `aud` claim              |
| Read-Only Mode       | ✅ Supported | Expose only read tools          |
| Tool Filtering       | ✅ Supported | Enable/disable specific tools   |
| Resource Blocking    | ✅ Supported | Deny access to K8s resources    |
| Token Exchange (STS) | ✅ Supported | Exchange tokens via Keycloak    |

### Layer 4: Kubernetes RBAC

| Feature             | Status             | Description                    |
| ------------------- | ------------------ | ------------------------------ |
| ServiceAccount Auth | ✅ Works           | MCP authenticates as SA        |
| User Impersonation  | ❌ Not Implemented | User identity not propagated   |
| Per-User RBAC       | ❌ Not Supported   | All users share SA permissions |

## Quick Start

For a working setup, you need:

1. **Keycloak** - [Setup Guide](./KEYCLOAK_SETUP.md)
2. **Backstage RBAC** - [Setup Guide](./BACKSTAGE_RBAC_SETUP.md)
3. **MCP Server** - [Setup Guide](./MCP_SERVER_SETUP.md)

## Detailed Setup Guides

- [Keycloak Configuration](./KEYCLOAK_SETUP.md) - Complete Keycloak setup
- [Backstage RBAC Configuration](./BACKSTAGE_RBAC_SETUP.md) - Permission policies
- [MCP Server Configuration](./MCP_SERVER_SETUP.md) - Tool and resource restrictions
- [Validation Guide](./VALIDATION.md) - Testing your setup

## Security Considerations

### What This Architecture Provides

1. **User Authentication** - Verifies user identity via Keycloak
2. **Plugin Authorization** - Controls who can access LSS
3. **Tool Restrictions** - Limits available MCP tools globally
4. **Resource Protection** - Blocks access to sensitive K8s resources

### What This Architecture Does NOT Provide

1. **Per-User K8s RBAC** - All users have same K8s permissions
2. **Group-Based Tool Access** - Cannot show different tools to different groups
3. **Audit Trail by User** - K8s audit logs show ServiceAccount, not user

### Recommendations

For production deployments:

1. Use `read_only = true` to minimize blast radius
2. Block sensitive resources with `denied_resources`
3. Use least-privilege ServiceAccount for MCP
4. Enable Keycloak audit logging
5. Monitor for unusual activity patterns
