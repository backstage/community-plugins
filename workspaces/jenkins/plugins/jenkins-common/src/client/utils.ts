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

/**
 * Copies the {@link URL} object passed, appends query params and returns the resulting {@link URL}.
 *
 * @param u The {@link URL} object that will be copied
 * @param q The {@link Record<string, string | number | undefined>} that stores query params
 * @returns The resulting {@link URL} with query params.
 */
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

/**
 * Joins the base URL string with the specified path.
 * Appends a `/` to the end of the `base` if it doesn't already have it.
 *
 * @param base The base URL string
 * @param path The path that appends to the base string
 * @returns A string of the full URL
 */
export function joinUrl(base: string, path: string): string {
  let dupBase = base;
  if (!dupBase.endsWith('/')) {
    dupBase += '/';
  }
  return dupBase + path;
}

/**
 * Utility function that removes the `/` from the start of a string if it exists.
 *
 * @param p The string to trim
 * @returns The string without the leading `/`
 */
export function trimLeadingSlash(p: string): string {
  return p.startsWith('/') ? p.slice(1) : p;
}

/**
 * Utility function that ensures that string ends with `/`,
 *
 * @param u The string to modify
 * @returns The resulting string, ending with `/`
 */
export function ensureTrailingSlash(u: string): string {
  return u.endsWith('/') ? u : `${u}/`;
}

/**
 * Utility function that safely extracts the text from a response.
 * If the operation results in an error a default string is returned instead.
 *
 * @param res The {@link Response} containing the `Body.text`
 * @returns The resulting `Body.text` value or a default string if the operation failed
 */
export async function safeExtractText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '<no response body>';
  }
}
