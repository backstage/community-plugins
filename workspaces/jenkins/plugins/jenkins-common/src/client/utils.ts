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
import { type Response } from 'node-fetch';

export function addQueryParams(
  u: URL,
  q: Record<string, string | number | undefined>,
): URL {
  // Create duplicate of URL, do not mutate original
  const dup = new URL(u.toString());
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined) {
      continue;
    }
    dup.searchParams.set(k, String(v));
  }

  return dup;
}

export function joinUrl(base: string, path: string): string {
  let dupBase = base;
  if (!dupBase.endsWith('/')) {
    dupBase += '/';
  }
  return dupBase + path;
}

export function trimLeadingSlash(p: string): string {
  return p.startsWith('/') ? p.slice(1) : p;
}

export function ensureTrailingSlash(u: string): string {
  return u.endsWith('/') ? u : `${u}/`;
}

export async function safeExtractText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '<no response body>';
  }
}
