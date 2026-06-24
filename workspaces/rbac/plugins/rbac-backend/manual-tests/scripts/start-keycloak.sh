#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REALM_FILE="${REALM_FILE:-$SCRIPT_DIR/../keycloak/backstage-realm.json}"
KEYCLOAK_IMAGE="${KEYCLOAK_IMAGE:-quay.io/keycloak/keycloak:22.0.1}"
KEYCLOAK_PORT="${KEYCLOAK_PORT:-8080}"

if [[ ! -f "$REALM_FILE" ]]; then
  echo "ERROR: Keycloak realm file not found: $REALM_FILE" >&2
  exit 1
fi

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  RUNTIME=docker
elif command -v podman >/dev/null 2>&1 && podman info >/dev/null 2>&1; then
  RUNTIME=podman
else
  echo "ERROR: Start Docker or Podman, then rerun this script." >&2
  exit 1
fi

SELINUX_SUFFIX=""
if [[ "$(uname -s)" = "Linux" ]] && command -v getenforce >/dev/null 2>&1; then
  if [[ "$(getenforce)" != "Disabled" ]]; then
    SELINUX_SUFFIX=":z"
  fi
fi

echo "Starting Keycloak on http://localhost:${KEYCLOAK_PORT} (realm: backstage)"
echo "Admin console: http://localhost:${KEYCLOAK_PORT}/admin (admin / admin)"
echo "Realm file: $REALM_FILE"

exec "$RUNTIME" run --rm -p "${KEYCLOAK_PORT}:8080" \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "${REALM_FILE}:/opt/keycloak/data/import/backstage-realm.json${SELINUX_SUFFIX}" \
  "$KEYCLOAK_IMAGE" \
  start-dev --import-realm
