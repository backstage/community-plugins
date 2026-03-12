# Agentic Chat Security Setup Scripts

Automated scripts to configure Keycloak and Backstage RBAC for Agentic Chat.

## ⚠️ Which Mode Are You Setting Up?

Agentic Chat supports **3 security modes**. Choose your mode first:

| Mode              | What You Need                | Scripts to Run                                           |
| ----------------- | ---------------------------- | -------------------------------------------------------- |
| **`none`**        | Nothing                      | **No scripts needed** - just set `security.mode: 'none'` |
| **`plugin-only`** | Keycloak + Backstage RBAC    | `01-keycloak-setup.sh` + `02-backstage-config.sh`        |
| **`full`**        | All of the above + MCP OAuth | 🚧 **Not yet fully supported**                           |

> **Recommended Mode**: `plugin-only` - Users authenticate via Keycloak, RBAC controls plugin access, MCP server uses its own service account.

---

## Quick Start for `plugin-only` Mode (Recommended)

```bash
# Make scripts executable
chmod +x *.sh

# Step 1: Configure Keycloak
export KEYCLOAK_URL="https://keycloak.example.com"
export KEYCLOAK_ADMIN_PASSWORD="admin-password"
./01-keycloak-setup.sh

# Step 2: Generate Backstage configuration
source keycloak-config.env
./02-backstage-config.sh

# Step 3: Validate (optional)
./validate-quick.sh
```

That's it! Steps 3 and 4 (MCP server config) are **only needed for `full` mode**.

---

## Script Reference

### Scripts for `none` and `plugin-only` Modes ✅

| Script                   | Purpose                                          | Required For  |
| ------------------------ | ------------------------------------------------ | ------------- |
| `01-keycloak-setup.sh`   | Configure Keycloak realm, clients, groups, users | `plugin-only` |
| `02-backstage-config.sh` | Generate Backstage OIDC + RBAC config            | `plugin-only` |
| `validate-quick.sh`      | Quick validation of Keycloak + RBAC              | `plugin-only` |

### Scripts for `full` Mode Only 🚧 (Future)

| Script                    | Purpose                          | Status                      |
| ------------------------- | -------------------------------- | --------------------------- |
| `03-mcp-server-config.sh` | Generate MCP server OAuth config | 🚧 Not fully tested         |
| `04-validate-setup.sh`    | Full end-to-end validation       | 🚧 Includes MCP OAuth tests |
| `validate-full.sh`        | Complete validation suite        | 🚧 Includes MCP OAuth tests |

> **Note**: The MCP server scripts are included for reference but the `full` security mode (Agentic Chat → OAuth → MCP) is not yet fully tested. For now, use `plugin-only` mode where the MCP server uses its own service account for Kubernetes access.

---

## Tested Versions

| Component     | Tested Versions  | Notes                                    |
| ------------- | ---------------- | ---------------------------------------- |
| **Keycloak**  | 22.x, 24.x, 25.x | Red Hat build of Keycloak also supported |
| **Backstage** | 1.35.x+          | Core framework                           |
| **RHDH**      | 1.3+             | Red Hat Developer Hub                    |
| **Node.js**   | 18.x, 20.x       | For Backstage                            |

---

## What Each Script Creates

### `01-keycloak-setup.sh`

Creates these Keycloak resources:

| Resource                     | Purpose                           | Needed For            |
| ---------------------------- | --------------------------------- | --------------------- |
| `backstage` client           | OIDC authentication for Backstage | `plugin-only`, `full` |
| `groups` mapper              | Include group memberships in JWT  | `plugin-only`, `full` |
| `agentic-chat-users` group   | Access control group              | `plugin-only`, `full` |
| `rhdh-team` group            | Secondary team group              | `plugin-only`, `full` |
| `developer` user             | Test user WITH access             | `plugin-only`, `full` |
| `user1` user                 | Test user WITHOUT access          | `plugin-only`, `full` |
| `mcp-server` client          | Token validation for MCP server   | `full` only           |
| `mcp-server-audience` mapper | Add MCP audience to tokens        | `full` only           |

**Environment Variables:**

| Variable                  | Required | Default                 | Description         |
| ------------------------- | -------- | ----------------------- | ------------------- |
| `KEYCLOAK_URL`            | Yes      | -                       | Keycloak server URL |
| `KEYCLOAK_ADMIN_PASSWORD` | Yes      | -                       | Admin password      |
| `KEYCLOAK_REALM`          | No       | `demo`                  | Realm name          |
| `BACKSTAGE_URL`           | No       | `http://localhost:7007` | Backstage URL       |

**Output:** `keycloak-config.env` with all generated values.

### `02-backstage-config.sh`

Generates Backstage configuration files:

| File                           | Purpose                           |
| ------------------------------ | --------------------------------- |
| `app-config.auth.yaml`         | OIDC authentication config        |
| `app-config.rbac.yaml`         | RBAC policies config              |
| `rbac-policy.csv`              | RBAC policies in CSV format       |
| `agentic-chat-entities.yaml`   | Catalog entities for users/groups |
| `app-config.agentic-chat.yaml` | Agentic Chat plugin config        |

---

## Step-by-Step for `plugin-only` Mode

### Step 1: Configure Keycloak

```bash
export KEYCLOAK_URL="https://keycloak.example.com"
export KEYCLOAK_ADMIN_PASSWORD="your-admin-password"

# Optional customizations
export KEYCLOAK_REALM="demo"
export DEVELOPER_PASSWORD="developer123"
export USER1_PASSWORD="user1password"

./01-keycloak-setup.sh
```

### Step 2: Configure Backstage

```bash
# Load Keycloak configuration
source keycloak-config.env

# Generate Backstage configuration
./02-backstage-config.sh
```

**Integrate with Backstage:**

```bash
# Option A: Use generated config files
yarn start --config app-config.yaml \
           --config app-config.auth.yaml \
           --config app-config.rbac.yaml \
           --config app-config.agentic-chat.yaml

# Option B: Merge into existing app-config.yaml
# Copy relevant sections from app-config.example.yaml
```

**Set environment variable:**

```bash
export KEYCLOAK_CLIENT_SECRET="your-client-secret"
```

### Step 3: Configure Agentic Chat

In your `app-config.yaml`:

```yaml
agenticChat:
  security:
    mode: 'plugin-only' # Backstage RBAC controls access


  # ... rest of config (llamaStack, mcpServers, etc.)
```

### Step 4: Validate

```bash
./validate-quick.sh
```

---

## Troubleshooting

### Token Generation Fails

```
[FAIL] Failed to get developer token
```

**Solutions:**

1. Verify Keycloak URL is correct and accessible
2. Check client secret matches
3. Verify user exists and password is correct

### Groups Missing in Token

```
[FAIL] Token missing 'agentic-chat-users' group
```

**Solutions:**

1. Verify Group Mapper is configured on `backstage-dedicated` scope
2. Check `Add to access token` is enabled
3. Verify user is in the group

### Permission Always DENY

```
[FAIL] Developer denied agenticChat.access
```

**Solutions:**

1. Check RBAC policies are loaded
2. Verify group name format: `group:default/agentic-chat-users`
3. Check user entity exists in catalog

---

## Files Generated

After running scripts 01 and 02:

```
.
├── keycloak-config.env          # Keycloak secrets (DO NOT COMMIT)
├── app-config.auth.yaml         # Backstage OIDC config
├── app-config.rbac.yaml         # Backstage RBAC config
├── app-config.agentic-chat.yaml # Agentic Chat config
├── app-config.example.yaml      # Combined example
├── rbac-policy.csv              # RBAC policies
└── agentic-chat-entities.yaml  # Catalog entities
```

---

## About `full` Mode (Future)

The `full` security mode would enable end-to-end OAuth authentication:

```
User → Keycloak → Backstage → LSS (OAuth token) → MCP Server
```

This requires:

- MCP server configured to validate Keycloak tokens
- LSS backend to fetch and forward OAuth tokens
- Audience mapper in Keycloak for `mcp-server`

**Current Status**: The code supports `full` mode configuration, but the MCP server OAuth validation flow is not fully tested. We recommend using `plugin-only` mode where:

- Users authenticate via Keycloak
- Backstage RBAC controls plugin access
- MCP server uses its own Kubernetes service account

The `03-mcp-server-config.sh` and `04-validate-setup.sh` scripts are provided for reference but should be considered experimental for the `full` mode use case.

---

## Support

For issues:

- **Agentic Chat**: File issue in backstage-community-plugins repository
- **Keycloak**: https://www.keycloak.org/documentation
- **Backstage**: https://backstage.io/docs
