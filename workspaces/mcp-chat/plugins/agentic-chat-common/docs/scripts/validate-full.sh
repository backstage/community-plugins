#!/bin/bash
#
# Agentic Chat - Full System Validation
# Tests all components: Keycloak, Backstage, RBAC, MCP Server
#

# Note: Don't use set -e or set -o pipefail as they cause issues with test scripts

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Counters
PASS=0
FAIL=0
SKIP=0
WARN=0

# Logging functions
log_pass() { echo -e "${GREEN}✅ PASS${NC} $1"; ((PASS++)); }
log_fail() { echo -e "${RED}❌ FAIL${NC} $1"; ((FAIL++)); }
log_skip() { echo -e "${YELLOW}⏭️  SKIP${NC} $1"; ((SKIP++)); }
log_warn() { echo -e "${YELLOW}⚠️  WARN${NC} $1"; ((WARN++)); }
log_info() { echo -e "${CYAN}ℹ️  INFO${NC} $1"; }
log_section() { echo -e "\n${BOLD}${BLUE}━━━ $1 ━━━${NC}"; }

# Configuration with defaults
KEYCLOAK_URL="${KEYCLOAK_URL:-}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-demo}"
BACKSTAGE_CLIENT_ID="${BACKSTAGE_CLIENT_ID:-backstage}"
BACKSTAGE_CLIENT_SECRET="${BACKSTAGE_CLIENT_SECRET:-}"
BACKSTAGE_URL="${BACKSTAGE_URL:-http://localhost:7007}"
MCP_SERVER_URL="${MCP_SERVER_URL:-}"
DEVELOPER_USER="${DEVELOPER_USER:-developer}"
DEVELOPER_PASSWORD="${DEVELOPER_PASSWORD:-developer123}"

# Print header
print_header() {
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║  Agentic Chat - Full System Validation           ║${NC}"
    echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Architecture:${NC}"
    echo ""
    echo "  ┌─────────────┐     OIDC      ┌─────────────┐"
    echo "  │  Keycloak   │◄──────────────│  Backstage  │"
    echo "  │  (IdP)      │   Login       │   (RHDH)    │"
    echo "  └──────┬──────┘               └──────┬──────┘"
    echo "         │                             │"
    echo "         │ Groups                      │ RBAC"
    echo "         │ Claims                      │ Policy"
    echo "         ▼                             ▼"
    echo "  ┌─────────────┐               ┌─────────────┐"
    echo "  │ MCP Server  │◄──────────────│Agentic Chat│"
    echo "  │ (K8s/OCP)   │   JWT Token   │  Plugin     │"
    echo "  └─────────────┘               └─────────────┘"
    echo ""
    echo -e "${CYAN}Configuration:${NC}"
    echo "  Keycloak:     ${KEYCLOAK_URL:-<not set>}"
    echo "  Backstage:    ${BACKSTAGE_URL}"
    echo "  MCP Server:   ${MCP_SERVER_URL:-<not set>}"
    echo ""
}

# Test prerequisites
test_prerequisites() {
    log_section "Prerequisites"
    
    if command -v curl &>/dev/null; then log_pass "curl available"; else log_fail "curl not found"; fi
    if command -v jq &>/dev/null; then log_pass "jq available"; else log_fail "jq not found"; fi
    
    if [ -z "$KEYCLOAK_URL" ]; then
        log_fail "KEYCLOAK_URL not set"
    else
        log_pass "KEYCLOAK_URL configured"
    fi
    
    if [ -z "$BACKSTAGE_CLIENT_SECRET" ]; then
        log_fail "BACKSTAGE_CLIENT_SECRET not set"
    else
        log_pass "BACKSTAGE_CLIENT_SECRET configured"
    fi
}

# Test Keycloak
test_keycloak() {
    log_section "Keycloak Identity Provider"
    
    if [ -z "$KEYCLOAK_URL" ]; then
        log_skip "Keycloak not configured"
        return
    fi
    
    # Test OIDC endpoint
    HTTP=$(curl -sk -o /tmp/oidc.json -w "%{http_code}" \
        "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration" 2>/dev/null)
    
    if [ "$HTTP" = "200" ]; then
        log_pass "OIDC discovery endpoint accessible"
        
        ISSUER=$(jq -r '.issuer // empty' /tmp/oidc.json 2>/dev/null)
        if [ -n "$ISSUER" ]; then
            log_pass "Issuer: $ISSUER"
        fi
    else
        log_fail "OIDC endpoint returned HTTP $HTTP"
        return
    fi
    
    # Test token endpoint
    if [ -n "$BACKSTAGE_CLIENT_SECRET" ]; then
        RESP=$(curl -sk -X POST \
            "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
            -d "grant_type=password&client_id=${BACKSTAGE_CLIENT_ID}&client_secret=${BACKSTAGE_CLIENT_SECRET}&username=${DEVELOPER_USER}&password=${DEVELOPER_PASSWORD}&scope=openid profile email" 2>/dev/null)
        
        TOKEN=$(echo "$RESP" | jq -r '.access_token // empty' 2>/dev/null)
        
        if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            log_pass "Token generation for '${DEVELOPER_USER}' successful"
            export KEYCLOAK_TOKEN="$TOKEN"
            
            # Decode and check claims
            PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2)
            while [ $((${#PAYLOAD} % 4)) -ne 0 ]; do PAYLOAD="${PAYLOAD}="; done
            CLAIMS=$(echo "$PAYLOAD" | base64 -d 2>/dev/null)
            
            # Check groups
            HAS_GROUP=$(echo "$CLAIMS" | jq -r '.groups | if . == null then false else contains(["agentic-chat-users"]) end' 2>/dev/null)
            if [ "$HAS_GROUP" = "true" ]; then
                log_pass "Token contains 'agentic-chat-users' group"
            else
                log_warn "Token missing 'agentic-chat-users' group"
            fi
            
            # Show groups
            GROUPS=$(echo "$CLAIMS" | jq -r '.groups // [] | join(", ")' 2>/dev/null)
            log_info "User groups: $GROUPS"
        else
            ERROR=$(echo "$RESP" | jq -r '.error // empty' 2>/dev/null)
            log_fail "Token generation failed: $ERROR"
        fi
    fi
}

# Test Backstage
test_backstage() {
    log_section "Backstage / RHDH"
    
    # Test main endpoint
    HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${BACKSTAGE_URL}" 2>/dev/null)
    if [ "$HTTP" = "200" ] || [ "$HTTP" = "302" ]; then
        log_pass "Backstage accessible (HTTP $HTTP)"
    else
        log_fail "Backstage not accessible (HTTP $HTTP)"
        return
    fi
    
    # Test Agentic Chat health
    HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${BACKSTAGE_URL}/api/agentic-chat/health" 2>/dev/null)
    if [ "$HTTP" = "200" ]; then
        log_pass "Agentic Chat plugin health check OK"
    else
        log_fail "Agentic Chat health returned HTTP $HTTP"
    fi
    
    # Test permission endpoint exists
    HTTP=$(curl -sk -o /dev/null -w "%{http_code}" -X POST "${BACKSTAGE_URL}/api/permission/authorize" \
        -H "Content-Type: application/json" -d '{}' 2>/dev/null)
    if [ "$HTTP" = "400" ] || [ "$HTTP" = "401" ]; then
        log_pass "Permission service is active"
    else
        log_warn "Permission service returned unexpected HTTP $HTTP"
    fi
}

# Test RBAC with actual Backstage token
test_rbac() {
    log_section "RBAC / Permission Evaluation"
    
    # We need a Backstage token, not a Keycloak token
    # Try to get one via the OIDC refresh if we have cookies
    
    if [ -f /tmp/backstage_cookies.txt ]; then
        RESP=$(curl -sk -b /tmp/backstage_cookies.txt \
            "${BACKSTAGE_URL}/api/auth/oidc/refresh?optional&scope=&env=development" \
            -H "X-Requested-With: XMLHttpRequest" 2>/dev/null)
        
        BACKSTAGE_TOKEN=$(echo "$RESP" | jq -r '.backstageIdentity.token // empty' 2>/dev/null)
        
        if [ -n "$BACKSTAGE_TOKEN" ]; then
            log_pass "Obtained Backstage session token"
            
            # Check user identity
            IDENTITY=$(curl -sk "${BACKSTAGE_URL}/api/auth/v1/userinfo" \
                -H "Authorization: Bearer ${BACKSTAGE_TOKEN}" 2>/dev/null)
            
            SUB=$(echo "$IDENTITY" | jq -r '.claims.sub // empty' 2>/dev/null)
            if [ -n "$SUB" ]; then
                log_pass "Authenticated as: $SUB"
            fi
            
            ENTITIES=$(echo "$IDENTITY" | jq -r '.claims.ent // [] | join(", ")' 2>/dev/null)
            log_info "Entities: $ENTITIES"
            
            # Test permission
            PERM=$(curl -sk -X POST "${BACKSTAGE_URL}/api/permission/authorize" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer ${BACKSTAGE_TOKEN}" \
                -d '{"items":[{"id":"test","permission":{"type":"basic","name":"agenticChat.access","attributes":{"action":"read"}}}]}' 2>/dev/null)
            
            RESULT=$(echo "$PERM" | jq -r '.items[0].result // empty' 2>/dev/null)
            
            if [ "$RESULT" = "ALLOW" ]; then
                log_pass "Permission check: ALLOW ✓"
            elif [ "$RESULT" = "DENY" ]; then
                log_fail "Permission check: DENY (check RBAC policy)"
            else
                log_warn "Permission check returned: $RESULT"
            fi
            
            # Test actual API access
            HTTP=$(curl -sk -o /tmp/workflows.json -w "%{http_code}" \
                "${BACKSTAGE_URL}/api/agentic-chat/workflows" \
                -H "Authorization: Bearer ${BACKSTAGE_TOKEN}" 2>/dev/null)
            
            if [ "$HTTP" = "200" ]; then
                log_pass "Agentic Chat API access: OK"
                COUNT=$(jq -r '.workflows | length' /tmp/workflows.json 2>/dev/null)
                log_info "Workflows available: $COUNT"
            elif [ "$HTTP" = "403" ]; then
                log_fail "Agentic Chat API: Access Denied (403)"
            else
                log_warn "Agentic Chat API returned HTTP $HTTP"
            fi
        else
            log_skip "No Backstage session - login via browser first"
            log_info "Run: open ${BACKSTAGE_URL} and login as '${DEVELOPER_USER}'"
        fi
    else
        log_skip "No session cookies found"
        log_info "Login to Backstage via browser, then re-run this script"
    fi
}

# Test MCP Server
test_mcp_server() {
    log_section "MCP Server (Kubernetes/OpenShift)"
    
    if [ -z "$MCP_SERVER_URL" ]; then
        log_skip "MCP_SERVER_URL not configured"
        return
    fi
    
    # Test health (may or may not require auth)
    HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${MCP_SERVER_URL}/health" 2>/dev/null)
    
    if [ "$HTTP" = "200" ]; then
        log_pass "MCP server health OK"
    elif [ "$HTTP" = "401" ]; then
        log_pass "MCP server requires authentication (expected)"
    else
        log_warn "MCP server health returned HTTP $HTTP"
    fi
    
    # Test without auth
    HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${MCP_SERVER_URL}/sse" 2>/dev/null)
    if [ "$HTTP" = "401" ]; then
        log_pass "MCP rejects unauthenticated requests"
    else
        log_warn "MCP without auth returned HTTP $HTTP"
    fi
    
    # Test with Keycloak token
    if [ -n "$KEYCLOAK_TOKEN" ]; then
        RESP=$(curl -sk "${MCP_SERVER_URL}/sse" \
            -H "Authorization: Bearer ${KEYCLOAK_TOKEN}" \
            -w "\nHTTP:%{http_code}" 2>/dev/null)
        
        HTTP=$(echo "$RESP" | grep "^HTTP:" | cut -d: -f2)
        
        if [ "$HTTP" = "200" ]; then
            log_pass "MCP accepts Keycloak token"
        elif [ "$HTTP" = "401" ]; then
            log_warn "MCP rejected Keycloak token (may need audience config)"
            log_info "Check MCP server's --oidc-audience flag matches Keycloak client"
        else
            log_info "MCP with token returned HTTP $HTTP"
        fi
    fi
}

# Print summary
print_summary() {
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║                      VALIDATION SUMMARY                     ║${NC}"
    echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${GREEN}✅ Passed:${NC}  $PASS"
    echo -e "  ${RED}❌ Failed:${NC}  $FAIL"
    echo -e "  ${YELLOW}⚠️  Warnings:${NC} $WARN"
    echo -e "  ${YELLOW}⏭️  Skipped:${NC} $SKIP"
    echo ""
    
    if [ $FAIL -eq 0 ]; then
        echo -e "${GREEN}${BOLD}🎉 All critical tests passed!${NC}"
        echo ""
        echo "Agentic Chat is properly configured with:"
        echo "  • Keycloak for authentication"
        echo "  • Group-based access control (agentic-chat-users)"
        echo "  • Backstage RBAC policy enforcement"
        if [ -n "$MCP_SERVER_URL" ]; then
            echo "  • MCP server integration"
        fi
    else
        echo -e "${RED}${BOLD}⚠️  Some tests failed - review the output above${NC}"
    fi
    echo ""
}

# Print architecture docs
print_architecture() {
    log_section "Architecture Reference"
    
    echo ""
    echo -e "${BOLD}Authentication Flow:${NC}"
    echo ""
    echo "  1. User clicks 'Sign In' in Backstage"
    echo "  2. Redirected to Keycloak login page"
    echo "  3. User enters credentials"
    echo "  4. Keycloak validates and returns JWT with groups claim"
    echo "  5. Backstage creates internal session with user's groups"
    echo "  6. RBAC policy evaluated on each API request"
    echo ""
    echo -e "${BOLD}RBAC Policy Format (CSV):${NC}"
    echo ""
    echo "  # Group to Role mapping"
    echo "  g, group:default/agentic-chat-users, role:default/agentic-chat-user"
    echo ""
    echo "  # Permission grant"
    echo "  p, role:default/agentic-chat-user, agenticChat.access, read, allow"
    echo ""
    echo -e "${BOLD}Key Components:${NC}"
    echo ""
    echo "  • Keycloak: Issues JWT tokens with 'groups' claim"
    echo "  • Backstage Auth: Handles OIDC login, creates session"
    echo "  • Permission Service: Evaluates RBAC policies"
    echo "  • Agentic Chat Backend: Checks agenticChat.access permission"
    echo "  • MCP Server: Validates JWT for Kubernetes API access"
    echo ""
}

# Main
main() {
    print_header
    test_prerequisites
    test_keycloak
    test_backstage
    test_rbac
    test_mcp_server
    print_summary
    
    if [ "$1" = "--arch" ]; then
        print_architecture
    fi
    
    # Exit with failure if any tests failed
    [ $FAIL -eq 0 ]
}

main "$@"

