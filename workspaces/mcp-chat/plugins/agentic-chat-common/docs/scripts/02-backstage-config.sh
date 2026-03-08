#!/bin/bash
#
# Agentic Chat - Backstage Configuration Generator
#
# This script generates Backstage configuration for:
# - OIDC authentication with Keycloak
# - RBAC policies for Agentic Chat access control
# - User/Group catalog entities
#
# Tested with:
# - Backstage 1.35.x+
# - Red Hat Developer Hub 1.3+
# - @backstage/plugin-permission-backend 0.5.x+
# - @janus-idp/backstage-plugin-rbac 2.x+
#
# Usage:
#   source keycloak-config.env  # From previous step
#   ./02-backstage-config.sh
#
# Or with environment variables:
#   export KEYCLOAK_URL=https://keycloak.example.com
#   export KEYCLOAK_REALM=demo
#   export BACKSTAGE_CLIENT_ID=backstage
#   export BACKSTAGE_CLIENT_SECRET=your-secret
#   ./02-backstage-config.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-demo}"
BACKSTAGE_CLIENT_ID="${BACKSTAGE_CLIENT_ID:-backstage}"
BACKSTAGE_CLIENT_SECRET="${BACKSTAGE_CLIENT_SECRET:-}"
BACKSTAGE_URL="${BACKSTAGE_URL:-http://localhost:7007}"
OUTPUT_DIR="${OUTPUT_DIR:-.}"

# Validate
validate_config() {
    local missing=""
    
    [ -z "$KEYCLOAK_URL" ] && missing="$missing KEYCLOAK_URL"
    [ -z "$BACKSTAGE_CLIENT_SECRET" ] && missing="$missing BACKSTAGE_CLIENT_SECRET"
    
    if [ -n "$missing" ]; then
        log_error "Missing required environment variables:$missing"
        echo ""
        echo "Either source keycloak-config.env or set variables manually:"
        echo "  source keycloak-config.env"
        echo "  ./02-backstage-config.sh"
        exit 1
    fi
}

# Generate OIDC auth configuration
generate_auth_config() {
    log_info "Generating OIDC authentication configuration..."
    
    cat > "${OUTPUT_DIR}/app-config.auth.yaml" << EOF
# Backstage OIDC Authentication Configuration for Agentic Chat
# Generated on $(date)
#
# Merge this into your app-config.yaml or use as a separate config file:
#   yarn start --config app-config.yaml --config app-config.auth.yaml
#
# Tested with:
# - Backstage 1.35.x+
# - Keycloak 22.x, 24.x, 25.x

auth:
  environment: development
  providers:
    oidc:
      development:
        metadataUrl: ${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration
        clientId: ${BACKSTAGE_CLIENT_ID}
        clientSecret: \${KEYCLOAK_CLIENT_SECRET}  # Set via environment variable
        callbackUrl: ${BACKSTAGE_URL}/api/auth/oidc/handler/frame
        prompt: auto
        signIn:
          resolvers:
            # Try matching by email first
            - resolver: emailMatchingUserEntityProfileEmail
            # Then try username
            - resolver: emailLocalPartMatchingUserEntityName
            - resolver: preferredUsernameMatchingUserEntityName

# Use OIDC as the sign-in page
signInPage: oidc
EOF

    log_success "Generated: ${OUTPUT_DIR}/app-config.auth.yaml"
}

# Generate RBAC configuration
generate_rbac_config() {
    log_info "Generating RBAC configuration..."
    
    cat > "${OUTPUT_DIR}/app-config.rbac.yaml" << EOF
# Backstage RBAC Configuration for Agentic Chat
# Generated on $(date)
#
# This configures permission-based access control for Agentic Chat.
# Users must be in the 'agentic-chat-users' Keycloak group to access the plugin.
#
# Tested with:
# - @backstage/plugin-permission-backend 0.5.x+
# - @janus-idp/backstage-plugin-rbac 2.x+ (for RHDH)

permission:
  enabled: true
  rbac:
    # Define policies inline or use CSV file
    policies:
      # ============================================
      # Agentic Chat Access Control
      # ============================================
      
      # Map Keycloak group to Backstage role
      - g, group:default/agentic-chat-users, role:default/agentic-chat-user
      
      # Grant Agentic Chat access to the role
      - p, role:default/agentic-chat-user, agenticChat.access, read, allow
      
      # ============================================
      # Catalog Access (required for users)
      # ============================================
      
      # Allow reading catalog entities
      - p, role:default/agentic-chat-user, catalog.entity.read, read, allow
      
      # ============================================
      # Optional: Admin Role
      # ============================================
      
      # Map admin group to admin role (if you have one)
      # - g, group:default/agentic-chat-admins, role:default/agentic-chat-admin
      # - p, role:default/agentic-chat-admin, agenticChat.access, read, allow
      # - p, role:default/agentic-chat-admin, catalog.entity.read, read, allow
      
    # Admin users for RBAC management (RHDH specific)
    admin:
      users:
        - name: user:default/admin
      # superUsers: []
EOF

    log_success "Generated: ${OUTPUT_DIR}/app-config.rbac.yaml"
}

# Generate RBAC policies CSV file
generate_rbac_csv() {
    log_info "Generating RBAC policies CSV file..."
    
    cat > "${OUTPUT_DIR}/rbac-policy.csv" << 'EOF'
# RBAC Policies for Agentic Chat
# Format: policy_type, subject, resource/role, action, effect
#
# Policy Types:
#   g = Group/Role membership
#   p = Permission grant
#
# Generated on $(date)

# ============================================
# Group to Role Mappings
# ============================================

# Agentic Chat Users
g, group:default/agentic-chat-users, role:default/agentic-chat-user

# RHDH Team (also gets Agentic Chat access)
g, group:default/rhdh-team, role:default/agentic-chat-user

# Admins
# g, group:default/agentic-chat-admins, role:default/agentic-chat-admin
# g, role:default/agentic-chat-admin, role:default/agentic-chat-user

# ============================================
# Permission Grants
# ============================================

# Agentic Chat Plugin Access
p, role:default/agentic-chat-user, agenticChat.access, read, allow

# Catalog Read Access
p, role:default/agentic-chat-user, catalog.entity.read, read, allow

# ============================================
# Explicit Denies (optional)
# ============================================

# Example: Block specific user
# p, user:default/blocked-user, agenticChat.access, read, deny
EOF

    log_success "Generated: ${OUTPUT_DIR}/rbac-policy.csv"
}

# Generate catalog entities for users and groups
generate_catalog_entities() {
    log_info "Generating catalog entities..."
    
    cat > "${OUTPUT_DIR}/agentic-chat-entities.yaml" << EOF
# Catalog Entities for Agentic Chat
# Generated on $(date)
#
# These entities define the groups and users for RBAC.
# Import this file in your catalog or use Keycloak entity provider.
#
# Add to app-config.yaml:
#   catalog:
#     locations:
#       - type: file
#         target: ./agentic-chat-entities.yaml
#         rules:
#           - allow: [User, Group]

---
apiVersion: backstage.io/v1alpha1
kind: Group
metadata:
  name: agentic-chat-users
  namespace: default
  description: Users with access to Agentic Chat
  annotations:
    backstage.io/managed-by-location: "file:./agentic-chat-entities.yaml"
spec:
  type: team
  children: []

---
apiVersion: backstage.io/v1alpha1
kind: Group
metadata:
  name: rhdh-team
  namespace: default
  description: Red Hat Developer Hub Team
  annotations:
    backstage.io/managed-by-location: "file:./agentic-chat-entities.yaml"
spec:
  type: team
  children: []

---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: developer
  namespace: default
  annotations:
    backstage.io/managed-by-location: "file:./agentic-chat-entities.yaml"
spec:
  profile:
    displayName: Developer User
    email: developer@example.com
  memberOf:
    - agentic-chat-users
    - rhdh-team

---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: user1
  namespace: default
  annotations:
    backstage.io/managed-by-location: "file:./agentic-chat-entities.yaml"
spec:
  profile:
    displayName: User One
    email: user1@example.com
  memberOf: []
  # Note: user1 is NOT in agentic-chat-users, so will be denied access
EOF

    log_success "Generated: ${OUTPUT_DIR}/agentic-chat-entities.yaml"
}

# Generate Agentic Chat plugin configuration
generate_agentic_chat_config() {
    log_info "Generating Agentic Chat plugin configuration..."
    
    cat > "${OUTPUT_DIR}/app-config.agentic-chat.yaml" << EOF
# Agentic Chat Plugin Configuration
# Generated on $(date)
#
# Configure MCP servers that Agentic Chat connects to.

agenticChat:
  # MCP Servers Configuration
  mcpServers:
    # Kubernetes MCP Server
    - id: kubernetes
      name: Kubernetes
      url: \${MCP_SERVER_URL:-http://localhost:8080}
      transport: sse
      # description: Kubernetes cluster operations
    
    # Add more MCP servers as needed:
    # - id: github
    #   name: GitHub
    #   url: http://github-mcp:8080
    #   transport: sse
  
  # Default agent/model configuration
  # agent:
  #   model: gpt-4
  #   provider: openai
EOF

    log_success "Generated: ${OUTPUT_DIR}/app-config.agentic-chat.yaml"
}

# Generate combined example
generate_combined_example() {
    log_info "Generating combined configuration example..."
    
    cat > "${OUTPUT_DIR}/app-config.example.yaml" << EOF
# Complete Backstage Configuration for Agentic Chat
# Generated on $(date)
#
# This is an example combining all configurations.
# Adapt to your environment and merge with your existing app-config.yaml.
#
# Environment variables required:
#   KEYCLOAK_CLIENT_SECRET - Backstage client secret from Keycloak
#   MCP_SERVER_URL - URL of the Kubernetes MCP server (optional)

app:
  title: Developer Hub with Agentic Chat
  baseUrl: ${BACKSTAGE_URL}

backend:
  baseUrl: ${BACKSTAGE_URL}
  listen:
    port: 7007
  cors:
    origin: ${BACKSTAGE_URL}

# Authentication
auth:
  environment: development
  providers:
    oidc:
      development:
        metadataUrl: ${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration
        clientId: ${BACKSTAGE_CLIENT_ID}
        clientSecret: \${KEYCLOAK_CLIENT_SECRET}
        callbackUrl: ${BACKSTAGE_URL}/api/auth/oidc/handler/frame
        prompt: auto
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName
            - resolver: preferredUsernameMatchingUserEntityName

signInPage: oidc

# Permission and RBAC
permission:
  enabled: true
  rbac:
    policies:
      - g, group:default/agentic-chat-users, role:default/agentic-chat-user
      - p, role:default/agentic-chat-user, agenticChat.access, read, allow
      - p, role:default/agentic-chat-user, catalog.entity.read, read, allow

# Catalog
catalog:
  locations:
    - type: file
      target: ./agentic-chat-entities.yaml
      rules:
        - allow: [User, Group]
  # Optional: Sync users/groups from Keycloak automatically
  # providers:
  #   keycloakOrg:
  #     default:
  #       baseUrl: ${KEYCLOAK_URL}
  #       loginRealm: master
  #       realm: ${KEYCLOAK_REALM}
  #       clientId: ${BACKSTAGE_CLIENT_ID}
  #       clientSecret: \${KEYCLOAK_CLIENT_SECRET}

# Agentic Chat
agenticChat:
  mcpServers:
    - id: kubernetes
      name: Kubernetes
      url: \${MCP_SERVER_URL:-http://localhost:8080}
      transport: sse
EOF

    log_success "Generated: ${OUTPUT_DIR}/app-config.example.yaml"
}

# Print summary
print_summary() {
    echo ""
    echo "============================================"
    echo "  BACKSTAGE CONFIGURATION COMPLETE"
    echo "============================================"
    echo ""
    echo "Generated files:"
    echo "  - app-config.auth.yaml      : OIDC authentication config"
    echo "  - app-config.rbac.yaml      : RBAC policies config"
    echo "  - rbac-policy.csv           : RBAC policies (CSV format)"
    echo "  - agentic-chat-entities.yaml: Catalog entities"
    echo "  - app-config.agentic-chat.yaml: Agentic Chat config"
    echo "  - app-config.example.yaml   : Combined example"
    echo ""
    echo "To use these configurations:"
    echo ""
    echo "  1. Set environment variable:"
    echo "     export KEYCLOAK_CLIENT_SECRET=${BACKSTAGE_CLIENT_SECRET}"
    echo ""
    echo "  2. Start Backstage with additional configs:"
    echo "     yarn start --config app-config.yaml \\"
    echo "               --config app-config.auth.yaml \\"
    echo "               --config app-config.rbac.yaml \\"
    echo "               --config app-config.agentic-chat.yaml"
    echo ""
    echo "  3. Or merge into your existing app-config.yaml"
    echo ""
    echo "Next steps:"
    echo "  - Configure MCP Server: ./03-mcp-server-config.sh"
    echo "  - Validate setup: ./04-validate-setup.sh"
}

# Main
main() {
    echo "============================================"
    echo "  Agentic Chat - Backstage Config Generator"
    echo "============================================"
    echo ""
    
    validate_config
    
    mkdir -p "$OUTPUT_DIR"
    
    generate_auth_config
    generate_rbac_config
    generate_rbac_csv
    generate_catalog_entities
    generate_agentic_chat_config
    generate_combined_example
    print_summary
    
    log_success "Backstage configuration generation completed!"
}

main "$@"

