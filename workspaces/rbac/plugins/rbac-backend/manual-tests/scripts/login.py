#!/usr/bin/env python3
"""Obtain Backstage bearer tokens via the OIDC auth flow (no frontend required)."""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.parse

try:
    import requests
except ImportError:
    print("Install requests: python3 -m pip install requests", file=sys.stderr)
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


def _follow_redirects(session: requests.Session, resp: requests.Response) -> requests.Response:
    while resp.is_redirect or resp.status_code in (301, 302, 303, 307, 308):
        location = resp.headers.get("Location", "")
        if not location:
            break
        location = _rewrite_url(location)
        if resp.status_code in (301, 302, 303):
            resp = session.get(location, allow_redirects=False)
        else:
            resp = session.request(resp.request.method, location, allow_redirects=False)
    return resp


def get_backstage_token(username: str, password: str) -> str:
    """Run the OIDC browserless login flow and return a Backstage bearer token."""
    session = requests.Session()

    start_url = (
        f"{BACKSTAGE_BASE_URL}/api/auth/oidc/start"
        f"?env=development&scope=openid+profile+email"
        f"&origin={urllib.parse.quote(FRONTEND_URL)}&flow=popup"
    )

    if _use_manual_redirects():
        resp = session.get(start_url, allow_redirects=False)
        resp = _follow_redirects(session, resp)
    else:
        resp = session.get(start_url, allow_redirects=True)
    resp.raise_for_status()

    action_match = re.search(r'action="([^"]+)"', resp.text)
    if not action_match:
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


def login_users_from_csv(csv_path: str, max_retries: int = 4) -> list[tuple[str, str, str, str]]:
    """Read user CSV and append tokens. Returns rows with token in column 4."""
    rows: list[list[str]] = []
    with open(csv_path, newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle)
        for row in reader:
            if not row or row[0].startswith("#") or row[0].lower() == "email":
                continue
            while len(row) < 4:
                row.append("")
            rows.append(row)

    updated: list[tuple[str, str, str, str]] = []
    for row in rows:
        email, password, expected = row[0], row[1], row[2]
        username = email.split("@")[0]
        token = ""
        last_error: Exception | None = None

        for attempt in range(1, max_retries + 1):
            try:
                print(f"Logging in {email} ...")
                token = get_backstage_token(username, password)
                break
            except Exception as exc:
                last_error = exc
                print(f"  attempt {attempt} failed: {exc}")
                if attempt < max_retries:
                    time.sleep(1)

        if not token:
            raise RuntimeError(
                f"Login failed for {email} after {max_retries} attempts"
            ) from last_error

        updated.append((email, password, expected, token))

    with open(csv_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerows(updated)

    return updated


def main() -> None:
    parser = argparse.ArgumentParser(description="Obtain Backstage OIDC bearer tokens")
    parser.add_argument(
        "--csv",
        default=os.path.join(os.path.dirname(__file__), "..", "userinfo.csv"),
        help="CSV file: email,password,expected[,token]",
    )
    parser.add_argument(
        "--user",
        help="Single Keycloak username (instead of CSV)",
    )
    parser.add_argument("--password", default="test", help="Password for --user")
    args = parser.parse_args()

    if args.user:
        token = get_backstage_token(args.user, args.password)
        print(token)
        return

    login_users_from_csv(os.path.abspath(args.csv))
    print(f"Updated tokens in {args.csv}")


if __name__ == "__main__":
    main()
