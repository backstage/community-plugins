/*
 * Copyright 2025 The Backstage Authors
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
 * Private/internal IP ranges and cloud metadata endpoints that should never
 * be fetched as document sources to prevent SSRF.
 */
const BLOCKED_HOSTNAMES = new Set([
  'metadata.google.internal',
  'metadata.goog',
]);

const PRIVATE_IP_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /^127\./, label: 'loopback' },
  { re: /^10\./, label: 'RFC-1918' },
  { re: /^172\.(1[6-9]|2\d|3[01])\./, label: 'RFC-1918' },
  { re: /^192\.168\./, label: 'RFC-1918' },
  { re: /^169\.254\./, label: 'link-local' },
  { re: /^0\./, label: 'unspecified' },
  { re: /^::1$/, label: 'IPv6 loopback' },
  { re: /^fc[0-9a-f]{2}:/i, label: 'IPv6 ULA' },
  { re: /^fe80:/i, label: 'IPv6 link-local' },
  { re: /^::ffff:/i, label: 'IPv4-mapped IPv6' },
];

/**
 * Returns a human-readable reason string if the URL targets a private,
 * loopback, or cloud-metadata address. Returns `null` when the URL is safe.
 */
export function isPrivateUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Malformed URL is treated as blocked; return descriptive reason
    return 'invalid URL';
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, '');

  if (hostname === 'localhost') return 'localhost';
  if (BLOCKED_HOSTNAMES.has(hostname)) return `blocked host: ${hostname}`;

  for (const { re, label } of PRIVATE_IP_PATTERNS) {
    if (re.test(hostname)) return label;
  }

  if (hostname === '169.254.169.254') return 'cloud metadata endpoint';

  return null;
}
