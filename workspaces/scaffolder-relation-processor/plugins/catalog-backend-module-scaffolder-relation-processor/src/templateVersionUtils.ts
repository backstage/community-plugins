/*
 * Copyright 2024 The Backstage Authors
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
import type { CatalogProcessorCache } from '@backstage/plugin-catalog-node';

/**
 * Cache structure for storing template version information
 *
 * @public
 */
export interface TemplateVersionCache {
  version: string;
}

/**
 * Handles template version checking and caching
 *
 * @param entityRef - The string reference of the template entity
 * @param currentVersion - The current version of the template
 * @param cache - The catalog processor cache
 *
 * @public
 */
export async function handleTemplateVersion(
  entityRef: string,
  currentVersion: string,
  cache: CatalogProcessorCache,
): Promise<void> {
  const cacheKey = `template-version-${entityRef}`;
  const cachedData = (await cache.get(cacheKey)) as
    | TemplateVersionCache
    | undefined;

  if (cachedData) {
    if (cachedData.version < currentVersion) {
      console.log(
        `Template ${entityRef} version was updated from ${cachedData.version} to ${currentVersion}`,
      );
      // I will emit an event here
    }
  }

  await cache.set(cacheKey, {
    version: currentVersion,
  });
}
