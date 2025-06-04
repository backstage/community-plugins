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
import { Entity, RELATION_OWNED_BY } from '@backstage/catalog-model';

import { arrayify } from '../utils';

/**
 * Sorts entities to the same order as the owner entity refs, and internally
 * within the same owner entity ref according to the title/name.
 */
export function orderEntities(
  items: Entity[],
  entityKind: string | readonly string[],
  ownerEntityRefs: string[],
): Entity[] {
  const kinds = Array.from(
    new Set([
      ...arrayify(entityKind).map(kind => kind.toLocaleLowerCase('en-US')),
      ...items.map(entity => entity.kind.toLocaleLowerCase('en-US')),
    ]),
  );

  const lookupItems = items.map(entity => ({
    entity,
    kind: entity.kind.toLocaleLowerCase('en-US'),
    relOwnedBy: entity.relations
      ?.find(rel => rel.type === RELATION_OWNED_BY)
      ?.targetRef?.toLocaleLowerCase('en-US'),
    title: (entity.metadata.title ?? entity.metadata.name).toLocaleLowerCase(
      'en-US',
    ),
  }));

  return (
    lookupItems
      // Sort the found entities by the:
      //  1. Order of the entity kind
      //  2. Order of the entity owner
      //  3. Order of the entity title
      .sort((a, b) => {
        if (a.kind !== b.kind) {
          return kinds.indexOf(a.kind) < kinds.indexOf(b.kind) ? -1 : 1;
        }

        const aOwner = a.relOwnedBy;
        const bOwner = b.relOwnedBy;

        if (aOwner === bOwner) {
          return a.title.localeCompare(b.title);
        }

        if (!aOwner) return -1;
        if (!bOwner) return 1;

        const aIndex = ownerEntityRefs.indexOf(aOwner);
        const bIndex = ownerEntityRefs.indexOf(bOwner);
        if (aIndex === -1) return -1;
        if (bIndex === -1) return 1;
        return aIndex - bIndex;
      })
      .map(({ entity }) => entity)
  );
}
