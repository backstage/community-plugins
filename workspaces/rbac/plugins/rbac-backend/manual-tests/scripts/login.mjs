#!/usr/bin/env node
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
 * Obtain Backstage bearer tokens via the OIDC auth flow (no frontend required).
 *
 * Single user:
 *   node login.mjs --user ant_man --password test
 *
 * Bulk login from CSV (updates token column in-place):
 *   node login.mjs --csv ../userinfo.csv
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  })
  .filter(([old]) => old.length > 0);

function rewriteUrl(url) {
  let rewritten = url;
  for (const [old, replacement] of HOST_REWRITES) {
    rewritten = rewritten.replaceAll(old, replacement);
  }
  return rewritten;
}

const MAX_REDIRECT_HOPS = 20;

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

async function followRedirects(jar, response, method = 'GET', body = null) {
  let resp = response;
  let currentMethod = method;
  let currentBody = body;

  for (let i = 0; i < MAX_REDIRECT_HOPS; i++) {
    const status = resp.status;
    if (![301, 302, 303, 307, 308].includes(status)) break;

    const location = resp.headers.get('location');
    if (!location) break;

    const target = rewriteUrl(location);
    const headers = {};
    const cookie = jar.header();
    if (cookie) headers.cookie = cookie;

    if ([301, 302, 303].includes(status)) {
      currentMethod = 'GET';
      currentBody = null;
    }

    resp = await fetch(target, {
      method: currentMethod,
      body: currentBody,
      redirect: 'manual',
      headers,
    });
    jar.update(resp);
  }
  return resp;
}

async function getBackstageToken(username, password) {
  const jar = new CookieJar();

  const startUrl =
    `${BACKSTAGE_BASE_URL}/api/auth/oidc/start` +
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
  loginResp = await followRedirects(
    jar,
    loginResp,
    'POST',
    loginBody.toString(),
  );

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

function parseCsv(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const fields = [];
      let current = '';
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          fields.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      fields.push(current);
      return fields;
    });
}

function toCsvLine(fields) {
  return fields
    .map(f => {
      if (f.includes(',') || f.includes('"') || f.includes('\n')) {
        return `"${f.replaceAll('"', '""')}"`;
      }
      return f;
    })
    .join(',');
}

const MAX_LOGIN_RETRIES = 4;

async function loginUsersFromCsv(csvPath) {
  const text = readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(text);
  const updated = [];

  for (const row of rows) {
    if (row[0].startsWith('#') || row[0].toLowerCase() === 'email') {
      updated.push(row);
      continue;
    }

    const email = row[0];
    const password = row[1] || 'test';
    const expected = row[2] || '';
    const username = email.split('@')[0];

    let token = '';
    let lastError;

    for (let attempt = 1; attempt <= MAX_LOGIN_RETRIES; attempt++) {
      try {
        process.stderr.write(`Logging in ${email} ...\n`);
        token = await getBackstageToken(username, password);
        break;
      } catch (err) {
        lastError = err;
        process.stderr.write(`  attempt ${attempt} failed: ${err.message}\n`);
        if (attempt < MAX_LOGIN_RETRIES) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    if (!token) {
      throw new Error(
        `Login failed for ${email} after ${MAX_LOGIN_RETRIES} attempts: ${lastError?.message}`,
      );
    }

    updated.push([email, password, expected, token]);
  }

  const csvOut = `${updated.map(toCsvLine).join('\n')}\n`;
  writeFileSync(csvPath, csvOut, 'utf-8');
  return updated;
}

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const { values } = parseArgs({
    options: {
      user: { type: 'string' },
      password: { type: 'string', default: 'test' },
      csv: { type: 'string', default: join(__dirname, '..', 'userinfo.csv') },
    },
  });

  if (values.user) {
    const token = await getBackstageToken(values.user, values.password);
    process.stdout.write(`${token}\n`);
    return;
  }

  await loginUsersFromCsv(values.csv);
  process.stderr.write(`Updated tokens in ${values.csv}\n`);
}

main().catch(err => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
