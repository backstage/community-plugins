# MCP Server Security Configuration

This guide explains how to configure the Kubernetes MCP Server for secure operation with Keycloak authentication.

## Prerequisites

- Keycloak configured as per [Keycloak Setup Guide](./KEYCLOAK_SETUP.md)
- Kubernetes MCP Server installed
- Network connectivity between MCP server and Keycloak

## Overview

The MCP server provides several security controls:

1. **OAuth/JWT Validation** - Validates user tokens from Keycloak
2. **Tool Restrictions** - Limits which tools are available
3. **Resource Blocking** - Blocks access to specific Kubernetes resources
4. **Read-Only Mode** - Exposes only non-destructive operations

## Configuration Methods

### Method 1: TOML Configuration File

Create a `config.toml` file:

```toml
# MCP Server Security Configuration

# Enable OAuth authentication
require_oauth = true

# Keycloak authorization URL (used for token validation)
authorization_url = "https://YOUR_KEYCLOAK_URL/realms/demo"

# Expected audience in JWT tokens
oauth_audience = "mcp-server"

# Disable dynamic client registration (security hardening)
disable_dynamic_client_registration = true

# Tool restrictions
read_only = false                    # Set to true for read-only mode
disable_destructive = true           # Hide destructive operations

# Explicit tool control
enabled_tools = []                   # Empty = all allowed (except disabled)
disabled_tools = [
  "delete_resource",                 # Block resource deletion
  "apply_resource",                  # Block resource creation/updates
  "patch_resource"                   # Block resource patching
]

# Block access to sensitive resources
[[denied_resources]]
group = ""
version = "v1"
kind = "Secret"

[[denied_resources]]
group = ""
version = "v1"
kind = "ConfigMap"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "ClusterRole"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "ClusterRoleBinding"

# Server settings
port = "8080"
log_level = 2
```

### Method 2: Environment Variables

```bash
# OAuth settings
export MCP_REQUIRE_OAUTH=true
export MCP_AUTHORIZATION_URL="https://YOUR_KEYCLOAK_URL/realms/demo"
export MCP_OAUTH_AUDIENCE="mcp-server"

# Tool restrictions
export MCP_READ_ONLY=false
export MCP_DISABLE_DESTRUCTIVE=true
```

### Method 3: Command Line Flags

```bash
./kubernetes-mcp-server \
  --require-oauth \
  --authorization-url "https://YOUR_KEYCLOAK_URL/realms/demo" \
  --oauth-audience "mcp-server" \
  --disable-destructive \
  --config config.toml
```

## Security Modes

### Mode 1: Full Access (Not Recommended for Production)

All tools enabled, no restrictions:

```toml
require_oauth = true
authorization_url = "https://YOUR_KEYCLOAK_URL/realms/demo"
oauth_audience = "mcp-server"

read_only = false
disable_destructive = false
disabled_tools = []
denied_resources = []
```

### Mode 2: Read-Only (Recommended)

Only read operations allowed:

```toml
require_oauth = true
authorization_url = "https://YOUR_KEYCLOAK_URL/realms/demo"
oauth_audience = "mcp-server"

# Only expose read-only tools
read_only = true

# Block sensitive resources
[[denied_resources]]
group = ""
version = "v1"
kind = "Secret"
```

### Mode 3: Restricted Write (Balanced)

Allow some writes, block dangerous operations:

```toml
require_oauth = true
authorization_url = "https://YOUR_KEYCLOAK_URL/realms/demo"
oauth_audience = "mcp-server"

read_only = false
disable_destructive = true

# Explicitly disable dangerous tools
disabled_tools = [
  "delete_resource",
  "exec_command"
]

# Block sensitive resources
[[denied_resources]]
group = ""
version = "v1"
kind = "Secret"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "ClusterRole"
```

## Tool Categories

The MCP server annotates tools with hints:

| Annotation             | Description                | Example Tools                      |
| ---------------------- | -------------------------- | ---------------------------------- |
| `readOnlyHint=true`    | Safe read operations       | `list_resources`, `get_resource`   |
| `destructiveHint=true` | Dangerous write operations | `delete_resource`                  |
| (none)                 | Normal write operations    | `apply_resource`, `patch_resource` |

### Read-Only Tools (Safe)

When `read_only = true`, only these are exposed:

- `list_resources` - List Kubernetes resources
- `get_resource` - Get a specific resource
- `list_api_resources` - List available API types
- `get_events` - Get cluster events
- `get_pod_logs` - Get pod logs
- `get_cluster_info` - Get cluster information

### Destructive Tools (Dangerous)

When `disable_destructive = true`, these are hidden:

- `delete_resource` - Delete any resource
- `delete_pod` - Force delete pods
- `drain_node` - Drain a node
- `cordon_node` - Cordon a node

### Standard Write Tools

Available unless explicitly disabled:

- `apply_resource` - Create or update resources
- `patch_resource` - Patch resources
- `scale_deployment` - Scale deployments/statefulsets

## Resource Blocking

Block access to specific Kubernetes resource types:

```toml
# Block all Secrets
[[denied_resources]]
group = ""
version = "v1"
kind = "Secret"

# Block ConfigMaps
[[denied_resources]]
group = ""
version = "v1"
kind = "ConfigMap"

# Block RBAC resources
[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "ClusterRole"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "ClusterRoleBinding"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "Role"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "RoleBinding"

# Block ServiceAccounts
[[denied_resources]]
group = ""
version = "v1"
kind = "ServiceAccount"
```

## Token Exchange (STS) Configuration

For advanced scenarios requiring token exchange:

```toml
require_oauth = true
authorization_url = "https://YOUR_KEYCLOAK_URL/realms/demo"
oauth_audience = "mcp-server"

# STS token exchange settings
sts_client_id = "mcp-server"
sts_client_secret = "YOUR_MCP_CLIENT_SECRET"
sts_audience = "openshift"
sts_scopes = ["openid", "profile"]
```

> **Note**: Token exchange currently doesn't enable per-user Kubernetes RBAC. See [Security Architecture](./SECURITY.md) for details.

## LSS Backend Configuration

Configure LSS to use the secured MCP server:

**app-config.yaml:**

```yaml
agenticChat:
  # Security mode determines how MCP servers are authenticated
  # See docs/SECURITY_MODES.md for details
  security:
    mode: 'plugin-only' # MCP server uses its own service account
    # mode: 'full'       # LSS sends OAuth tokens to MCP server

  mcpServers:
    - id: kubernetes
      name: Kubernetes MCP
      type: streamable-http # or 'sse'
      url: http://kubernetes-mcp-server:8080/mcp
      requireApproval: 'never'
```

### How Authentication Works by Security Mode

| Mode          | MCP Server Auth    | Description                             |
| ------------- | ------------------ | --------------------------------------- |
| `none`        | No auth headers    | MCP server uses its own service account |
| `plugin-only` | No auth headers    | MCP server uses its own service account |
| `full`        | OAuth Bearer token | LSS fetches token from Keycloak         |

For `full` mode, configure the OAuth settings:

```yaml
agenticChat:
  security:
    mode: 'full'
    mcpOAuth:
      tokenUrl: 'https://keycloak.example.com/realms/demo/protocol/openid-connect/token'
      clientId: 'agentic-chat-backend'
      clientSecret: ${MCP_OAUTH_CLIENT_SECRET}
```

## Kubernetes Deployment

### ServiceAccount and RBAC

Create a ServiceAccount for the MCP server:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mcp-server
  namespace: mcp-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-server-role
rules:
  # Read-only access (safe)
  - apiGroups: ['']
    resources:
      ['pods', 'services', 'namespaces', 'configmaps', 'persistentvolumeclaims']
    verbs: ['get', 'list', 'watch']
  - apiGroups: ['apps']
    resources: ['deployments', 'statefulsets', 'daemonsets', 'replicasets']
    verbs: ['get', 'list', 'watch']
  - apiGroups: ['']
    resources: ['events']
    verbs: ['get', 'list', 'watch']
  - apiGroups: ['']
    resources: ['pods/log']
    verbs: ['get']

  # Write access (if needed)
  # - apiGroups: ["apps"]
  #   resources: ["deployments", "statefulsets"]
  #   verbs: ["patch", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: mcp-server-binding
subjects:
  - kind: ServiceAccount
    name: mcp-server
    namespace: mcp-system
roleRef:
  kind: ClusterRole
  name: mcp-server-role
  apiGroup: rbac.authorization.k8s.io
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kubernetes-mcp-server
  namespace: mcp-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kubernetes-mcp-server
  template:
    metadata:
      labels:
        app: kubernetes-mcp-server
    spec:
      serviceAccountName: mcp-server
      containers:
        - name: mcp-server
          image: quay.io/strimzi-ci/kubernetes-mcp-server:latest
          ports:
            - containerPort: 8080
          env:
            - name: MCP_REQUIRE_OAUTH
              value: 'true'
            - name: MCP_AUTHORIZATION_URL
              value: 'https://YOUR_KEYCLOAK_URL/realms/demo'
            - name: MCP_OAUTH_AUDIENCE
              value: 'mcp-server'
            - name: MCP_DISABLE_DESTRUCTIVE
              value: 'true'
          volumeMounts:
            - name: config
              mountPath: /etc/mcp-server
      volumes:
        - name: config
          configMap:
            name: mcp-server-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-server-config
  namespace: mcp-system
data:
  config.toml: |
    require_oauth = true
    authorization_url = "https://YOUR_KEYCLOAK_URL/realms/demo"
    oauth_audience = "mcp-server"
    read_only = true

    [[denied_resources]]
    group = ""
    version = "v1"
    kind = "Secret"
---
apiVersion: v1
kind: Service
metadata:
  name: kubernetes-mcp-server
  namespace: mcp-system
spec:
  selector:
    app: kubernetes-mcp-server
  ports:
    - port: 8080
      targetPort: 8080
```

## Verification

### Test Token Validation

```bash
# Get a user token from Keycloak
TOKEN=$(curl -s -X POST \
  "https://YOUR_KEYCLOAK_URL/realms/demo/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=backstage" \
  -d "client_secret=YOUR_SECRET" \
  -d "username=developer" \
  -d "password=developer123" | jq -r '.access_token')

# Test MCP server with valid token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/sse
```

Expected: Connection established (for valid token)

### Test Without Token

```bash
curl http://localhost:8080/sse
```

Expected: `401 Unauthorized`

### Test Invalid Token

```bash
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:8080/sse
```

Expected: `401 Unauthorized`

### Check Available Tools

With valid token, check which tools are available:

```bash
# The tool list is returned in the MCP protocol initialization
# You can see this in LSS's chat interface
```

## Security Best Practices

1. **Always enable OAuth** in production
2. **Use read_only mode** unless writes are required
3. **Block sensitive resources** (Secrets, RBAC, ServiceAccounts)
4. **Use least-privilege RBAC** for the MCP ServiceAccount
5. **Enable TLS** for production deployments
6. **Monitor access logs** for unusual patterns
7. **Rotate credentials** regularly

## Troubleshooting

### Token Validation Fails

1. Check Keycloak URL is reachable from MCP server
2. Verify audience claim in token matches `oauth_audience`
3. Check token hasn't expired
4. Verify JWKS endpoint is accessible

### Tools Not Available

1. Check `read_only` and `disable_destructive` settings
2. Verify `enabled_tools` / `disabled_tools` configuration
3. Check MCP server logs for tool registration

### Resource Access Denied

1. Check `denied_resources` configuration
2. Verify ServiceAccount RBAC permissions
3. Check Kubernetes audit logs

## Next Steps

- [Validation Guide](./VALIDATION.md) - Test your complete setup
