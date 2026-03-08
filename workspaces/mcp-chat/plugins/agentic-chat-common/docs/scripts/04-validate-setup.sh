#!/bin/bash
#
# Agentic Chat - Setup Validation Script
#
# This script validates the complete Keycloak + Backstage + MCP setup:
# - Keycloak token generation
# - Token claims verification (groups, audience)
# - Backstage permission API
# - Agentic Chat backend API
# - MCP server token validation
#
# Tested with:
# - Keycloak 22.x, 24.x, 25.x
# - Backstage 1.35.x+
# - kubernetes-mcp-server v0.5.x+
#
# Usage:
#   source keycloak-config.env
#   ./04-validate-setup.sh
#
# Environment variables:
#   KEYCLOAK_URL           - Keycloak server URL
#   KEYCLOAK_REALM         - Realm name (default: demo)
#   BACKSTAGE_CLIENT_ID    - Client ID (default: backstage)
#   BACKSTAGE_CLIENT_SECRET - Client secret
#   BACKSTAGE_URL          - Backstage URL (default: http://localhost:7007)
#   MCP_SERVER_URL         - MCP server URL (default: http://localhost:8080)
#   DEVELOPER_PASSWORD     - Developer user password (default: developer123)
#   USER1_PASSWORD         - User1 password (default: user1password)
#

# Don't use set -e as we want to continue running tests even if some fail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[PASS]${NC} $1"; ((TESTS_PASSED++)); }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; ((TESTS_FAILED++)); }
log_skip() { echo -e "${YELLOW}[SKIP]${NC} $1"; ((TESTS_SKIPPED++)); }
log_section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-demo}"
BACKSTAGE_CLIENT_ID="${BACKSTAGE_CLIENT_ID:-backstage}"
BACKSTAGE_CLIENT_SECRET="${BACKSTAGE_CLIENT_SECRET:-}"
BACKSTAGE_URL="${BACKSTAGE_URL:-http://localhost:7007}"
MCP_SERVER_URL="${MCP_SERVER_URL:-http://localhost:8080}"
DEVELOPER_PASSWORD="${DEVELOPER_PASSWORD:-developer123}"
USER1_PASSWORD="${USER1_PASSWORD:-user1password}"

# Tokens (populated during tests)
DEVELOPER_TOKEN=""
USER1_TOKEN=""

# Check if required tools are available
check_prerequisites() {
    log_section "Checking Prerequisites"
    
    if command -v curl &> /dev/null; then
        log_success "curl is available"
    else
        log_fail "curl is not installed"
        exit 1
    fi
    
    if command -v jq &> /dev/null; then
        log_success "jq is available"
    else
        log_fail "jq is not installed. Install with: brew install jq"
        exit 1
    fi
    
    if [ -n "$KEYCLOAK_URL" ]; then
        log_success "KEYCLOAK_URL is set: ${KEYCLOAK_URL}"
    else
        log_fail "KEYCLOAK_URL is not set. Source keycloak-config.env first."
    fi
    
    if [ -n "$BACKSTAGE_CLIENT_SECRET" ]; then
        log_success "BACKSTAGE_CLIENT_SECRET is set"
    else
        log_fail "BACKSTAGE_CLIENT_SECRET is not set"
    fi
}

# Test Keycloak connectivity
test_keycloak_connectivity() {
    log_section "Testing Keycloak Connectivity"
    
    if [ -z "$KEYCLOAK_URL" ]; then
        log_skip "Keycloak URL not set, skipping"
        return
    fi
    
    # Test OIDC discovery endpoint
    OIDC_RESPONSE=$(curl -sk -w "%{http_code}" -o /tmp/oidc_config.json \
        "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration" 2>/dev/null)
    
    if [ "$OIDC_RESPONSE" == "200" ]; then
        log_success "Keycloak OIDC endpoint accessible"
        
        # Verify issuer
        ISSUER=$(jq -r '.issuer' /tmp/oidc_config.json)
        if [ -n "$ISSUER" ]; then
            log_success "Issuer: ${ISSUER}"
        fi
    else
        log_fail "Keycloak OIDC endpoint returned: ${OIDC_RESPONSE}"
    fi
}

# Test token generation for developer
test_developer_token() {
    log_section "Testing Developer Token Generation"
    
    if [ -z "$KEYCLOAK_URL" ] || [ -z "$BACKSTAGE_CLIENT_SECRET" ]; then
        log_skip "Missing Keycloak configuration"
        return
    fi
    
    RESPONSE=$(curl -sk -X POST \
        "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=password" \
        -d "client_id=${BACKSTAGE_CLIENT_ID}" \
        -d "client_secret=${BACKSTAGE_CLIENT_SECRET}" \
        -d "username=developer" \
        -d "password=${DEVELOPER_PASSWORD}" \
        -d "scope=openid profile email" 2>/dev/null)
    
    DEVELOPER_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token // empty')
    ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')
    
    if [ -n "$DEVELOPER_TOKEN" ] && [ "$DEVELOPER_TOKEN" != "null" ]; then
        log_success "Developer token obtained"
        
        # Decode and verify claims
        CLAIMS=$(echo "$DEVELOPER_TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null || echo "{}")
        
        # Check groups
        GROUPS=$(echo "$CLAIMS" | jq -r '.groups // empty' 2>/dev/null || echo "")
        if [[ "$GROUPS" == *"agentic-chat-users"* ]]; then
            log_success "Token contains 'agentic-chat-users' group"
        else
            log_fail "Token missing 'agentic-chat-users' group. Found: ${GROUPS}"
        fi
        
        # Check audience
        AUDIENCE=$(echo "$CLAIMS" | jq -r '.aud // empty' 2>/dev/null || echo "")
        if [[ "$AUDIENCE" == *"mcp-server"* ]]; then
            log_success "Token contains 'mcp-server' audience"
        else
            log_info "Token audience: ${AUDIENCE} (mcp-server not present - may need audience mapper)"
        fi
        
        # Check username
        USERNAME=$(echo "$CLAIMS" | jq -r '.preferred_username // empty')
        if [ "$USERNAME" == "developer" ]; then
            log_success "Token username: ${USERNAME}"
        else
            log_fail "Unexpected username: ${USERNAME}"
        fi
    else
        log_fail "Failed to get developer token. Error: ${ERROR}"
    fi
}

# Test token generation for user1 (should NOT have agentic-chat-users group)
test_user1_token() {
    log_section "Testing User1 Token Generation"
    
    if [ -z "$KEYCLOAK_URL" ] || [ -z "$BACKSTAGE_CLIENT_SECRET" ]; then
        log_skip "Missing Keycloak configuration"
        return
    fi
    
    RESPONSE=$(curl -sk -X POST \
        "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=password" \
        -d "client_id=${BACKSTAGE_CLIENT_ID}" \
        -d "client_secret=${BACKSTAGE_CLIENT_SECRET}" \
        -d "username=user1" \
        -d "password=${USER1_PASSWORD}" \
        -d "scope=openid profile email" 2>/dev/null)
    
    USER1_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token // empty')
    ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')
    
    if [ -n "$USER1_TOKEN" ] && [ "$USER1_TOKEN" != "null" ]; then
        log_success "User1 token obtained"
        
        # Decode and verify claims
        CLAIMS=$(echo "$USER1_TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null || echo "{}")
        
        # Check groups - should NOT have agentic-chat-users
        GROUPS=$(echo "$CLAIMS" | jq -r '.groups // empty' 2>/dev/null || echo "")
        if [[ "$GROUPS" == *"agentic-chat-users"* ]]; then
            log_fail "User1 should NOT be in 'agentic-chat-users' group"
        else
            log_success "User1 correctly NOT in 'agentic-chat-users' group"
        fi
    else
        log_fail "Failed to get user1 token. Error: ${ERROR}"
    fi
}

# Test Backstage health
test_backstage_health() {
    log_section "Testing Backstage Health"
    
    # Test root endpoint
    HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" "${BACKSTAGE_URL}" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "302" ]; then
        log_success "Backstage is accessible (HTTP ${HTTP_CODE})"
    elif [ "$HTTP_CODE" == "000" ]; then
        log_fail "Backstage is not reachable at ${BACKSTAGE_URL}"
        return
    else
        log_info "Backstage returned HTTP ${HTTP_CODE}"
    fi
}

# Test Agentic Chat health endpoint
test_agentic_chat_health() {
    log_section "Testing Agentic Chat Health"
    
    HTTP_CODE=$(curl -sk -o /tmp/te_health.json -w "%{http_code}" \
        "${BACKSTAGE_URL}/api/agentic-chat/health" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" == "200" ]; then
        STATUS=$(jq -r '.status // empty' /tmp/te_health.json)
        if [ "$STATUS" == "ok" ]; then
            log_success "Agentic Chat health: ok"
        else
            log_success "Agentic Chat health endpoint accessible"
        fi
    elif [ "$HTTP_CODE" == "000" ]; then
        log_skip "Agentic Chat not reachable"
    else
        log_fail "Agentic Chat health returned HTTP ${HTTP_CODE}"
    fi
}

# Test Backstage permission API for developer
test_developer_permission() {
    log_section "Testing Developer Permission (Backstage RBAC)"
    
    if [ -z "$DEVELOPER_TOKEN" ]; then
        log_skip "No developer token available"
        return
    fi
    
    RESPONSE=$(curl -sk -X POST "${BACKSTAGE_URL}/api/permission/authorize" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${DEVELOPER_TOKEN}" \
        -d '{
            "items": [{
                "permission": {
                    "type": "basic",
                    "name": "agenticChat.access",
                    "attributes": {"action": "read"}
                }
            }]
        }' 2>/dev/null)
    
    RESULT=$(echo "$RESPONSE" | jq -r '.items[0].result // empty')
    
    if [ "$RESULT" == "ALLOW" ]; then
        log_success "Developer has agenticChat.access permission"
    elif [ "$RESULT" == "DENY" ]; then
        log_fail "Developer denied agenticChat.access (check RBAC policies)"
    else
        log_fail "Unexpected permission result: ${RESULT}"
        log_info "Response: ${RESPONSE}"
    fi
}

# Test Backstage permission API for user1
test_user1_permission() {
    log_section "Testing User1 Permission (Should be DENIED)"
    
    if [ -z "$USER1_TOKEN" ]; then
        log_skip "No user1 token available"
        return
    fi
    
    RESPONSE=$(curl -sk -X POST "${BACKSTAGE_URL}/api/permission/authorize" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${USER1_TOKEN}" \
        -d '{
            "items": [{
                "permission": {
                    "type": "basic",
                    "name": "agenticChat.access",
                    "attributes": {"action": "read"}
                }
            }]
        }' 2>/dev/null)
    
    RESULT=$(echo "$RESPONSE" | jq -r '.items[0].result // empty')
    
    if [ "$RESULT" == "DENY" ]; then
        log_success "User1 correctly denied agenticChat.access"
    elif [ "$RESULT" == "ALLOW" ]; then
        log_fail "User1 should be denied but got ALLOW"
    else
        log_fail "Unexpected permission result: ${RESULT}"
    fi
}

# Test Agentic Chat API for developer
test_developer_api_access() {
    log_section "Testing Developer API Access"
    
    if [ -z "$DEVELOPER_TOKEN" ]; then
        log_skip "No developer token available"
        return
    fi
    
    for endpoint in "workflows" "status" "swim-lanes"; do
        HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" \
            "${BACKSTAGE_URL}/api/agentic-chat/${endpoint}" \
            -H "Authorization: Bearer ${DEVELOPER_TOKEN}" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" == "200" ]; then
            log_success "Developer can access /api/agentic-chat/${endpoint}"
        elif [ "$HTTP_CODE" == "403" ]; then
            log_fail "Developer blocked from /api/agentic-chat/${endpoint}"
        elif [ "$HTTP_CODE" == "000" ]; then
            log_skip "Cannot reach /api/agentic-chat/${endpoint}"
        else
            log_info "Developer /api/agentic-chat/${endpoint} returned ${HTTP_CODE}"
        fi
    done
}

# Test Agentic Chat API for user1
test_user1_api_blocked() {
    log_section "Testing User1 API Blocked"
    
    if [ -z "$USER1_TOKEN" ]; then
        log_skip "No user1 token available"
        return
    fi
    
    for endpoint in "workflows" "status" "swim-lanes"; do
        HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" \
            "${BACKSTAGE_URL}/api/agentic-chat/${endpoint}" \
            -H "Authorization: Bearer ${USER1_TOKEN}" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" == "403" ]; then
            log_success "User1 correctly blocked from /api/agentic-chat/${endpoint}"
        elif [ "$HTTP_CODE" == "200" ]; then
            log_fail "User1 should be blocked from /api/agentic-chat/${endpoint}"
        elif [ "$HTTP_CODE" == "000" ]; then
            log_skip "Cannot reach /api/agentic-chat/${endpoint}"
        else
            log_info "User1 /api/agentic-chat/${endpoint} returned ${HTTP_CODE}"
        fi
    done
}

# Test MCP server
test_mcp_server() {
    log_section "Testing MCP Server"
    
    # Test without auth
    HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" "${MCP_SERVER_URL}/sse" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" == "401" ]; then
        log_success "MCP server correctly rejects unauthenticated requests"
    elif [ "$HTTP_CODE" == "000" ]; then
        log_skip "MCP server not reachable at ${MCP_SERVER_URL}"
        return
    elif [ "$HTTP_CODE" == "200" ]; then
        log_info "MCP server allows unauthenticated access (OAuth may be disabled)"
    else
        log_info "MCP server returned HTTP ${HTTP_CODE}"
    fi
    
    # Test with developer token
    if [ -n "$DEVELOPER_TOKEN" ]; then
        HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer ${DEVELOPER_TOKEN}" \
            "${MCP_SERVER_URL}/sse" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" == "200" ]; then
            log_success "MCP server accepts developer token"
        elif [ "$HTTP_CODE" == "401" ]; then
            log_fail "MCP server rejected developer token (check audience mapper)"
        else
            log_info "MCP server with auth returned HTTP ${HTTP_CODE}"
        fi
    fi
    
    # Test with invalid token
    HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer invalid-token" \
        "${MCP_SERVER_URL}/sse" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" == "401" ]; then
        log_success "MCP server correctly rejects invalid token"
    elif [ "$HTTP_CODE" != "000" ]; then
        log_info "MCP server with invalid token returned HTTP ${HTTP_CODE}"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "============================================"
    echo "  VALIDATION SUMMARY"
    echo "============================================"
    echo ""
    echo -e "  ${GREEN}Passed:${NC}  ${TESTS_PASSED}"
    echo -e "  ${RED}Failed:${NC}  ${TESTS_FAILED}"
    echo -e "  ${YELLOW}Skipped:${NC} ${TESTS_SKIPPED}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed!${NC}"
        echo ""
        echo "Your Agentic Chat security setup is working correctly."
    else
        echo -e "${RED}✗ Some tests failed${NC}"
        echo ""
        echo "Troubleshooting tips:"
        echo "  1. Verify Keycloak configuration (users, groups, mappers)"
        echo "  2. Check Backstage RBAC policies"
        echo "  3. Verify MCP server configuration"
        echo "  4. Check logs for detailed error messages"
    fi
    echo ""
}

# Main
main() {
    echo "============================================"
    echo "  Agentic Chat - Setup Validation"
    echo "============================================"
    echo ""
    echo "Configuration:"
    echo "  KEYCLOAK_URL: ${KEYCLOAK_URL:-<not set>}"
    echo "  KEYCLOAK_REALM: ${KEYCLOAK_REALM}"
    echo "  BACKSTAGE_URL: ${BACKSTAGE_URL}"
    echo "  MCP_SERVER_URL: ${MCP_SERVER_URL}"
    
    check_prerequisites
    test_keycloak_connectivity
    test_developer_token
    test_user1_token
    test_backstage_health
    test_agentic_chat_health
    test_developer_permission
    test_user1_permission
    test_developer_api_access
    test_user1_api_blocked
    test_mcp_server
    print_summary
    
    # Exit with error if any tests failed
    [ $TESTS_FAILED -eq 0 ]
}

main "$@"

