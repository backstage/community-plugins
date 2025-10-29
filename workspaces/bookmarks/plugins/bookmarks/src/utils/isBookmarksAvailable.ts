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

import type { Entity } from '@backstage/catalog-model';

/**
 * Checks if the entity has the bookmarks object in the metadata.
 * Does not indicate that the object is a `UrlTree`
 *
 * @public
 *
 * @param entity - The entity to check
 * @returns true there is a bookmarks object in the metadata
 */
export const isBookmarksAvailable = (
  entity: Entity,
): entity is Entity & { metadata: { bookmarks?: unknown } } => {
  const bookmarks = entity?.metadata?.bookmarks;
  return (
    typeof bookmarks === 'object' &&
    bookmarks !== null &&
    !Array.isArray(bookmarks) &&
    Object.keys(bookmarks).length > 0
  );
};
