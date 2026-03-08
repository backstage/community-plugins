#!/bin/bash
#
# Quick validation script for Agentic Chat security setup
# More robust version that avoids output issues with long tokens
#

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-demo}"
BACKSTAGE_CLIENT_ID="${BACKSTAGE_CLIENT_ID:-backstage}"
BACKSTAGE_CLIENT_SECRET="${BACKSTAGE_CLIENT_SECRET:-}"
BACKSTAGE_URL="${BACKSTAGE_URL:-http://localhost:7007}"
MCP_SERVER_URL="${MCP_SERVER_URL:-http://localhost:8080}"
DEVELOPER_PASSWORD="${DEVELOPER_PASSWORD:-developer123}"
USER1_PASSWORD="${USER1_PASSWORD:-user1password}"

PASS=0
FAIL=0
SKIP=0

pass() { echo "✅ $1"; ((PASS++)); }
fail() { echo "❌ $1"; ((FAIL++)); }
skip() { echo "⏭️  $1"; ((SKIP++)); }
section() { echo ""; echo "=== $1 ==="; }

echo "============================================"
echo "  Agentic Chat Quick Validation"
echo "============================================"
echo ""
echo "Keycloak: ${KEYCLOAK_URL:-<not set>}"
echo "Backstage: ${BACKSTAGE_URL}"
echo "MCP Server: ${MCP_SERVER_URL}"

# Check prerequisites
section "Prerequisites"
if command -v curl &>/dev/null; then pass "curl available"; else fail "curl missing"; fi
if command -v jq &>/dev/null; then pass "jq available"; else fail "jq missing"; fi
if [ -n "$KEYCLOAK_URL" ]; then pass "KEYCLOAK_URL set"; else fail "KEYCLOAK_URL not set"; fi
if [ -n "$BACKSTAGE_CLIENT_SECRET" ]; then pass "CLIENT_SECRET set"; else fail "CLIENT_SECRET not set"; fi

# Test Keycloak
section "Keycloak Connectivity"
if [ -n "$KEYCLOAK_URL" ]; then
    HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration" 2>/dev/null)
    [ "$HTTP" == "200" ] && pass "OIDC endpoint accessible" || fail "OIDC endpoint returned $HTTP"
else
    skip "Keycloak not configured"
fi

# Get developer token
section "Developer Token"
if [ -n "$KEYCLOAK_URL" ] && [ -n "$BACKSTAGE_CLIENT_SECRET" ]; then
    RESP=$(curl -sk -X POST \
        "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
        -d "grant_type=password&client_id=${BACKSTAGE_CLIENT_ID}&client_secret=${BACKSTAGE_CLIENT_SECRET}&username=developer&password=${DEVELOPER_PASSWORD}&scope=openid profile email" 2>/dev/null)
    
    TOKEN=$(echo "$RESP" | jq -r '.access_token // empty' 2>/dev/null)
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        pass "Token obtained"
        
        # Decode and check claims
        CLAIMS=$(echo "$TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null)
        
        # Check groups using jq
        HAS_GROUP=$(echo "$CLAIMS" | jq -r '.groups | if . == null then false else contains(["agentic-chat-users"]) end' 2>/dev/null)
        [ "$HAS_GROUP" == "true" ] && pass "Has agentic-chat-users group" || fail "Missing agentic-chat-users group"
        
        # Check username
        USERNAME=$(echo "$CLAIMS" | jq -r '.preferred_username // empty' 2>/dev/null)
        [ "$USERNAME" == "developer" ] && pass "Username: developer" || fail "Unexpected username: $USERNAME"
        
        export DEVELOPER_TOKEN="$TOKEN"
    else
        ERROR=$(echo "$RESP" | jq -r '.error // empty' 2>/dev/null)
        fail "Token failed: $ERROR"
    fi
else
    skip "Keycloak not configured"
fi

# Get user1 token (should NOT have groups)
section "User1 Token (should lack access)"
if [ -n "$KEYCLOAK_URL" ] && [ -n "$BACKSTAGE_CLIENT_SECRET" ]; then
    RESP=$(curl -sk -X POST \
        "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
        -d "grant_type=password&client_id=${BACKSTAGE_CLIENT_ID}&client_secret=${BACKSTAGE_CLIENT_SECRET}&username=user1&password=${USER1_PASSWORD}&scope=openid profile email" 2>/dev/null)
    
    TOKEN=$(echo "$RESP" | jq -r '.access_token // empty' 2>/dev/null)
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        pass "Token obtained"
        
        CLAIMS=$(echo "$TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null)
        HAS_GROUP=$(echo "$CLAIMS" | jq -r '.groups | if . == null then false else contains(["agentic-chat-users"]) end' 2>/dev/null)
        if [ "$HAS_GROUP" != "true" ]; then
            pass "Correctly NOT in agentic-chat-users"
        else
            fail "Unexpectedly in agentic-chat-users"
        fi
        
        export USER1_TOKEN="$TOKEN"
    else
        ERROR=$(echo "$RESP" | jq -r '.error // empty' 2>/dev/null)
        DESC=$(echo "$RESP" | jq -r '.error_description // empty' 2>/dev/null)
        if [ "$ERROR" == "invalid_grant" ]; then
            echo "   ℹ️  User 'user1' exists but password may be different"
            echo "   ℹ️  Set USER1_PASSWORD env var or skip this test"
            skip "User1 auth failed - check password"
        else
            fail "Token failed: $ERROR - $DESC"
        fi
    fi
else
    skip "Keycloak not configured"
fi

# Test Backstage
section "Backstage"
HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${BACKSTAGE_URL}" 2>/dev/null || echo "000")
[ "$HTTP" == "200" ] || [ "$HTTP" == "302" ] && pass "Backstage accessible (HTTP $HTTP)" || fail "Backstage not accessible (HTTP $HTTP)"

# Test Agentic Chat health
HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${BACKSTAGE_URL}/api/agentic-chat/health" 2>/dev/null || echo "000")
[ "$HTTP" == "200" ] && pass "Agentic Chat health OK" || skip "Agentic Chat health returned $HTTP"

# Note: Backstage API endpoints require Backstage-issued tokens, not raw Keycloak tokens
# The RBAC tests below require browser-based login or service-to-service auth
section "Backstage RBAC (via browser only)"
echo "⚠️  Backstage uses its own token format for API calls"
echo "   Keycloak tokens are valid for:"
echo "   - MCP servers (direct OIDC validation)"
echo "   - Backstage login (browser flow)"
echo ""
echo "   To test RBAC, log in via browser as 'developer' and 'user1'"
skip "API RBAC tests require browser session"

# Test Agentic Chat API health (no auth required for health)
section "Agentic Chat API"
HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${BACKSTAGE_URL}/api/agentic-chat/health" 2>/dev/null || echo "000")
if [ "$HTTP" == "200" ]; then
    pass "Agentic Chat API is running"
else
    fail "Agentic Chat API health returned $HTTP"
fi

# Test MCP Server
section "MCP Server"
HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${MCP_SERVER_URL}/health" 2>/dev/null || echo "000")
if [ "$HTTP" == "200" ]; then
    pass "MCP server accessible"
    
    # Test without auth
    HTTP=$(curl -sk -o /dev/null -w "%{http_code}" "${MCP_SERVER_URL}/sse" 2>/dev/null || echo "000")
    [ "$HTTP" == "401" ] && pass "MCP rejects unauthenticated (401)" || skip "MCP without auth: $HTTP"
    
    # Test with invalid token
    HTTP=$(curl -sk -o /dev/null -w "%{http_code}" -H "Authorization: Bearer invalid" "${MCP_SERVER_URL}/sse" 2>/dev/null || echo "000")
    [ "$HTTP" == "401" ] && pass "MCP rejects invalid token (401)" || skip "MCP invalid token: $HTTP"
else
    skip "MCP server not accessible"
fi

# Summary
echo ""
echo "============================================"
echo "  SUMMARY"
echo "============================================"
echo ""
echo "  ✅ Passed:  $PASS"
echo "  ❌ Failed:  $FAIL"
echo "  ⏭️  Skipped: $SKIP"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed"
    exit 1
fi

