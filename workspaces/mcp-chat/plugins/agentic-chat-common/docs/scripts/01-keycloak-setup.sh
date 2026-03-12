#!/bin/bash
#
# Agentic Chat - Keycloak Configuration Script
# 
# This script configures Keycloak for Agentic Chat authentication:
# - Creates/configures backstage client for OIDC authentication
# - Creates/configures mcp-server client for token validation
# - Creates agentic-chat-users group
# - Creates test users (developer, user1)
# - Configures group and audience mappers
#
# Tested with:
# - Keycloak 24.x, 25.x (Red Hat build of Keycloak)
# - Keycloak 22.x+
#
# Usage:
#   ./01-keycloak-setup.sh
#
# Environment variables (required):
#   KEYCLOAK_URL      - Keycloak server URL (e.g., https://keycloak.example.com)
#   KEYCLOAK_REALM    - Realm name (default: demo)
#   KEYCLOAK_ADMIN    - Admin username (default: admin)
#   KEYCLOAK_ADMIN_PASSWORD - Admin password
#
# Optional environment variables:
#   BACKSTAGE_URL     - Backstage URL for redirect URIs (default: http://localhost:7007)
#   DEVELOPER_PASSWORD - Password for developer user (default: developer123)
#   USER1_PASSWORD    - Password for user1 (default: user1password)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration with defaults
KEYCLOAK_URL="${KEYCLOAK_URL:-}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-demo}"
KEYCLOAK_ADMIN="${KEYCLOAK_ADMIN:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-}"
BACKSTAGE_URL="${BACKSTAGE_URL:-http://localhost:7007}"
DEVELOPER_PASSWORD="${DEVELOPER_PASSWORD:-developer123}"
USER1_PASSWORD="${USER1_PASSWORD:-user1password}"

# Validate required variables
validate_config() {
    local missing=""
    
    if [ -z "$KEYCLOAK_URL" ]; then
        missing="$missing KEYCLOAK_URL"
    fi
    
    if [ -z "$KEYCLOAK_ADMIN_PASSWORD" ]; then
        missing="$missing KEYCLOAK_ADMIN_PASSWORD"
    fi
    
    if [ -n "$missing" ]; then
        log_error "Missing required environment variables:$missing"
        echo ""
        echo "Usage:"
        echo "  export KEYCLOAK_URL=https://keycloak.example.com"
        echo "  export KEYCLOAK_ADMIN_PASSWORD=your-admin-password"
        echo "  ./01-keycloak-setup.sh"
        exit 1
    fi
}

# Get admin access token
get_admin_token() {
    log_info "Getting admin access token..."
    
    ADMIN_TOKEN=$(curl -sk -X POST \
        "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=password" \
        -d "client_id=admin-cli" \
        -d "username=${KEYCLOAK_ADMIN}" \
        -d "password=${KEYCLOAK_ADMIN_PASSWORD}" | jq -r '.access_token')
    
    if [ "$ADMIN_TOKEN" == "null" ] || [ -z "$ADMIN_TOKEN" ]; then
        log_error "Failed to get admin token. Check credentials and Keycloak URL."
        exit 1
    fi
    
    log_success "Admin token obtained"
}

# Check if realm exists, create if not
ensure_realm() {
    log_info "Checking realm '${KEYCLOAK_REALM}'..."
    
    REALM_EXISTS=$(curl -sk -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}")
    
    if [ "$REALM_EXISTS" == "200" ]; then
        log_info "Realm '${KEYCLOAK_REALM}' already exists"
    else
        log_info "Creating realm '${KEYCLOAK_REALM}'..."
        curl -sk -X POST \
            "${KEYCLOAK_URL}/admin/realms" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "{
                \"realm\": \"${KEYCLOAK_REALM}\",
                \"enabled\": true,
                \"displayName\": \"Demo Realm\",
                \"registrationAllowed\": false,
                \"loginWithEmailAllowed\": true,
                \"duplicateEmailsAllowed\": false,
                \"resetPasswordAllowed\": true,
                \"editUsernameAllowed\": false,
                \"bruteForceProtected\": true
            }"
        log_success "Realm created"
    fi
}

# Create or update the backstage client
setup_backstage_client() {
    log_info "Setting up 'backstage' client..."
    
    # Check if client exists
    CLIENT_ID=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=backstage" | jq -r '.[0].id // empty')
    
    CLIENT_CONFIG='{
        "clientId": "backstage",
        "name": "Backstage OIDC Client",
        "description": "OIDC client for Backstage authentication",
        "enabled": true,
        "protocol": "openid-connect",
        "publicClient": false,
        "clientAuthenticatorType": "client-secret",
        "standardFlowEnabled": true,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "authorizationServicesEnabled": false,
        "rootUrl": "'"${BACKSTAGE_URL}"'",
        "baseUrl": "'"${BACKSTAGE_URL}"'",
        "redirectUris": ["'"${BACKSTAGE_URL}"'/*"],
        "webOrigins": ["'"${BACKSTAGE_URL}"'"],
        "attributes": {
            "post.logout.redirect.uris": "'"${BACKSTAGE_URL}"'/*"
        }
    }'
    
    if [ -n "$CLIENT_ID" ]; then
        log_info "Updating existing backstage client..."
        curl -sk -X PUT \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${CLIENT_ID}" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$CLIENT_CONFIG"
    else
        log_info "Creating backstage client..."
        curl -sk -X POST \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$CLIENT_CONFIG"
        
        # Get the newly created client ID
        CLIENT_ID=$(curl -sk \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=backstage" | jq -r '.[0].id')
    fi
    
    # Get client secret
    BACKSTAGE_SECRET=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${CLIENT_ID}/client-secret" | jq -r '.value')
    
    log_success "Backstage client configured"
    echo "  Client ID: backstage"
    echo "  Client Secret: ${BACKSTAGE_SECRET}"
    
    # Store for later use
    export BACKSTAGE_CLIENT_ID="backstage"
    export BACKSTAGE_CLIENT_SECRET="$BACKSTAGE_SECRET"
}

# Create or update the mcp-server client
setup_mcp_client() {
    log_info "Setting up 'mcp-server' client..."
    
    # Check if client exists
    CLIENT_ID=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=mcp-server" | jq -r '.[0].id // empty')
    
    CLIENT_CONFIG='{
        "clientId": "mcp-server",
        "name": "MCP Server",
        "description": "Client for MCP server token validation",
        "enabled": true,
        "protocol": "openid-connect",
        "publicClient": false,
        "clientAuthenticatorType": "client-secret",
        "standardFlowEnabled": false,
        "directAccessGrantsEnabled": false,
        "serviceAccountsEnabled": true,
        "authorizationServicesEnabled": false
    }'
    
    if [ -n "$CLIENT_ID" ]; then
        log_info "Updating existing mcp-server client..."
        curl -sk -X PUT \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${CLIENT_ID}" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$CLIENT_CONFIG"
    else
        log_info "Creating mcp-server client..."
        curl -sk -X POST \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$CLIENT_CONFIG"
        
        CLIENT_ID=$(curl -sk \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=mcp-server" | jq -r '.[0].id')
    fi
    
    # Get client secret
    MCP_SECRET=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${CLIENT_ID}/client-secret" | jq -r '.value')
    
    log_success "MCP Server client configured"
    echo "  Client ID: mcp-server"
    echo "  Client Secret: ${MCP_SECRET}"
    
    export MCP_CLIENT_ID="mcp-server"
    export MCP_CLIENT_SECRET="$MCP_SECRET"
}

# Add group mapper to backstage client
setup_group_mapper() {
    log_info "Setting up group mapper on backstage client..."
    
    # Get backstage client ID
    CLIENT_ID=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=backstage" | jq -r '.[0].id')
    
    # Get dedicated client scope ID
    SCOPE_ID=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${CLIENT_ID}/dedicated-client-scopes" | jq -r '.[0].id')
    
    if [ -z "$SCOPE_ID" ] || [ "$SCOPE_ID" == "null" ]; then
        # Use default client scopes
        SCOPE_ID=$(curl -sk \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/client-scopes" | jq -r '.[] | select(.name == "profile") | .id')
    fi
    
    # Check if mapper already exists
    MAPPER_EXISTS=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/client-scopes/${SCOPE_ID}/protocol-mappers/models" | jq -r '.[] | select(.name == "groups") | .id // empty')
    
    MAPPER_CONFIG='{
        "name": "groups",
        "protocol": "openid-connect",
        "protocolMapper": "oidc-group-membership-mapper",
        "consentRequired": false,
        "config": {
            "full.path": "false",
            "id.token.claim": "true",
            "access.token.claim": "true",
            "claim.name": "groups",
            "userinfo.token.claim": "true"
        }
    }'
    
    if [ -n "$MAPPER_EXISTS" ]; then
        log_info "Group mapper already exists, updating..."
        curl -sk -X PUT \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/client-scopes/${SCOPE_ID}/protocol-mappers/models/${MAPPER_EXISTS}" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$MAPPER_CONFIG"
    else
        log_info "Creating group mapper..."
        curl -sk -X POST \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/client-scopes/${SCOPE_ID}/protocol-mappers/models" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$MAPPER_CONFIG"
    fi
    
    log_success "Group mapper configured"
}

# Add audience mapper for mcp-server
setup_audience_mapper() {
    log_info "Setting up audience mapper for mcp-server..."
    
    # Get backstage client ID
    CLIENT_ID=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=backstage" | jq -r '.[0].id')
    
    # Get dedicated client scope ID
    SCOPE_ID=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${CLIENT_ID}/dedicated-client-scopes" | jq -r '.[0].id')
    
    if [ -z "$SCOPE_ID" ] || [ "$SCOPE_ID" == "null" ]; then
        SCOPE_ID=$(curl -sk \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/client-scopes" | jq -r '.[] | select(.name == "profile") | .id')
    fi
    
    # Check if mapper already exists
    MAPPER_EXISTS=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/client-scopes/${SCOPE_ID}/protocol-mappers/models" | jq -r '.[] | select(.name == "mcp-server-audience") | .id // empty')
    
    MAPPER_CONFIG='{
        "name": "mcp-server-audience",
        "protocol": "openid-connect",
        "protocolMapper": "oidc-audience-mapper",
        "consentRequired": false,
        "config": {
            "included.client.audience": "mcp-server",
            "id.token.claim": "false",
            "access.token.claim": "true"
        }
    }'
    
    if [ -n "$MAPPER_EXISTS" ]; then
        log_info "Audience mapper already exists, updating..."
        curl -sk -X PUT \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/client-scopes/${SCOPE_ID}/protocol-mappers/models/${MAPPER_EXISTS}" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$MAPPER_CONFIG"
    else
        log_info "Creating audience mapper..."
        curl -sk -X POST \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/client-scopes/${SCOPE_ID}/protocol-mappers/models" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$MAPPER_CONFIG"
    fi
    
    log_success "Audience mapper configured"
}

# Create groups
setup_groups() {
    log_info "Setting up groups..."
    
    for GROUP_NAME in "agentic-chat-users" "rhdh-team"; do
        # Check if group exists
        GROUP_EXISTS=$(curl -sk \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/groups?search=${GROUP_NAME}" | jq -r ".[] | select(.name == \"${GROUP_NAME}\") | .id // empty")
        
        if [ -n "$GROUP_EXISTS" ]; then
            log_info "Group '${GROUP_NAME}' already exists"
        else
            log_info "Creating group '${GROUP_NAME}'..."
            curl -sk -X POST \
                "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/groups" \
                -H "Authorization: Bearer ${ADMIN_TOKEN}" \
                -H "Content-Type: application/json" \
                -d "{\"name\": \"${GROUP_NAME}\"}"
            log_success "Group '${GROUP_NAME}' created"
        fi
    done
}

# Create user helper function
create_user() {
    local USERNAME="$1"
    local EMAIL="$2"
    local PASSWORD="$3"
    local GROUPS="$4"  # Comma-separated list
    
    log_info "Setting up user '${USERNAME}'..."
    
    # Check if user exists
    USER_ID=$(curl -sk \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=${USERNAME}&exact=true" | jq -r '.[0].id // empty')
    
    USER_CONFIG="{
        \"username\": \"${USERNAME}\",
        \"email\": \"${EMAIL}\",
        \"emailVerified\": true,
        \"enabled\": true,
        \"firstName\": \"$(echo $USERNAME | sed 's/.*/\u&/')\",
        \"lastName\": \"User\"
    }"
    
    if [ -n "$USER_ID" ]; then
        log_info "User '${USERNAME}' already exists, updating..."
        curl -sk -X PUT \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${USER_ID}" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$USER_CONFIG"
    else
        log_info "Creating user '${USERNAME}'..."
        curl -sk -X POST \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users" \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$USER_CONFIG"
        
        USER_ID=$(curl -sk \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=${USERNAME}&exact=true" | jq -r '.[0].id')
    fi
    
    # Set password
    log_info "Setting password for '${USERNAME}'..."
    curl -sk -X PUT \
        "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${USER_ID}/reset-password" \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"password\",
            \"value\": \"${PASSWORD}\",
            \"temporary\": false
        }"
    
    # Add to groups
    if [ -n "$GROUPS" ]; then
        IFS=',' read -ra GROUP_ARRAY <<< "$GROUPS"
        for GROUP_NAME in "${GROUP_ARRAY[@]}"; do
            GROUP_ID=$(curl -sk \
                -H "Authorization: Bearer ${ADMIN_TOKEN}" \
                "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/groups?search=${GROUP_NAME}" | jq -r ".[] | select(.name == \"${GROUP_NAME}\") | .id")
            
            if [ -n "$GROUP_ID" ]; then
                log_info "Adding '${USERNAME}' to group '${GROUP_NAME}'..."
                curl -sk -X PUT \
                    "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${USER_ID}/groups/${GROUP_ID}" \
                    -H "Authorization: Bearer ${ADMIN_TOKEN}"
            fi
        done
    fi
    
    log_success "User '${USERNAME}' configured"
}

# Setup test users
setup_users() {
    # Developer user - has access to LSS
    create_user "developer" "developer@example.com" "${DEVELOPER_PASSWORD}" "agentic-chat-users,rhdh-team"
    
    # User1 - does NOT have access to LSS
    create_user "user1" "user1@example.com" "${USER1_PASSWORD}" ""
}

# Generate output configuration
generate_output() {
    log_info "Generating configuration output..."
    
    OUTPUT_FILE="keycloak-config.env"
    
    cat > "$OUTPUT_FILE" << EOF
# Keycloak Configuration for LSS
# Generated on $(date)
# Keycloak Version: Tested with 22.x, 24.x, 25.x

# Keycloak Server
KEYCLOAK_URL=${KEYCLOAK_URL}
KEYCLOAK_REALM=${KEYCLOAK_REALM}

# Backstage Client (for OIDC authentication)
BACKSTAGE_CLIENT_ID=backstage
BACKSTAGE_CLIENT_SECRET=${BACKSTAGE_CLIENT_SECRET}

# MCP Server Client (for token validation)
MCP_CLIENT_ID=mcp-server
MCP_CLIENT_SECRET=${MCP_CLIENT_SECRET}

# OIDC Metadata URL (for Backstage config)
OIDC_METADATA_URL=${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration

# Test Users
# developer:${DEVELOPER_PASSWORD} - Has agenticChat.access (in agentic-chat-users group)
# user1:${USER1_PASSWORD} - Does NOT have agenticChat.access
EOF

    log_success "Configuration saved to: ${OUTPUT_FILE}"
    echo ""
    echo "============================================"
    echo "  KEYCLOAK CONFIGURATION COMPLETE"
    echo "============================================"
    echo ""
    cat "$OUTPUT_FILE"
    echo ""
}

# Main execution
main() {
    echo "============================================"
    echo "  LSS - Keycloak Setup Script"
    echo "============================================"
    echo ""
    
    validate_config
    get_admin_token
    ensure_realm
    setup_backstage_client
    setup_mcp_client
    setup_group_mapper
    setup_audience_mapper
    setup_groups
    setup_users
    generate_output
    
    echo ""
    log_success "Keycloak setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Source the config: source keycloak-config.env"
    echo "  2. Configure Backstage: ./02-backstage-config.sh"
    echo "  3. Configure MCP Server: ./03-mcp-server-config.sh"
    echo "  4. Validate setup: ./04-validate-setup.sh"
}

main "$@"

