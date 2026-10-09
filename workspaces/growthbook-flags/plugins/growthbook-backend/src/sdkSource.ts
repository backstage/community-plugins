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

import type { FlagRow } from '@backstage-community/plugin-growthbook-common';
import { normalizeSdkFlags } from './helpers';

/** `getFlags` resolves to `undefined` when the environment has no SDK key. */
export type SdkFlagsSource = {
  getFlags(env: string): Promise<FlagRow[] | undefined>;
};

const TTL_MS = 60_000;
const MAX_ENTRIES = 200;

export function createSdkFlagsSource(options: {
  baseUrl: string;
  resolveKey: (env: string) => string | undefined;
  fetchFn?: typeof fetch;
  now?: () => number;
}): SdkFlagsSource {
  const fetchFn = options.fetchFn ?? fetch;
  const now = options.now ?? Date.now;
  const cache = new Map<string, { data: FlagRow[]; fetchedAt: number }>();

  return {
    async getFlags(env) {
      const sdkKey = options.resolveKey(env);
      if (!sdkKey) return undefined;

      const hit = cache.get(sdkKey);
      const t = now();
      if (hit && t - hit.fetchedAt < TTL_MS) return hit.data;

      const response = await fetchFn(
        `${options.baseUrl}/api/features/${sdkKey}`,
      );
      if (!response.ok) {
        throw new Error(`GrowthBook returned HTTP ${response.status}`);
      }
      const payload = (await response.json()) as {
        features?: Record<string, { defaultValue: unknown }>;
      };
      const flags = normalizeSdkFlags(payload.features ?? {});
      if (cache.has(sdkKey) || cache.size < MAX_ENTRIES) {
        cache.set(sdkKey, { data: flags, fetchedAt: t });
      }
      return flags;
    },
  };
}
