#!/bin/bash

# Variables
KEYCLOAK_URL=$(oc get route tackle -n konveyor-tackle -o jsonpath='{.spec.host}')
KEYCLOAK_URL="https://${KEYCLOAK_URL}/auth"
echo "Using Keycloak URL: $KEYCLOAK_URL"

MASTER_REALM="master"
CLIENT_ID="admin-cli"
USERNAME="admin"
MTA_REALM="tackle"

# Fetch the encoded password from the secret
ENCODED_PASSWORD=$(oc get secret tackle-keycloak-sso -n konveyor-tackle -o jsonpath='{.data.admin-password}')

echo "Encoded Password: $ENCODED_PASSWORD"

# Decode the password
PASSWORD=$(echo $ENCODED_PASSWORD | base64 --decode)
echo "Decoded Password: $PASSWORD"


TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/$MASTER_REALM/protocol/openid-connect/token" \
  -d "client_id=$CLIENT_ID" \
  -d "username=$USERNAME" \
  -d "password=$PASSWORD" \
  -d "grant_type=password" | jq -r '.access_token')
echo "Access Token: $TOKEN"

# Define new client JSON
NEW_CLIENT_JSON=$(cat <<EOF
{
  "clientId": "backstage-provider",
  "enabled": true,
  "secret": "backstage-provider-secret",
  "redirectUris": [
    "*"
  ],
  "webOrigins": [],
  "protocol": "openid-connect",
  "attributes": {
    "access.token.lifespan": "900"
  },
  "publicClient": false,
  "bearerOnly": false,
  "consentRequired": false,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true,
  "serviceAccountsEnabled": true
}
EOF
)

# Create the new client
CREATE_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms/$MTA_REALM/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$NEW_CLIENT_JSON")
echo "Create Client Response: $CREATE_RESPONSE"

# Get the client ID dynamically
CLIENT_UUID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$MTA_REALM/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq -r '.[] | select(.clientId=="backstage-provider") | .id')
echo "Client UUID: $CLIENT_UUID"

# Fetch client details using the client UUID
CLIENT_DETAILS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$MTA_REALM/clients/$CLIENT_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "Client Details: $CLIENT_DETAILS"

# Fetch service account user ID for the client
SERVICE_ACCOUNT_USER_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$MTA_REALM/clients/$CLIENT_UUID/service-account-user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq -r '.id')
echo "Service Account User ID: $SERVICE_ACCOUNT_USER_ID"

# Fetch role IDs
TACKLE_ADMIN_ROLE_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$MTA_REALM/roles/tackle-admin" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.id')
echo "Tackle Admin Role ID: $TACKLE_ADMIN_ROLE_ID"

DEFAULT_ROLES_MTA_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$MTA_REALM/roles/default-roles-tackle" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.id')
echo "Default Roles MTA ID: $DEFAULT_ROLES_MTA_ID"

# Prepare role assignment JSON using the fetched IDs
ASSIGN_ROLES_PAYLOAD=$(cat <<EOF
[
  {
    "id": "$TACKLE_ADMIN_ROLE_ID",
    "name": "tackle-admin"
  },
  {
    "id": "$DEFAULT_ROLES_MTA_ID",
    "name": "default-roles-tackle"
  }
]
EOF
)
echo "Assign Roles Payload: $ASSIGN_ROLES_PAYLOAD"


# Assign roles to the service account
ASSIGN_ROLES_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms/$MTA_REALM/users/$SERVICE_ACCOUNT_USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ASSIGN_ROLES_PAYLOAD")
echo "Assign Roles Response: $ASSIGN_ROLES_RESPONSE"

echo "Roles assigned to the service account of client 'backstage-provider'."

DESIRABLE_SCOPES=(
  "acr" "addons:delete" "addons:get" "addons:post" "addons:put" "address"
  "adoptionplans:post" "analyses:delete" "analyses:get" "analyses:post" "analyses:put"
  "applications.analyses:delete" "applications.analyses:get" "applications.analyses:post" "applications.analyses:put"
  "applications.assessments:get" "applications.assessments:post" "applications.bucket:delete" "applications.bucket:get"
  "applications.bucket:post" "applications.bucket:put" "applications.facts:delete" "applications.facts:get"
  "applications.facts:post" "applications.facts:put" "applications.stakeholders:put" "applications.tags:delete"
  "applications.tags:get" "applications.tags:post" "applications.tags:put" "applications:delete" "applications:get"
  "applications:post" "applications:put" "archetypes.assessments:get" "archetypes.assessments:post"
  "archetypes:delete" "archetypes:get" "archetypes:post" "archetypes:put" "assessments:delete" "assessments:get"
  "assessments:post" "assessments:put" "buckets:delete" "buckets:get" "buckets:post" "buckets:put"
  "businessservices:delete" "businessservices:get" "businessservices:post" "businessservices:put" "cache:delete"
  "cache:get" "dependencies:delete" "dependencies:get" "dependencies:post" "dependencies:put" "email"
  "files:delete" "files:get" "files:post" "files:put" "identities:delete" "identities:get" "identities:post"
  "identities:put" "imports:delete" "imports:get" "imports:post" "imports:put" "jobfunctions:delete"
  "jobfunctions:get" "jobfunctions:post" "jobfunctions:put" "microprofile-jwt" "migrationwaves:delete"
  "migrationwaves:get" "migrationwaves:post" "migrationwaves:put" "offline_access" "phone" "profile"
  "proxies:delete" "proxies:get" "proxies:post" "proxies:put" "questionnaires:delete" "questionnaires:get"
  "questionnaires:post" "questionnaires:put" "reviews:delete" "reviews:get" "reviews:post" "reviews:put"
  "roles" "rulesets:delete" "rulesets:get" "rulesets:post" "rulesets:put" "settings:delete" "settings:get"
  "settings:post" "settings:put" "stakeholdergroups:delete" "stakeholdergroups:get" "stakeholdergroups:post"
  "stakeholdergroups:put" "stakeholders:delete" "stakeholders:get" "stakeholders:post" "stakeholders:put"
  "tagcategories:delete" "tagcategories:get" "tagcategories:post" "tagcategories:put" "tags:delete" "tags:get"
  "tags:post" "tags:put" "targets:delete" "targets:get" "targets:post" "targets:put" "tasks.bucket:delete"
  "tasks.bucket:get" "tasks.bucket:post" "tasks.bucket:put" "tasks:delete" "tasks:get" "tasks:post"
  "tasks:put" "tickets:delete" "tickets:get" "tickets:post" "tickets:put" "trackers:delete" "trackers:get"
  "trackers:post" "trackers:put"
)


# Fetch all client scopes
CLIENT_SCOPES=$(curl -s "$KEYCLOAK_URL/admin/realms/$MTA_REALM/client-scopes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Define desired scopes

# Find the IDs of the desired scopes and store them in a string
SCOPE_IDS=""
for SCOPE_NAME in "${DESIRABLE_SCOPES[@]}"; do
  SCOPE_ID=$(echo $CLIENT_SCOPES | jq -r --arg SCOPE_NAME "$SCOPE_NAME" '.[] | select(.name == $SCOPE_NAME) | .id')
  if [ -n "$SCOPE_ID" ]; then
    SCOPE_IDS="$SCOPE_IDS $SCOPE_ID"
    echo "$SCOPE_NAME ID: $SCOPE_ID"
  else
    echo "Error: Scope $SCOPE_NAME not found."
  fi
done

# Client UUID
CLIENT_UUID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$MTA_REALM/clients?clientId=backstage-provider" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq -r '.[0].id')
echo "Client UUID: $CLIENT_UUID"

# Assign the found scopes to the client
for SCOPE_ID in $SCOPE_IDS; do
  ASSIGN_SCOPE_RESPONSE=$(curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$MTA_REALM/clients/$CLIENT_UUID/default-client-scopes/$SCOPE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  echo "Assigned Scope ID $SCOPE_ID to client $CLIENT_UUID"
done

echo "Assigned desired scopes to the client 'backstage-provider'."