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
import type { EventsService } from '@backstage/plugin-events-node';

/**
 * Cache structure for storing template version information
 *
 * @internal
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
 * @param eventsService - The events service for emitting events
 *
 * @internal
 */
export async function handleTemplateVersion(
  entityRef: string,
  currentVersion: string,
  cache: CatalogProcessorCache,
  eventsService?: EventsService,
): Promise<void> {
  const cacheKey = `template-version-${entityRef}`;
  const cachedData = (await cache.get(cacheKey)) as
    | TemplateVersionCache
    | undefined;

  if (cachedData && cachedData.version < currentVersion) {
    if (eventsService) {
      await eventsService.publish({
        topic: 'software.template.update',
        eventPayload: {
          entityRef,
          previousVersion: cachedData.version,
          currentVersion,
        },
      });
    }
  }

  await cache.set(cacheKey, {
    version: currentVersion,
  });
}
