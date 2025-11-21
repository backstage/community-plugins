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

import { ResponseError } from '@backstage/errors';

export const buildBaseUrl = (
  baseUrl: string,
  organization: string,
  project: string,
  wikiIdentifier: string,
): string =>
  `${baseUrl}/${organization}/${project}/_apis/wiki/wikis/${wikiIdentifier}`;

export const convertStringToBase64 = (stringToConvert: string): string =>
  Buffer.from(stringToConvert).toString('base64');

export async function fetchWithRetry(
  url: Parameters<typeof fetch>[0],
  options: Parameters<typeof fetch>[1] = {},
  retries = 3,
  backoff = 300,
) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2); // exponential backoff
      }
      throw await ResponseError.fromResponse(response);
    }
    return response;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Network error, retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}
