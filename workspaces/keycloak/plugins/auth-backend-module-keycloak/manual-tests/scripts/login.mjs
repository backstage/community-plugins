/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Obtain Backstage bearer tokens via the Keycloak OAuth flow (no frontend required).
 */

import { parseArgs } from 'node:util';

const BACKSTAGE_BASE_URL = process.env.BASE_URL || 'http://localhost:7007';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const HOST_REWRITES = (process.env.KEYCLOAK_HOST_REWRITE || '')
  .split(',')
  .map(r => r.trim())
  .filter(r => r.includes('='))
  .map(r => {
    const [old, replacement] = r.split('=', 2);
    return [old.trim(), replacement.trim()];
  });

function rewriteUrl(url) {
  let rewritten = url;
  for (const [old, replacement] of HOST_REWRITES) {
    rewritten = rewritten.replaceAll(old, replacement);
  }
  return rewritten;
}

const MAX_REDIRECT_HOPS = 20;
const CATALOG_USER_RETRY_SECONDS = 15;
const CATALOG_USER_RETRY_INTERVAL_MS = 1000;

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  update(response) {
    const setCookies = response.headers.getSetCookie?.() ?? [];
    for (const header of setCookies) {
      const [pair] = header.split(';', 1);
      const eqIdx = pair.indexOf('=');
      if (eqIdx > 0) {
        this.cookies.set(
          pair.slice(0, eqIdx).trim(),
          pair.slice(eqIdx + 1).trim(),
        );
      }
    }
  }

  header() {
    if (this.cookies.size === 0) return undefined;
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

async function followRedirects(jar, response) {
  let resp = response;
  for (let i = 0; i < MAX_REDIRECT_HOPS; i++) {
    const status = resp.status;
    if (![301, 302, 303, 307, 308].includes(status)) break;

    const location = resp.headers.get('location');
    if (!location) break;

    const target = rewriteUrl(location);
    const headers = {};
    const cookie = jar.header();
    if (cookie) headers.cookie = cookie;

    // 301/302/303 → GET; 307/308 → preserve method
    resp = await fetch(target, { redirect: 'manual', headers });
    jar.update(resp);
  }
  return resp;
}

async function assertCatalogUserReady() {
  const staticToken = process.env.BACKSTAGE_DEV_STATIC_TOKEN;
  if (!staticToken) return;

  const deadline = Date.now() + CATALOG_USER_RETRY_SECONDS * 1000;
  const url = `${BACKSTAGE_BASE_URL}/api/catalog/entities/by-name/user/default/test`;

  while (Date.now() < deadline) {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${staticToken}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (resp.status !== 404) {
      if (!resp.ok) {
        throw new Error(
          `Catalog check failed: ${resp.status} ${resp.statusText}`,
        );
      }
      return;
    }

    await new Promise(r => setTimeout(r, CATALOG_USER_RETRY_INTERVAL_MS));
  }

  throw new Error(
    "Catalog User 'test' not found after waiting — wait a few seconds after starting " +
      'the auth dev harness, or restart it after any change to ' +
      'manual-tests/catalog/users.yaml: ' +
      'yarn workspace @backstage-community/plugin-auth-backend-module-keycloak-provider start',
  );
}

async function getBackstageToken(username, password) {
  const jar = new CookieJar();

  const startUrl =
    `${BACKSTAGE_BASE_URL}/api/auth/keycloak/start` +
    `?env=development&scope=openid+profile+email` +
    `&origin=${encodeURIComponent(FRONTEND_URL)}&flow=popup`;

  let resp = await fetch(startUrl, { redirect: 'manual' });
  jar.update(resp);
  resp = await followRedirects(jar, resp);

  const html = await resp.text();

  const actionMatch = html.match(/action="([^"]+)"/);
  if (!actionMatch) {
    const errorMatch = html.match(
      /id="kc-error-message"[^>]*>.*?<p class="instruction">([^<]+)<\/p>/s,
    );
    if (errorMatch) {
      throw new Error(
        `Keycloak authorization failed at ${resp.url}: ${errorMatch[1].trim()}`,
      );
    }
    throw new Error(`No Keycloak login form found at ${resp.url}`);
  }

  const loginUrl = rewriteUrl(actionMatch[1].replaceAll('&amp;', '&'));

  const loginBody = new URLSearchParams({
    username,
    password,
    credentialId: '',
  });

  const loginHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const cookie = jar.header();
  if (cookie) loginHeaders.cookie = cookie;

  let loginResp = await fetch(loginUrl, {
    method: 'POST',
    headers: loginHeaders,
    body: loginBody.toString(),
    redirect: 'manual',
  });
  jar.update(loginResp);
  loginResp = await followRedirects(jar, loginResp);

  if (!loginResp.ok) {
    throw new Error(
      `Login POST failed: ${loginResp.status} ${loginResp.statusText}`,
    );
  }

  const responseText = await loginResp.text();

  const authMatch = responseText.match(/decodeURIComponent\('([^']+)'\)/);
  if (!authMatch) {
    throw new Error(`No auth response in handler/frame for ${username}`);
  }

  const authData = JSON.parse(decodeURIComponent(authMatch[1]));
  if (authData.error) {
    const message =
      typeof authData.error === 'object'
        ? authData.error.message || JSON.stringify(authData.error)
        : authData.error;
    throw new Error(`Auth error for ${username}: ${message}`);
  }

  const token = authData?.response?.backstageIdentity?.token;
  if (!token) {
    throw new Error(`No backstageIdentity token for ${username}`);
  }

  return token;
}

async function main() {
  const { values } = parseArgs({
    options: {
      user: { type: 'string', default: 'test' },
      password: { type: 'string', default: 'test' },
    },
  });

  await assertCatalogUserReady();
  const token = await getBackstageToken(values.user, values.password);
  process.stdout.write(`${token}\n`);
}

main().catch(err => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
