#!/usr/bin/env python3
"""Obtain Backstage bearer tokens via the Keycloak OAuth flow (no frontend required)."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.parse

try:
    import requests
except ImportError:
    print(
        "Install deps: python3 -m pip install -r "
        "plugins/auth-backend-module-keycloak/manual-tests/requirements.txt",
        file=sys.stderr,
    )
    sys.exit(1)

BACKSTAGE_BASE_URL = os.getenv("BASE_URL", "http://localhost:7007")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

_HOST_REWRITES: list[tuple[str, str]] = []
for _rule in os.getenv("KEYCLOAK_HOST_REWRITE", "").split(","):
    _rule = _rule.strip()
    if "=" in _rule:
        _old, _new = _rule.split("=", 1)
        _HOST_REWRITES.append((_old.strip(), _new.strip()))


def _rewrite_url(url: str) -> str:
    for old, new in _HOST_REWRITES:
        url = url.replace(old, new)
    return url


def _use_manual_redirects() -> bool:
    return bool(_HOST_REWRITES)


_MAX_REDIRECT_HOPS = 20


def _follow_redirects(session: requests.Session, resp: requests.Response) -> requests.Response:
    for _ in range(_MAX_REDIRECT_HOPS):
        if not (resp.is_redirect or resp.status_code in (301, 302, 303, 307, 308)):
            break
        location = resp.headers.get("Location", "")
        if not location:
            break
        location = _rewrite_url(location)
        if resp.status_code in (301, 302, 303):
            resp = session.get(location, allow_redirects=False)
        else:
            resp = session.request(resp.request.method, location, allow_redirects=False)
    else:
        raise RuntimeError(f"Too many redirects (>{_MAX_REDIRECT_HOPS})")
    return resp


_CATALOG_USER_RETRY_SECONDS = 15
_CATALOG_USER_RETRY_INTERVAL = 1.0


def _assert_catalog_user_ready() -> None:
    static_token = os.getenv("BACKSTAGE_DEV_STATIC_TOKEN")
    if not static_token:
        return

    deadline = time.monotonic() + _CATALOG_USER_RETRY_SECONDS
    while True:
        resp = requests.get(
            f"{BACKSTAGE_BASE_URL}/api/catalog/entities/by-name/user/default/test",
            headers={"Authorization": f"Bearer {static_token}"},
            timeout=10,
        )
        if resp.status_code != 404:
            resp.raise_for_status()
            return
        if time.monotonic() >= deadline:
            break
        time.sleep(_CATALOG_USER_RETRY_INTERVAL)

    raise RuntimeError(
        "Catalog User 'test' not found after waiting — wait a few seconds after starting "
        "the auth dev harness, or restart it after any change to "
        "manual-tests/catalog/users.yaml: "
        "yarn workspace @backstage-community/plugin-auth-backend-module-keycloak-provider start"
    )


def get_backstage_token(username: str, password: str) -> str:
    """Run the Keycloak OAuth browserless login flow and return a Backstage bearer token."""
    session = requests.Session()

    start_url = (
        f"{BACKSTAGE_BASE_URL}/api/auth/keycloak/start"
        f"?env=development&scope=openid+profile+email"
        f"&origin={urllib.parse.quote(FRONTEND_URL)}&flow=popup"
    )

    if _use_manual_redirects():
        resp = session.get(start_url, allow_redirects=False)
        resp = _follow_redirects(session, resp)
    else:
        resp = session.get(start_url, allow_redirects=False)
        resp = _follow_redirects(session, resp)

    action_match = re.search(r'action="([^"]+)"', resp.text)
    if not action_match:
        error_match = re.search(
            r'id="kc-error-message"[^>]*>.*?<p class="instruction">([^<]+)</p>',
            resp.text,
            re.DOTALL,
        )
        if error_match:
            raise RuntimeError(
                f"Keycloak authorization failed at {resp.url}: {error_match.group(1).strip()}"
            )
        raise RuntimeError(f"No Keycloak login form found at {resp.url}")
    login_url = _rewrite_url(action_match.group(1).replace("&amp;", "&"))

    login_data = {"username": username, "password": password, "credentialId": ""}
    if _use_manual_redirects():
        login_resp = session.post(login_url, data=login_data, allow_redirects=False)
        login_resp = _follow_redirects(session, login_resp)
    else:
        login_resp = session.post(login_url, data=login_data, allow_redirects=True)
    login_resp.raise_for_status()

    auth_match = re.search(r"decodeURIComponent\('([^']+)'\)", login_resp.text)
    if not auth_match:
        raise RuntimeError(f"No auth response in handler/frame for {username}")

    auth_data = json.loads(urllib.parse.unquote(auth_match.group(1)))
    if "error" in auth_data:
        err = auth_data["error"]
        message = err.get("message", err) if isinstance(err, dict) else err
        raise RuntimeError(f"Auth error for {username}: {message}")

    token = auth_data.get("response", {}).get("backstageIdentity", {}).get("token", "")
    if not token:
        raise RuntimeError(f"No backstageIdentity token for {username}")

    return token


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Obtain Backstage bearer tokens via Keycloak OAuth",
    )
    parser.add_argument(
        "--user",
        default="test",
        help="Keycloak username (default: test)",
    )
    parser.add_argument(
        "--password",
        default="test",
        help="Keycloak password (default: test)",
    )
    args = parser.parse_args()

    _assert_catalog_user_ready()
    token = get_backstage_token(args.user, args.password)
    print(token)


if __name__ == "__main__":
    main()
