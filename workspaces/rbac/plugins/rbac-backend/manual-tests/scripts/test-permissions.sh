#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CSV_FILE="${CSV_FILE:-$SCRIPT_DIR/../userinfo.csv}"
BASE_URL="${BASE_URL:-http://localhost:7007}"

if [[ ! -f "$CSV_FILE" ]]; then
  echo "ERROR: CSV not found: $CSV_FILE" >&2
  echo "Run: node $SCRIPT_DIR/login.mjs --csv $CSV_FILE" >&2
  exit 1
fi

python3 - "$CSV_FILE" "$BASE_URL" <<'PY'
import csv
import json
import sys
import urllib.error
import urllib.request

csv_path, base_url = sys.argv[1:3]
payload = json.dumps(
    {
        "items": [
            {
                "id": "manual-test",
                "resourceRef": "component:default/artist-lookup",
                "permission": {
                    "attributes": {"action": "read"},
                    "name": "catalog.entity.read",
                    "type": "resource",
                    "resourceType": "catalog-entity",
                },
            }
        ]
    }
).encode()

failures = 0
checked = 0
auth_failures = 0
auth_hint_shown = False
with open(csv_path, newline="", encoding="utf-8") as handle:
    for row in csv.reader(handle):
        if not row or row[0].startswith("#"):
            continue
        if row[0].lower() == "email":
            continue
        email = row[0]
        expected = row[2] if len(row) > 2 else ""
        token = row[3] if len(row) > 3 else ""
        if not token or token == "token":
            print(f"SKIP {email} (no token — run login.mjs first)")
            continue

        request = urllib.request.Request(
            f"{base_url}/api/permission/authorize",
            data=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                body = json.load(response)
        except urllib.error.HTTPError as exc:
            if exc.code == 401:
                auth_failures += 1
                if not auth_hint_shown:
                    auth_hint_shown = True
                    print(
                        "FAIL auth: tokens rejected (backend restarted or expired). "
                        "Re-run login.mjs against the running backend (from workspaces/rbac):\n"
                        "  node plugins/rbac-backend/manual-tests/scripts/login.mjs"
                        "--csv plugins/rbac-backend/manual-tests/userinfo.csv\n"
                    )
                print(f"FAIL {email} HTTP 401: token verification failed")
            else:
                print(f"FAIL {email} HTTP {exc.code}: {exc.read().decode()}")
                failures += 1
            continue

        result = body["items"][0]["result"]
        checked += 1
        if result == expected:
            print(f"PASS {email} expected={expected} got={result}")
        else:
            print(f"FAIL {email} expected={expected} got={result}")
            failures += 1

if auth_failures:
    print(f"{auth_failures} token(s) rejected — refresh with login.mjs before re-testing")
    sys.exit(1)

if failures:
    print(f"{failures} of {checked} permission check(s) failed")
    sys.exit(1)

print(f"All {checked} permission checks passed.")
PY
